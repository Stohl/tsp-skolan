import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Container,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { List as ListIcon, PlayArrow } from '@mui/icons-material';
import { useDatabase } from '../contexts/DatabaseContext';
import { getAllWordLists, getWordsFromList, WordList } from '../types/wordLists';
import WordDetailDialog from '../components/WordDetailDialog';
import { Word } from '../types/database';

// Listor-sidan med sub-tabs för olika kategorier
const ListorPage: React.FC = () => {
  // Använder databasen context för att få tillgång till orddatabasen
  const { wordDatabase, phraseDatabase, isLoading, error } = useDatabase();
  
  // State för att hålla reda på vilken sub-tab som är aktiv
  const [activeTab, setActiveTab] = useState(0);
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wordProgress, setWordProgress] = useState<{ [key: string]: number }>({});

  // Laddar alla ordlistor när databasen är redo
  useEffect(() => {
    if (Object.keys(wordDatabase).length > 0) {
      const allLists = getAllWordLists(wordDatabase);
      setWordLists(allLists);
    }
  }, [wordDatabase]);

  // Funktion som körs när användaren klickar på en sub-tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Funktion som körs när användaren klickar på ett ord
  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
    setDialogOpen(true);
  };

  // Funktion som körs när användaren klickar på progress-cirkeln
  const handleProgressClick = (wordId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Förhindrar att dialog öppnas
    
    setWordProgress(prev => {
      const currentLevel = prev[wordId] || 0;
      const newLevel = (currentLevel + 1) % 3; // Cyklar mellan 0, 1, 2
      return {
        ...prev,
        [wordId]: newLevel
      };
    });
  };

  // Funktion som hämtar progress-nivå för ett ord
  const getWordProgress = (wordId: string): number => {
    return wordProgress[wordId] || 0;
  };

  // Funktion som renderar progress-cirkel
  const renderProgressCircle = (wordId: string) => {
    const level = getWordProgress(wordId);
    
    const circleStyle = {
      width: 24,
      height: 24,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: '2px solid',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'scale(1.1)'
      }
    };

    switch (level) {
      case 0: // Ej markerad
        return (
          <Box
            sx={{
              ...circleStyle,
              backgroundColor: 'transparent',
              borderColor: 'grey.400',
              color: 'grey.400'
            }}
            onClick={(e) => handleProgressClick(wordId, e)}
          >
            ⚪
          </Box>
        );
      case 1: // Vill lära sig
        return (
          <Box
            sx={{
              ...circleStyle,
              backgroundColor: 'yellow.200',
              borderColor: 'yellow.600',
              color: 'yellow.800'
            }}
            onClick={(e) => handleProgressClick(wordId, e)}
          >
            🟡
          </Box>
        );
      case 2: // Lärt sig
        return (
          <Box
            sx={{
              ...circleStyle,
              backgroundColor: 'green.200',
              borderColor: 'green.600',
              color: 'green.800'
            }}
            onClick={(e) => handleProgressClick(wordId, e)}
          >
            🟢
          </Box>
        );
      default:
        return null;
    }
  };

  // Hämtar fraser för det valda ordet
  const getPhrasesForSelectedWord = () => {
    if (!selectedWord) return [];
    return Object.values(phraseDatabase).filter(phrase => 
      phrase.ord_id === selectedWord.id
    );
  };

  // Funktion som renderar innehållet för "Att lära mig"-taben
  const renderAttLaraMig = () => {
    // Hämta alla ord som användaren vill lära sig (nivå 1)
    const learningWords = Object.entries(wordProgress)
      .filter(([_, level]) => level === 1)
      .map(([wordId]) => wordDatabase[wordId])
      .filter(word => word !== undefined);

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Ord att lära mig
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Ord som du har markerat som "vill lära sig".
        </Typography>
        
        {learningWords.length > 0 ? (
          <List>
            {learningWords.map((word, index) => (
              <React.Fragment key={word.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleWordClick(word)}>
                    <ListItemText
                      primary={word.ord}
                      secondary={word.beskrivning || 'Ingen beskrivning tillgänglig'}
                    />
                    {renderProgressCircle(word.id)}
                    <PlayArrow color="primary" />
                  </ListItemButton>
                </ListItem>
                {index < learningWords.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Inga ord att lära mig just nu. 
                Klicka på progress-cirklarna i ordlistorna för att markera ord.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  // Funktion som renderar innehållet för "Ordlistor"-taben
  const renderOrdlistor = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Ordlistor
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Klicka på progress-cirklarna för att markera ord. ⚪ Ej markerad → 🟡 Vill lära sig → 🟢 Lärt sig
      </Typography>
      
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Laddar databasen...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {wordLists.length > 0 && wordLists.map((wordList) => {
        const wordsInList = getWordsFromList(wordList, wordDatabase);
        
        return (
          <Card key={wordList.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {wordList.name}
                <Chip 
                  label={wordList.type === 'predefined' ? 'Förgenererad' : 'Dynamisk'} 
                  size="small" 
                  color={wordList.type === 'predefined' ? 'primary' : 'secondary'}
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {wordList.description} ({wordsInList.length} ord)
              </Typography>
              
              {wordsInList.length > 0 ? (
                <List dense>
                  {wordsInList.map((word, index) => (
                    <React.Fragment key={word.id}>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => handleWordClick(word)}>
                          <ListItemText
                            primary={word.ord}
                            secondary={word.beskrivning || 'Ingen beskrivning tillgänglig'}
                          />
                          {renderProgressCircle(word.id)}
                          <PlayArrow color="primary" />
                        </ListItemButton>
                      </ListItem>
                      {index < wordsInList.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Inga ord hittades i denna ordlista.
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );

  // Funktion som renderar innehållet för "Lärda"-taben
  const renderLarda = () => {
    // Hämta alla ord som användaren har lärt sig (nivå 2)
    const learnedWords = Object.entries(wordProgress)
      .filter(([_, level]) => level === 2)
      .map(([wordId]) => wordDatabase[wordId])
      .filter(word => word !== undefined);

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Lärda ord
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Ord som du har markerat som "lärt sig".
        </Typography>
        
        {learnedWords.length > 0 ? (
          <List>
            {learnedWords.map((word, index) => (
              <React.Fragment key={word.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleWordClick(word)}>
                    <ListItemText
                      primary={word.ord}
                      secondary={word.beskrivning || 'Ingen beskrivning tillgänglig'}
                    />
                    {renderProgressCircle(word.id)}
                    <PlayArrow color="primary" />
                  </ListItemButton>
                </ListItem>
                {index < learnedWords.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Inga lärda ord just nu. 
                Klicka på progress-cirklarna i ordlistorna för att markera ord som lärda.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      
      {/* Huvudrubrik för sidan */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          mb: 4,
          color: 'primary.main',
          fontWeight: 'bold'
        }}
      >
        Listor
      </Typography>

      {/* Ikon för sidan */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <ListIcon sx={{ fontSize: 60, color: 'primary.main' }} />
      </Box>

      {/* Sub-tabs för olika kategorier */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth" // Tabs tar upp hela bredden
          sx={{
            '& .MuiTab-root': {
              minHeight: 48, // Högre höjd för bättre touch-target
              fontSize: '0.875rem' // Mindre text för att passa på mobil
            }
          }}
        >
          <Tab label="Att lära mig" />
          <Tab label="Ordlistor" />
          <Tab label="Lärda" />
        </Tabs>
      </Box>

      {/* Innehåll för den aktiva taben */}
      <Box sx={{ minHeight: 400 }}>
        {activeTab === 0 && renderAttLaraMig()}
        {activeTab === 1 && renderOrdlistor()}
        {activeTab === 2 && renderLarda()}
      </Box>

      {/* Dialog för orddetaljer */}
      <WordDetailDialog
        word={selectedWord}
        phrases={getPhrasesForSelectedWord()}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Container>
  );
};

export default ListorPage;
