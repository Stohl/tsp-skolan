import React, { useState } from 'react';
import { 
  Box, 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper,
  Container,
  Typography,
  CircularProgress,
  LinearProgress,
  Button
} from '@mui/material';
import { 
  SportsKabaddiRounded,
  FormatListBulletedRounded,
  MenuBookRounded,
  SettingsRounded,
  Refresh
} from '@mui/icons-material';

// Importera alla sidor
import OvningPage from './pages/OvningPage';
import ListorPage from './pages/ListorPage';
import LexikonPage from './pages/LexikonPage';
import InstallningarPage from './pages/InstallningarPage';
import HjalpPage from './pages/HjalpPage';
import StartGuideDialog from './components/StartGuideDialog';

// Importera Providers
import { DatabaseProvider, useDatabase } from './contexts/DatabaseContext';
import { CustomThemeProvider } from './contexts/ThemeContext';

// Komponent för huvudinnehållet (efter att databaserna laddats)
function AppContent() {
  // State för att hålla reda på vilken sida som är aktiv
  const [currentPage, setCurrentPage] = useState(0);
  // State för att hantera om hjälpsidan ska visas
  const [showHelp, setShowHelp] = useState(false);
  // State för att hantera start-guiden
  const [showStartGuide, setShowStartGuide] = useState(false);

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

  // Lyssna på custom event för att öppna startguiden
  React.useEffect(() => {
    const handleOpenStartGuide = () => {
      setShowStartGuide(true);
    };

    const handleNavigateToPage = (event: CustomEvent) => {
      const pageIndex = event.detail;
      setCurrentPage(pageIndex);
    };

    window.addEventListener('openStartGuide', handleOpenStartGuide);
    window.addEventListener('navigateToPage', handleNavigateToPage as EventListener);
    
    return () => {
      window.removeEventListener('openStartGuide', handleOpenStartGuide);
      window.removeEventListener('navigateToPage', handleNavigateToPage as EventListener);
    };
  }, []);

  // Array med alla sidor för enkel rendering
  const pages = [
    <OvningPage key="ovning" />,
    <ListorPage key="listor" />,
    <LexikonPage key="lexikon" />,
    <InstallningarPage key="installningar" onShowHelp={() => setShowHelp(true)} />
  ];

  // Funktion som körs när användaren klickar på en navigation-knapp
  const handlePageChange = (event: React.SyntheticEvent, newValue: number) => {
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
        
        {/* Innehållsområde som tar upp allt utom bottom navigation */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          pb: showHelp ? 0 : 7 // Ingen padding när hjälpsidan visas eftersom den har egen header
        }}>
          {showHelp ? (
            <HjalpPage onBack={() => setShowHelp(false)} />
          ) : (
            pages[currentPage]
          )}
        </Box>

        {/* Bottom navigation som alltid syns längst ner */}
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: 1000,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)',
            borderTop: '1px solid rgba(255,255,255,0.4)'
          }} 
          elevation={6}
        >
          <BottomNavigation
            value={currentPage}
            onChange={handlePageChange}
            showLabels
            sx={{
              px: 1,
              '& .MuiBottomNavigationAction-root': {
                minWidth: 0,
                px: 1.5,
                borderRadius: 10,
                transition: 'all 0.2s ease',
                color: 'text.secondary',
                '& .MuiSvgIcon-root': { fontSize: 26 },
                '&.Mui-selected': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(25, 118, 210, 0.10)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                }
              },
              '& .Mui-selected .MuiBottomNavigationAction-label': {
                fontWeight: 700
              }
            }}
          >
            {/* Övning */}
            <BottomNavigationAction 
              label="Övning" 
              icon={<SportsKabaddiRounded />}
            />
            {/* Ordlistor */}
            <BottomNavigationAction 
              label="Ordlistor" 
              icon={<FormatListBulletedRounded />}
            />
            {/* Lexikon */}
            <BottomNavigationAction 
              label="Lexikon" 
              icon={<MenuBookRounded />}
            />
            {/* Inställningar */}
            <BottomNavigationAction 
              label="Inställningar" 
              icon={<SettingsRounded />}
            />
          </BottomNavigation>
        </Paper>
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
