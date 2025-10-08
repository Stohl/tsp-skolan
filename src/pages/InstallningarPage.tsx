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
  Slider,
  Link,
  IconButton
} from '@mui/material';
import { 
  Settings,
  Brightness4,
  Help,
  Info,
  Refresh,
  FilterList,
  ArrowBack
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
  
  // State för att bara visa meningar med meningsnivå
  const [sentencesOnlyWithLevel, setSentencesOnlyWithLevel] = useState<boolean>(true);
  
  // State för att visa/dölja ordlistor-dialog
  const [showAddWordsDialog, setShowAddWordsDialog] = useState<boolean>(true);
  
  // Ladda inställningar från localStorage vid komponentens mount
  useEffect(() => {
    const savedReviewWords = localStorage.getItem('reviewLearnedWords');
    if (savedReviewWords !== null) {
      setReviewLearnedWords(parseInt(savedReviewWords));
    }
    
    const savedSentencesLevel = localStorage.getItem('sentences-only-with-level');
    if (savedSentencesLevel !== null) {
      setSentencesOnlyWithLevel(savedSentencesLevel === 'true');
    }
    
    const savedShowAddWordsDialog = localStorage.getItem('showAddWordsDialog');
    if (savedShowAddWordsDialog !== null) {
      setShowAddWordsDialog(savedShowAddWordsDialog === 'true');
    }
  }, []);
  
  // Spara inställning till localStorage när den ändras
  const handleReviewLearnedWordsChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setReviewLearnedWords(value);
    localStorage.setItem('reviewLearnedWords', value.toString());
  };

  // Hantera ändring av meningar-inställning
  const handleSentencesOnlyWithLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setSentencesOnlyWithLevel(newValue);
    localStorage.setItem('sentences-only-with-level', newValue.toString());
  };

  // Hantera ändring av ordlistor-dialog-inställning
  const handleShowAddWordsDialogChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setShowAddWordsDialog(newValue);
    localStorage.setItem('showAddWordsDialog', newValue.toString());
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
      localStorage.removeItem('sentences-only-with-level');
      
      // Nollställ wordProgress
      setWordProgress({});
      
      // Visa bekräftelse
      alert('Alla inställningar och progress har nollställts! Appen kommer att starta om från början.');
      
      // Ladda om sidan för att säkerställa att allt är nollställt
      window.location.reload();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 3 }}>
      <Container maxWidth="sm">

      {/* Header med tillbaka-knapp */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => window.history.back()} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Inställningar
        </Typography>
      </Box>

      {/* Lista med inställningsalternativ */}
      <Card>
        <List>
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
          
          {/* Ordlistor-dialog */}
          <ListItem>
            <ListItemIcon>
              <FilterList />
            </ListItemIcon>
            <ListItemText 
              primary="Fråga om nya/fler ordlistor" 
              secondary={showAddWordsDialog ? 'Visas när du har få ord att lära dig' : 'Dialog är avstängd'}
            />
            <Switch 
              edge="end" 
              checked={showAddWordsDialog}
              onChange={handleShowAddWordsDialogChange}
            />
          </ListItem>
          
          <Divider />
          
          {/* (Borttagen) Meningar med meningsnivå - ej implementerat i UI nu */}
          
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
                  : `${reviewLearnedWords} lärda ord repeteras för att inte glömma gamla ord`
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
                secondary="Rensa alla inställningar"
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

        {/* Information om källa och licens */}
        <Box sx={{ mt: 4, p: 2, backgroundColor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
            Tack till Stockholms Universitet och{' '}
            <Link href="https://teckensprakslexikon.su.se" target="_blank" rel="noopener noreferrer">
              teckensprakslexikon.su.se
            </Link>
            {' '}som gör detta material tillgängligt. Utan det skulle TSP Skolan inte vara möjligt.
            <br />
            Materialet används under{' '}
            <Link href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.sv" target="_blank" rel="noopener noreferrer">
              Creative Commons-licens
            </Link>
            {' '}med stor tacksamhet.
          </Typography>
        </Box>

      </Container>
    </Box>
  );
};

export default InstallningarPage;
