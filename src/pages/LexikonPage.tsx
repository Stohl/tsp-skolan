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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import { Book, Search, PlayArrow, Add } from '@mui/icons-material';
import { useDatabase } from '../contexts/DatabaseContext';
import { useWordProgress } from '../hooks/usePersistentState';
import { searchWords, getAllSubjects, getWordsBySubject, getPhrasesForWord } from '../types/database';
import WordDetailDialog from '../components/WordDetailDialog';
import { Word } from '../types/database';
import { useTheme } from '@mui/material/styles';

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
    setSelectedSubject(subject === '' ? null : subject);
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

  // Funktion som lägger till alla ord i resultatet till "att lära mig"
  const handleAddAllToLearning = () => {
    const wordsToAdd = searchTerm ? searchResults : getWordsForSelectedSubject();
    wordsToAdd.forEach(word => {
      setWordLevel(word.id, 1); // Nivå 1 = "att lära mig"
    });
  };

  // Hämtar progress för det valda ordet
  const getWordProgress = () => {
    if (!selectedWord) return 0;
    return wordProgress[selectedWord.id]?.level || 0;
  };
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', // Extremt subtil lila bakgrund
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Modern header */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 6,
          color: 'white'
        }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            mb: 3,
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Book sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h6" sx={{ 
            opacity: 0.9,
            fontWeight: 300,
            maxWidth: 600,
            mx: 'auto',
            color: isDark ? 'white' : 'black'
          }}>
            Sök efter ord och lär dig hur de tecknas
          </Typography>
        </Box>

        {/* Sökfält container */}
        <Paper sx={{ 
          mb: 4, 
          p: 4, 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.95)'
        }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
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
                  <Search sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.1rem',
                '& fieldset': {
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                }
              }
            }}
          />
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
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
          <Paper sx={{ 
            mb: 4, 
            p: 4, 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.95)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Kategorier
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="category-select-label">Välj en kategori</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedSubject || ''}
                label="Välj en kategori"
                onChange={(e) => handleSubjectClick(e.target.value)}
                sx={{
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: 2,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  }
                }}
              >
                <MenuItem value="">
                  <em>Alla kategorier</em>
                </MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Välj en kategori för att se alla ord inom det ämnet.
            </Typography>
          </Paper>
        )}

        {/* Sökresultat container */}
        <Paper sx={{ 
          p: 4, 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.95)',
          minHeight: 300
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {searchTerm ? `Sökresultat för "${searchTerm}"` : 
               selectedSubject ? `Ord i kategorin "${selectedSubject}"` : 
               'Sökresultat'}
            </Typography>
            {(searchResults.length > 0 || getWordsForSelectedSubject().length > 0) && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddAllToLearning}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  backgroundColor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)'
                  }
                }}
              >
                Lägg till alla i "att lära mig"
              </Button>
            )}
          </Box>
            
            {searchResults.length > 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                Hittade {searchResults.length} ord som innehåller "{searchTerm}"
              </Typography>
            )}
            
            {searchResults.length > 0 && (
              <List sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                {searchResults.slice(0, 10).map((word, index) => (
                  <React.Fragment key={word.id}>
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={() => handleWordClick(word)}
                        sx={{
                          p: 3,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(156, 39, 176, 0.05)', // Extremt subtil lila med rgba
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {word.ord}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                {word.beskrivning || 'Ingen beskrivning tillgänglig'}
                              </Typography>
                              {word.ämne && word.ämne.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {word.ämne.slice(0, 3).map((ämne: string) => (
                                    <Chip 
                                      key={ämne} 
                                      label={ämne} 
                                      size="small" 
                                      variant="outlined" 
                                      sx={{ 
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        borderRadius: 1,
                                        borderColor: 'grey.300',
                                        color: 'text.secondary',
                                        '&:hover': {
                                          borderColor: 'primary.main',
                                          color: 'primary.main'
                                        }
                                      }} 
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                        <PlayArrow color="primary" sx={{ fontSize: 28 }} />
                      </ListItemButton>
                    </ListItem>
                    {index < Math.min(searchResults.length, 10) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            
            {getWordsForSelectedSubject().length > 0 && (
              <List sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                {getWordsForSelectedSubject().slice(0, 10).map((word, index) => (
                  <React.Fragment key={word.id}>
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={() => handleWordClick(word)}
                        sx={{
                          p: 3,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(156, 39, 176, 0.05)', // Extremt subtil lila med rgba
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {word.ord}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                              {word.beskrivning}
                            </Typography>
                          }
                        />
                        <PlayArrow color="primary" sx={{ fontSize: 28 }} />
                      </ListItemButton>
                    </ListItem>
                    {index < Math.min(getWordsForSelectedSubject().length, 10) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            
            {!searchTerm && !selectedSubject && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                backgroundColor: 'rgba(158, 158, 158, 0.05)', // Extremt subtil grå med rgba
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Skriv ett ord för att söka eller välj en kategori ovan.
                </Typography>
              </Box>
            )}
            
            {searchTerm && searchResults.length === 0 && !isLoading && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                backgroundColor: 'rgba(255, 152, 0, 0.05)', // Extremt subtil orange med rgba
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'warning.300'
              }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 500 }}>
                  Inga ord hittades som innehåller "{searchTerm}". Prova att skriva ett annat ord.
                </Typography>
              </Box>
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
    </Box>
  );
};

export default LexikonPage;
