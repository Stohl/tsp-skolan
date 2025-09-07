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

// Importera Providers
import { DatabaseProvider } from './contexts/DatabaseContext';
import { CustomThemeProvider } from './contexts/ThemeContext';

// Huvudkomponenten som hanterar navigation och rendering av sidor
function App() {
  // State för att hålla reda på vilken sida som är aktiv
  const [currentPage, setCurrentPage] = useState(0);

  // Array med alla sidor för enkel rendering
  const pages = [
    <OvningPage key="ovning" />,
    <ListorPage key="listor" />,
    <LexikonPage key="lexikon" />,
    <InstallningarPage key="installningar" />
  ];

  // Funktion som körs när användaren klickar på en navigation-knapp
  const handlePageChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentPage(newValue);
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
            pb: 7 // Padding bottom för att undvika att innehåll döljs av navigation
          }}>
            {pages[currentPage]}
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
                label="Listor" 
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
      </DatabaseProvider>
    </CustomThemeProvider>
  );
}

export default App;
