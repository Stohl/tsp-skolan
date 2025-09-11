import React, { useState } from 'react';
import { 
  Box, 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper
} from '@mui/material';
import { 
  FitnessCenter, 
  List, 
  Book, 
  Settings 
} from '@mui/icons-material';

// Importera alla sidor
import OvningPage from './pages/OvningPage';
import ListorPage from './pages/ListorPage';
import LexikonPage from './pages/LexikonPage';
import InstallningarPage from './pages/InstallningarPage';
import HjalpPage from './pages/HjalpPage';
import StartGuideDialog from './components/StartGuideDialog';

// Importera Providers
import { DatabaseProvider } from './contexts/DatabaseContext';
import { CustomThemeProvider } from './contexts/ThemeContext';

// Huvudkomponenten som hanterar navigation och rendering av sidor
function App() {
  // State för att hålla reda på vilken sida som är aktiv
  const [currentPage, setCurrentPage] = useState(0);
  // State för att hantera om hjälpsidan ska visas
  const [showHelp, setShowHelp] = useState(false);
  // State för att hantera start-guiden
  const [showStartGuide, setShowStartGuide] = useState(false);

  // Kontrollera om användaren är ny (ingen sparad data)
  React.useEffect(() => {
    const hasUserData = localStorage.getItem('wordProgress');
    const hasSeenGuide = localStorage.getItem('hasSeenStartGuide');
    
    // Visa start-guiden om användaren inte har någon data och inte har sett guiden
    if (!hasUserData && !hasSeenGuide) {
      setShowStartGuide(true);
    }
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
    setCurrentPage(newValue);
    // Stäng hjälpsidan om den är öppen när användaren navigerar
    if (showHelp) {
      setShowHelp(false);
    }
  };

    return (
    // CustomThemeProvider ger Material UI tema med mörkt/ljust läge till hela appen
    <CustomThemeProvider>
      {/* DatabaseProvider ger tillgång till ord- och frasdatabaserna */}
      <DatabaseProvider>
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
              zIndex: 1000, // Säkerställer att navigation alltid är ovanpå innehåll
              elevation: 8 // Ger skugga för att skilja från innehåll
            }} 
            elevation={3}
          >
            <BottomNavigation
              value={currentPage}
              onChange={handlePageChange}
              showLabels // Visar text under ikonerna
            >
              {/* Övning - första fliken */}
              <BottomNavigationAction 
                label="Övning" 
                icon={<FitnessCenter />} 
              />
              
              {/* Listor - andra fliken */}
              <BottomNavigationAction 
                label="Ordlistor" 
                icon={<List />} 
              />
              
              {/* Lexikon - tredje fliken */}
              <BottomNavigationAction 
                label="Lexikon" 
                icon={<Book />} 
              />
              
              {/* Inställningar - fjärde fliken */}
              <BottomNavigationAction 
                label="Inställningar" 
                icon={<Settings />} 
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
          }}
          onComplete={() => {
            setShowStartGuide(false);
            localStorage.setItem('hasSeenStartGuide', 'true');
          }}
        />
      </DatabaseProvider>
    </CustomThemeProvider>
  );
}

export default App;
