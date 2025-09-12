import React, { useState, useEffect } from 'react';
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
  Container,
  Slider
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
  
  // State för antal lärda ord att repetera
  const [reviewLearnedWords, setReviewLearnedWords] = useState<number>(2);
  
  // Ladda inställning från localStorage vid komponentens mount
  useEffect(() => {
    const saved = localStorage.getItem('reviewLearnedWords');
    if (saved !== null) {
      setReviewLearnedWords(parseInt(saved));
    }
  }, []);
  
  // Spara inställning till localStorage när den ändras
  const handleReviewLearnedWordsChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setReviewLearnedWords(value);
    localStorage.setItem('reviewLearnedWords', value.toString());
  };

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
      localStorage.removeItem('reviewLearnedWords');
      
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
          
          <Divider />
          
          {/* Repetition av lärda ord */}
          <ListItem>
            <ListItemIcon>
              <Refresh />
            </ListItemIcon>
            <ListItemText 
              primary="Repetition av lärda ord" 
              secondary={`${reviewLearnedWords} ord repeteras vid varje övning`}
            />
          </ListItem>
          
          {/* Slider för antal lärda ord att repetera */}
          <ListItem>
            <Box sx={{ width: '100%', px: 2, pb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Antal lärda ord som ska repeteras (0-5)
              </Typography>
              <Slider
                value={reviewLearnedWords}
                onChange={handleReviewLearnedWordsChange}
                min={0}
                max={5}
                step={1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' }
                ]}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {reviewLearnedWords === 0 
                  ? 'Inga lärda ord repeteras - fokus på nya ord' 
                  : `${reviewLearnedWords} lärda ord repeteras för att förhindra glömska`
                }
              </Typography>
            </Box>
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
