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
  const [selectedWordList, setSelectedWordList] = useState<WordList | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  // Funktion som körs när användaren klickar på en ordlista
  const handleWordListClick = (wordList: WordList) => {
    setSelectedWordList(selectedWordList?.id === wordList.id ? null : wordList);
  };

  // Funktion som körs när användaren klickar på ett ord
  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
    setDialogOpen(true);
  };

  // Hämtar ord för den valda ordlistan
  const getWordsForSelectedList = () => {
    if (!selectedWordList) return [];
    return getWordsFromList(selectedWordList, wordDatabase);
  };

  // Hämtar fraser för det valda ordet
  const getPhrasesForSelectedWord = () => {
    if (!selectedWord) return [];
    return Object.values(phraseDatabase).filter(phrase => 
      phrase.ord_id === selectedWord.id
    );
  };

  // Funktion som renderar innehållet för "Att lära mig"-taben
  const renderAttLaraMig = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Ord att lära mig
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Här kommer du att se ord som du behöver öva på. 
        Funktionen kommer att implementeras senare.
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Inga ord att lära mig just nu. 
            När du börjar använda appen kommer ord att dyka upp här.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  // Funktion som renderar innehållet för "Ordlistor"-taben
  const renderOrdlistor = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Tillgängliga ordlistor
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Klicka på en ordlista för att se ord i den listan.
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
      
      {wordLists.length > 0 && (
        <List>
          {wordLists.map((wordList, index) => {
            const wordsInList = getWordsFromList(wordList, wordDatabase);
            return (
              <React.Fragment key={wordList.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleWordListClick(wordList)}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {wordList.name}
                          <Chip 
                            label={wordList.type === 'predefined' ? 'Förgenererad' : 'Dynamisk'} 
                            size="small" 
                            color={wordList.type === 'predefined' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {wordList.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {wordsInList.length} ord
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < wordLists.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      )}
      
      {selectedWordList && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ord i "{selectedWordList.name}"
          </Typography>
          <List>
            {getWordsForSelectedList().map((word, index) => (
              <React.Fragment key={word.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleWordClick(word)}>
                    <ListItemText
                      primary={word.ord}
                      secondary={word.beskrivning || 'Ingen beskrivning tillgänglig'}
                    />
                    <PlayArrow color="primary" />
                  </ListItemButton>
                </ListItem>
                {index < getWordsForSelectedList().length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );

  // Funktion som renderar innehållet för "Lärda"-taben
  const renderLarda = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Lärda ord
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Här kommer du att se ord som du har lärt dig. 
        Funktionen kommer att implementeras senare.
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Inga lärda ord just nu. 
            När du lär dig ord kommer de att dyka upp här.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

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
