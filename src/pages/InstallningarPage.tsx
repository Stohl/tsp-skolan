import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  Container
} from '@mui/material';
import { 
  Settings,
  Notifications,
  Brightness4,
  Language,
  Help,
  Info,
  Refresh
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useWordProgress } from '../hooks/usePersistentState';

// Props interface för InstallningarPage
interface InstallningarPageProps {
  onShowHelp: () => void;
}

// Inställningar-sidan - här kommer användare att kunna anpassa appen
const InstallningarPage: React.FC<InstallningarPageProps> = ({ onShowHelp }) => {
  // Hämta tema-funktionalitet från Theme Context
  const { mode, toggleTheme } = useTheme();
  // Hämta wordProgress för att kunna nollställa
  const { setWordProgress } = useWordProgress();

  // Funktion för att nollställa alla inställningar och progress
  const handleReset = () => {
    const confirmed = window.confirm(
      'Är du säker på att du vill nollställa alla inställningar och progress?\n\n' +
      'Detta kommer att:\n' +
      '• Rensa alla ordlistor och progress\n' +
      '• Återställa alla inställningar\n' +
      '• Ta bort all sparad data\n\n' +
      'Denna åtgärd kan inte ångras!'
    );
    
    if (confirmed) {
      // Rensa localStorage helt
      localStorage.clear();
      
      // Ta bort specifika nycklar för att vara säker
      localStorage.removeItem('wordProgress');
      localStorage.removeItem('hasSeenStartGuide');
      localStorage.removeItem('theme');
      localStorage.removeItem('spelling-playback-speed');
      localStorage.removeItem('spelling-interval');
      
      // Nollställ wordProgress
      setWordProgress({});
      
      // Visa bekräftelse
      alert('Alla inställningar och progress har nollställts! Appen kommer att starta om från början.');
      
      // Ladda om sidan för att säkerställa att allt är nollställt
      window.location.reload();
    }
  };

  return (
    // Container som centrerar innehållet och ger padding
    <Container maxWidth="sm" sx={{ py: 3 }}>

      {/* Lista med inställningsalternativ */}
      <Card>
        <List>
          {/* Notifikationer */}
          <ListItem>
            <ListItemIcon>
              <Notifications />
            </ListItemIcon>
            <ListItemText 
              primary="Notifikationer" 
              secondary="Få påminnelser om att öva"
            />
            <Switch edge="end" />
          </ListItem>
          
          <Divider />
          
          {/* Mörkt tema */}
          <ListItem>
            <ListItemIcon>
              <Brightness4 />
            </ListItemIcon>
            <ListItemText 
              primary="Mörkt tema" 
              secondary={mode === 'dark' ? 'Mörkt tema aktiverat' : 'Använd mörk bakgrund'}
            />
            <Switch 
              edge="end" 
              checked={mode === 'dark'}
              onChange={toggleTheme}
            />
          </ListItem>
          
          <Divider />
          
          {/* Språk */}
          <ListItem>
            <ListItemIcon>
              <Language />
            </ListItemIcon>
            <ListItemText 
              primary="Språk" 
              secondary="Svenska"
            />
          </ListItem>
        </List>
      </Card>

      {/* Ytterligare inställningskategorier */}
      <Box sx={{ mt: 3 }}>
        <Card>
          <List>
            {/* Hjälp */}
            <ListItem button onClick={onShowHelp}>
              <ListItemIcon>
                <Help />
              </ListItemIcon>
              <ListItemText 
                primary="Hjälp" 
                secondary="Få hjälp med att använda appen"
              />
            </ListItem>
            
            <Divider />
            
            {/* Nollställ */}
            <ListItem button onClick={handleReset}>
              <ListItemIcon>
                <Refresh />
              </ListItemIcon>
              <ListItemText 
                primary="Nollställ allt" 
                secondary="Rensa alla inställningar och progress"
              />
            </ListItem>
            
            <Divider />
            
            {/* Om appen */}
            <ListItem button>
              <ListItemIcon>
                <Info />
              </ListItemIcon>
              <ListItemText 
                primary="Om TSP Skolan" 
                secondary="Version 1.0.0"
              />
            </ListItem>
          </List>
        </Card>
      </Box>

      {/* Platshållare för framtida inställningar */}
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kommande funktioner
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fler inställningsalternativ kommer att läggas till i framtida versioner.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default InstallningarPage;
