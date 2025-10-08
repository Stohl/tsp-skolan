import React, { useState } from 'react';
import { 
  Box, 
  Container,
  Typography,
  CircularProgress,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Refresh
} from '@mui/icons-material';

// Importera alla sidor
import OvningPage from './pages/OvningPage';
import ListorPage from './pages/ListorPage';
import LexikonPage from './pages/LexikonPage';
import KorpusPage from './pages/KorpusPage';
import InstallningarPage from './pages/InstallningarPage';
import HjalpPage from './pages/HjalpPage';
import StartGuideDialog from './components/StartGuideDialog';
import MainMenu from './components/MainMenu';

// Importera Providers
import { DatabaseProvider, useDatabase } from './contexts/DatabaseContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { useWordProgress } from './hooks/usePersistentState';
import { getAllWordLists, getWordsFromList } from './types/wordLists';

// Komponent för huvudinnehållet (efter att databaserna laddats)
function AppContent() {
  // Använd databasen och word progress hooks
  const { wordDatabase } = useDatabase();
  const { setWordLevel } = useWordProgress();
  
  // State för att hålla reda på vilken sida som är aktiv
  const [currentPage, setCurrentPage] = useState(() => {
    // Läs från URL state om det finns
    const state = window.history.state;
    return state?.page ?? 0;
  });
  // State för att hantera om hjälpsidan ska visas
  const [showHelp, setShowHelp] = useState(() => {
    const state = window.history.state;
    return state?.showHelp ?? false;
  });
  // State för att hantera om korpus-sidan ska visas
  const [showKorpus, setShowKorpus] = useState(() => {
    const state = window.history.state;
    return state?.showKorpus ?? false;
  });
  // State för att hantera start-guiden
  const [showStartGuide, setShowStartGuide] = useState(false);
  // State för att hantera dialog om att lägga till ordlistor
  const [showAddWordsDialog, setShowAddWordsDialog] = useState(false);
  // State för att hantera huvudmenyn
  const [showMenu, setShowMenu] = useState(false);

  // Helper-funktioner för att uppdatera både state och browser history
  const navigateToHelp = () => {
    window.history.pushState(
      { page: currentPage, showHelp: true, showKorpus: false },
      '',
      window.location.href
    );
    setShowHelp(true);
  };

  const navigateToKorpus = () => {
    window.history.pushState(
      { page: currentPage, showHelp: false, showKorpus: true },
      '',
      window.location.href
    );
    setShowKorpus(true);
  };

  const navigateBack = () => {
    window.history.back();
  };

  // Initiera browser history state vid första laddning
  React.useEffect(() => {
    // Om det inte finns något state, skapa initial state
    if (!window.history.state) {
      window.history.replaceState(
        { page: currentPage, showHelp: false, showKorpus: false },
        '',
        window.location.href
      );
    }
  }, []);

  // Kontrollera om användaren är ny (ingen sparad data)
  React.useEffect(() => {
    const wordProgressData = localStorage.getItem('wordProgress');
    const hasSeenGuide = localStorage.getItem('hasSeenStartGuide');
    
    // Kontrollera om wordProgress är tom eller saknas
    const hasUserData = wordProgressData && wordProgressData !== '{}' && wordProgressData !== 'null';
    
    // Visa start-guiden om användaren inte har någon data och inte har sett guiden
    if (!hasUserData && !hasSeenGuide) {
      setShowStartGuide(true);
    }
  }, []);

  // Kontrollera om användaren behöver fler ord att lära sig (bara på Övning-sidan)
  React.useEffect(() => {
    // Vänta tills databasen är laddad
    if (Object.keys(wordDatabase).length === 0) return;
    
    // Bara kontrollera på Övning-sidan (index 0)
    if (currentPage !== 0) return;
    
    // Läs direkt från localStorage för att få senaste värden
    const wordProgressData = localStorage.getItem('wordProgress');
    const currentProgress = wordProgressData ? JSON.parse(wordProgressData) : {};
    const learningWordsCount = Object.values(currentProgress).filter((word: any) => word.level === 1).length;
    const hasSeenGuide = localStorage.getItem('hasSeenStartGuide');
    const showAddWordsDialogSetting = localStorage.getItem('showAddWordsDialog') !== 'false'; // Default: true
    
    console.log(`[DEBUG] På Övning-sidan - Antal ord att lära: ${learningWordsCount}, Har sett guide: ${hasSeenGuide}, Visa dialog: ${showAddWordsDialogSetting}`);
    
    // Bara visa dialog om användaren har sett start-guiden, har färre än 20 ord OCH har aktiverat inställningen
    if (hasSeenGuide && learningWordsCount < 20 && showAddWordsDialogSetting) {
      console.log('[DEBUG] Villkor uppfyllda, kontrollerar ordlistor...');
      
      // Kontrollera om det finns tillgängliga ordlistor
      const allWordLists = getAllWordLists(wordDatabase);
      const availableWordLists = allWordLists.filter(list => {
        const wordsInList = getWordsFromList(list, wordDatabase);
        // Kontrollera om det finns ord på level 0 (som kan läggas till)
        return wordsInList.some(word => !currentProgress[word.id] || currentProgress[word.id]?.level === 0);
      });
      
      console.log(`[DEBUG] Tillgängliga ordlistor: ${availableWordLists.length}`);
      
      // Visa dialog om det finns tillgängliga ordlistor
      if (availableWordLists.length > 0) {
        setShowAddWordsDialog(true);
      }
    } else {
      console.log(`[DEBUG] Villkor INTE uppfyllda - hasSeenGuide: ${hasSeenGuide}, learningWordsCount: ${learningWordsCount}, showAddWordsDialogSetting: ${showAddWordsDialogSetting}`);
    }
  }, [wordDatabase, currentPage]);

  // Funktion för att lägga till ord från ordlistor
  const handleAddWordLists = () => {
    const wordProgressData = localStorage.getItem('wordProgress');
    const currentProgress = wordProgressData ? JSON.parse(wordProgressData) : {};
    
    const allWordLists = getAllWordLists(wordDatabase);
    const availableWordLists = allWordLists.filter(list => {
      const wordsInList = getWordsFromList(list, wordDatabase);
      // Kontrollera om det finns ord på level 0 (som kan läggas till)
      return wordsInList.some(word => !currentProgress[word.id] || currentProgress[word.id]?.level === 0);
    });
    
    // Sortera efter priority (lägre nummer = högre prioritet)
    availableWordLists.sort((a, b) => a.priority - b.priority);
    
    // Lägg till ord från de första 1-2 ordlistorna
    let addedWords = 0;
    availableWordLists.slice(0, 2).forEach(list => {
      const wordsInList = getWordsFromList(list, wordDatabase);
      wordsInList.forEach(word => {
        if (currentProgress[word.id]?.level !== 2 && currentProgress[word.id]?.level !== 1) {
          setWordLevel(word.id, 1); // Sätt till "att lära mig"
          addedWords++;
        }
      });
    });
    
    console.log(`[DEBUG] Lade till ${addedWords} ord från ordlistor`);
    setShowAddWordsDialog(false);
    
    // Uppdatera sidan för att visa nya ord
    window.dispatchEvent(new Event('storage'));
  };

  // Funktion för att navigera till ordlistor-sidan
  const handleDontAskAgain = () => {
    setShowAddWordsDialog(false);
    localStorage.setItem('showAddWordsDialog', 'false');
  };

  // Lyssna på custom event för att öppna startguiden
  React.useEffect(() => {
    const handleOpenStartGuide = () => {
      setShowStartGuide(true);
    };

    const handleNavigateToPage = (event: CustomEvent) => {
      const pageIndex = event.detail;
      setCurrentPage(pageIndex);
    };

    // Hantera browser back/forward
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        setCurrentPage(state.page ?? 0);
        setShowHelp(state.showHelp ?? false);
        setShowKorpus(state.showKorpus ?? false);
      }
    };

    window.addEventListener('openStartGuide', handleOpenStartGuide);
    window.addEventListener('navigateToPage', handleNavigateToPage as EventListener);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('openStartGuide', handleOpenStartGuide);
      window.removeEventListener('navigateToPage', handleNavigateToPage as EventListener);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Array med alla sidor för enkel rendering
  const pages = [
    <OvningPage key="ovning" onShowKorpus={navigateToKorpus} onOpenMenu={() => setShowMenu(true)} />,
    <ListorPage key="listor" />,
    <LexikonPage key="lexikon" />,
    <InstallningarPage key="installningar" onShowHelp={navigateToHelp} />
  ];

  // Funktion som körs när användaren klickar på en navigation-knapp
  const handlePageChange = (event: React.SyntheticEvent, newValue: number) => {
    // Pusha ny history state
    window.history.pushState(
      { page: newValue, showHelp: false, showKorpus: false },
      '',
      window.location.href
    );

    // Om användaren klickar på samma sida (t.ex. övning när man redan är på övning),
    // tvinga en återställning genom att sätta till -1 först, sedan till rätt värde
    if (newValue === currentPage) {
      setCurrentPage(-1);
      setTimeout(() => setCurrentPage(newValue), 0);
    } else {
      setCurrentPage(newValue);
    }
    
    // Stäng hjälpsidan om den är öppen när användaren navigerar
    if (showHelp) {
      setShowHelp(false);
    }
    // Stäng korpus-sidan om den är öppen när användaren navigerar
    if (showKorpus) {
      setShowKorpus(false);
    }
    // Scrolla till toppen av sidan
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Huvudcontainer som tar upp hela skärmen */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        
        {/* Innehållsområde */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto'
        }}>
          {showHelp ? (
            <HjalpPage onBack={navigateBack} />
          ) : showKorpus ? (
            <KorpusPage onBack={navigateBack} />
          ) : (
            pages[currentPage]
          )}
        </Box>

        {/* Huvudmeny (drawer från höger) */}
        <MainMenu 
          open={showMenu} 
          onClose={() => setShowMenu(false)}
          onNavigate={(pageIndex) => {
            handlePageChange({} as React.SyntheticEvent, pageIndex);
          }}
        />
      </Box>

      {/* Start-guide dialog */}
      <StartGuideDialog
        open={showStartGuide}
        onClose={() => {
          setShowStartGuide(false);
          localStorage.setItem('hasSeenStartGuide', 'true');
          // Ladda om sidan för att uppdatera alla komponenter med nya ord
          window.location.reload();
        }}
        onComplete={() => {
          setShowStartGuide(false);
          localStorage.setItem('hasSeenStartGuide', 'true');
          // Trigga en uppdatering av alla komponenter som visar progress
          window.dispatchEvent(new Event('storage'));
          // Ladda om sidan för att uppdatera alla komponenter med nya ord
          window.location.reload();
        }}
        />

        {/* Dialog för att lägga till fler ordlistor */}
        <Dialog
          open={showAddWordsDialog}
          onClose={() => setShowAddWordsDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            {(() => {
              const wordProgressData = localStorage.getItem('wordProgress');
              const currentProgress = wordProgressData ? JSON.parse(wordProgressData) : {};
              const learnedWords = Object.values(currentProgress).filter((word: any) => word.level === 2).length;
              return learnedWords === 0 ? "Dags att komma igång!" : `Du har lärt dig ${learnedWords} ord!`;
            })()}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ textAlign: 'center', mb: 2 }}>
              {(() => {
                const wordProgressData = localStorage.getItem('wordProgress');
                const currentProgress = wordProgressData ? JSON.parse(wordProgressData) : {};
                const allWordLists = getAllWordLists(wordDatabase);
                const availableWordLists = allWordLists.filter(list => {
                  const wordsInList = getWordsFromList(list, wordDatabase);
                  // Kontrollera om det finns ord på level 0 (som kan läggas till)
                  return wordsInList.some(word => !currentProgress[word.id] || currentProgress[word.id]?.level === 0);
                });
                
                if (availableWordLists.length === 1) {
                  return `Ordlistan "${availableWordLists[0].name}" är näst på tur!`;
                } else if (availableWordLists.length >= 2) {
                  return `Ordlistorna "${availableWordLists[0].name}" och "${availableWordLists[1].name}" är redo för dig!`;
                } else {
                  return "Nya ordlistor på tur!";
                }
              })()}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ flexDirection: 'column', alignItems: 'center', gap: 1, pb: 3, px: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddWordLists}
              sx={{ width: '100%', maxWidth: 200, textTransform: 'none' }}
            >
              Perfekt!
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

// Huvudkomponenten som hanterar laddning och rendering
function App() {
  const { isLoading, error } = useDatabase();

  // Visa laddningssida medan databaserna laddas
  if (isLoading) {
    return (
      <CustomThemeProvider>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            textAlign: 'center'
          }}>
            {/* App-namn */}
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3
              }}
            >
              TSP Skolan
            </Typography>
            
            {/* Undertitel */}
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ mb: 4, fontWeight: 300 }}
            >
              Teckenspråk för alla
            </Typography>
            
            {/* Laddningsikon */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              <CircularProgress 
                size={60} 
                thickness={4}
                sx={{ 
                  color: 'primary.main',
                  animation: 'pulse 2s ease-in-out infinite'
                }} 
              />
            </Box>
            
            {/* Laddningstext */}
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                animation: 'fadeInOut 2s ease-in-out infinite',
                '@keyframes fadeInOut': {
                  '0%, 100%': { opacity: 0.6 },
                  '50%': { opacity: 1 }
                }
              }}
            >
              Laddar ord och övningar...
            </Typography>
            
            {/* Progress-indikator */}
            <Box sx={{ mt: 3, width: '100%', maxWidth: 300 }}>
              <LinearProgress 
                sx={{ 
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)'
                  }
                }} 
              />
            </Box>
          </Box>
        </Container>
      </CustomThemeProvider>
    );
  }

  // Visa fel-sida om något gick fel
  if (error) {
    return (
      <CustomThemeProvider>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            textAlign: 'center'
          }}>
            <Typography 
              variant="h4" 
              color="error" 
              gutterBottom
              sx={{ mb: 2 }}
            >
              Oops! Något gick fel
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              startIcon={<Refresh />}
            >
              Försök igen
            </Button>
          </Box>
        </Container>
      </CustomThemeProvider>
    );
  }

  // Visa huvudapplikationen när allt är laddat
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}

// Wrapper-komponent som tillhandahåller DatabaseProvider
function AppWrapper() {
  return (
    <DatabaseProvider>
      <App />
    </DatabaseProvider>
  );
}

export default AppWrapper;
