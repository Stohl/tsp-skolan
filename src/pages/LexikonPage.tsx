import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Container,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import { Book, Search, PlayArrow } from '@mui/icons-material';
import { useDatabase } from '../contexts/DatabaseContext';
import { useWordProgress } from '../hooks/usePersistentState';
import { searchWords, getAllSubjects, getWordsBySubject, getPhrasesForWord } from '../types/database';
import WordDetailDialog from '../components/WordDetailDialog';
import { Word } from '../types/database';

// Lexikon-sidan - här kommer användare att kunna söka efter ord och tecken
const LexikonPage: React.FC = () => {
  // Använder databasen context för att få tillgång till orddatabasen
  const { wordDatabase, phraseDatabase, isLoading, error } = useDatabase();
  const { wordProgress, setWordLevel } = useWordProgress();
  
  // State för sökterm och sökresultat
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Word[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Uppdaterar sökresultat när söktermen eller databasen ändras
  useEffect(() => {
    if (searchTerm.trim()) {
      const results = searchWords(wordDatabase, searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, wordDatabase]);

  // Laddar alla ämnen när databasen är redo
  useEffect(() => {
    if (Object.keys(wordDatabase).length > 0) {
      const allSubjects = getAllSubjects(wordDatabase);
      setSubjects(allSubjects);
    }
  }, [wordDatabase]);

  // Funktion som körs när användaren klickar på ett ord
  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
    setDialogOpen(true);
  };

  // Funktion som körs när användaren klickar på ett ämne
  const handleSubjectClick = (subject: string) => {
    setSelectedSubject(selectedSubject === subject ? null : subject);
    setSearchTerm(''); // Rensar sökfältet när man väljer ämne
  };

  // Hämtar ord för det valda ämnet
  const getWordsForSelectedSubject = () => {
    if (!selectedSubject) return [];
    return getWordsBySubject(wordDatabase, selectedSubject);
  };

  // Hämtar fraser för det valda ordet
  const getPhrasesForSelectedWord = () => {
    if (!selectedWord) return [];
    return getPhrasesForWord(phraseDatabase, selectedWord.id);
  };

  // Funktion som körs när användaren ändrar progress för ett ord
  const handleProgressChange = (wordId: string, newLevel: number) => {
    setWordLevel(wordId, newLevel);
  };

  // Hämtar progress för det valda ordet
  const getWordProgress = () => {
    if (!selectedWord) return 0;
    return wordProgress[selectedWord.id]?.level || 0;
  };
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header med titel och ikon */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Book sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Teckenspråkslexikon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sök efter ord och lär dig hur de tecknas
        </Typography>
      </Box>

      {/* Sökfält för att söka efter ord */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Sök efter ord
        </Typography>
        <TextField
          fullWidth
          placeholder="Skriv ett ord för att söka..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary">
          Söker efter ord i ordlistan. Skriv minst 2 bokstäver för att få resultat.
        </Typography>
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Laddar databasen...
            </Typography>
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Ämneskategorier */}
      {subjects.length > 0 && (
        <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Kategorier
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {subjects.slice(0, 12).map((subject) => (
              <Chip
                key={subject}
                label={subject}
                onClick={() => handleSubjectClick(subject)}
                color={selectedSubject === subject ? 'primary' : 'default'}
                variant={selectedSubject === subject ? 'filled' : 'outlined'}
                clickable
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Sökresultat eller ord från valt ämne */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {searchTerm ? `Sökresultat för "${searchTerm}"` : 
           selectedSubject ? `Ord i kategorin "${selectedSubject}"` : 
           'Sökresultat'}
        </Typography>
            
            {searchResults.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Hittade {searchResults.length} ord som innehåller "{searchTerm}"
              </Typography>
            )}
            
            {searchResults.length > 0 && (
              <List>
                {searchResults.slice(0, 10).map((word, index) => (
                  <React.Fragment key={word.id}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleWordClick(word)}>
                        <ListItemText
                          primary={word.ord}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {word.beskrivning || 'Ingen beskrivning tillgänglig'}
                              </Typography>
                              {word.ämne && word.ämne.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                  {word.ämne.slice(0, 3).map((ämne: string) => (
                                    <Chip key={ämne} label={ämne} size="small" variant="outlined" />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                        <PlayArrow color="primary" />
                      </ListItemButton>
                    </ListItem>
                    {index < Math.min(searchResults.length, 10) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            
            {getWordsForSelectedSubject().length > 0 && (
              <List>
                {getWordsForSelectedSubject().slice(0, 10).map((word, index) => (
                  <React.Fragment key={word.id}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleWordClick(word)}>
                        <ListItemText
                          primary={word.ord}
                          secondary={word.beskrivning}
                        />
                        <PlayArrow color="primary" />
                      </ListItemButton>
                    </ListItem>
                    {index < Math.min(getWordsForSelectedSubject().length, 10) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            
            {!searchTerm && !selectedSubject && (
              <Typography variant="body2" color="text.secondary">
                Skriv ett ord för att söka eller välj en kategori ovan.
              </Typography>
            )}
            
            {searchTerm && searchResults.length === 0 && !isLoading && (
              <Typography variant="body2" color="text.secondary">
                Inga ord hittades som innehåller "{searchTerm}". Prova att skriva ett annat ord.
              </Typography>
            )}
      </Paper>

      {/* Dialog för orddetaljer */}
      <WordDetailDialog
        word={selectedWord}
        phrases={getPhrasesForSelectedWord()}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        wordProgress={getWordProgress()}
        onProgressChange={handleProgressChange}
      />
    </Container>
  );
};

export default LexikonPage;
