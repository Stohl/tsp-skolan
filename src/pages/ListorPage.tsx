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
  Button,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Collapse
} from '@mui/material';
import { List as ListIcon, PlayArrow, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useDatabase } from '../contexts/DatabaseContext';
import { getAllWordLists, getWordsFromList, WordList } from '../types/wordLists';
import { getPhrasesForWord } from '../types/database';
import WordDetailDialog from '../components/WordDetailDialog';
import { useWordProgress, WordProgressStorage } from '../hooks/usePersistentState';
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
  const [expandedLists, setExpandedLists] = useState<{ [key: string]: boolean }>({});
  const [sortBy, setSortBy] = useState<'name' | 'lastPracticed' | 'correct' | 'incorrect'>('name');

  // Använd persistent word progress hook
  const { wordProgress, setWordLevel, markWordResult, setWordProgress } = useWordProgress();

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
    
    const currentLevel = wordProgress[wordId]?.level || 0;
    const newLevel = (currentLevel + 1) % 3; // Cyklar mellan 0, 1, 2
    setWordLevel(wordId, newLevel);
  };

  // Funktion som körs när användaren klickar på bulk-tagging knappen
  const handleBulkTag = (wordList: WordList, level: number) => {
    const wordsInList = getWordsFromList(wordList, wordDatabase);
    
    console.log(`Bulk tagging ${wordsInList.length} words to level ${level}`);
    
    // Batch-uppdatera alla ord samtidigt
    setWordProgress((prev: WordProgressStorage) => {
      const newProgress = { ...prev };
      
      wordsInList.forEach(word => {
        console.log(`Setting word ${word.id} (${word.ord}) to level ${level}`);
        
        // Behåll befintlig data eller skapa ny
        const current = prev[word.id] || {
          level: 0,
          stats: { correct: 0, incorrect: 0, lastPracticed: '', difficulty: 50 }
        };
        
        newProgress[word.id] = {
          ...current,
          level: level
        };
      });
      
      return newProgress;
    });
  };

  // Funktion som körs när användaren klickar på expandera/kollapsa ordlista
  const handleToggleList = (wordListId: string) => {
    setExpandedLists(prev => ({
      ...prev,
      [wordListId]: !prev[wordListId]
    }));
  };

  // Funktion som hämtar progress-nivå för ett ord
  const getWordProgress = (wordId: string): number => {
    return wordProgress[wordId]?.level || 0;
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
      .filter(([_, progress]) => progress.level === 1)
      .map(([wordId]) => wordDatabase[wordId])
      .filter(word => word !== undefined)
      .sort((a, b) => {
        const progressA = wordProgress[a.id];
        const progressB = wordProgress[b.id];
        
        switch (sortBy) {
          case 'name':
            return a.ord.localeCompare(b.ord, 'sv');
          case 'lastPracticed':
            const dateA = progressA?.stats?.lastPracticed ? new Date(progressA.stats.lastPracticed).getTime() : 0;
            const dateB = progressB?.stats?.lastPracticed ? new Date(progressB.stats.lastPracticed).getTime() : 0;
            return dateB - dateA; // Senast först
          case 'correct':
            const correctA = progressA?.stats?.correct || 0;
            const correctB = progressB?.stats?.correct || 0;
            return correctB - correctA; // Flest rätt först
          case 'incorrect':
            const incorrectA = progressA?.stats?.incorrect || 0;
            const incorrectB = progressB?.stats?.incorrect || 0;
            return incorrectB - incorrectA; // Flest fel först
          default:
            return a.ord.localeCompare(b.ord, 'sv');
        }
      });

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Ord att lära mig
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Ord som du har markerat som "vill lära sig".
        </Typography>
        
        {/* Sorteringsknappar */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant={sortBy === 'name' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setSortBy('name')}
          >
            Namn
          </Button>
          <Button
            variant={sortBy === 'lastPracticed' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setSortBy('lastPracticed')}
          >
            Senast övat
          </Button>
          <Button
            variant={sortBy === 'correct' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setSortBy('correct')}
          >
            Antal rätt
          </Button>
          <Button
            variant={sortBy === 'incorrect' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setSortBy('incorrect')}
          >
            Antal fel
          </Button>
        </Box>
        
        {learningWords.length > 0 ? (
          <List>
            {learningWords.map((word, index) => (
              <React.Fragment key={word.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleWordClick(word)}>
                    <ListItemText
                      primary={word.ord}
                      secondary={
                        <Box component="div">
                          <Typography component="div" variant="body2" color="text.secondary">
                            {word.beskrivning || 'Ingen beskrivning tillgänglig'}
                          </Typography>
                          {wordProgress[word.id]?.stats && (
                            <Typography component="div" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              ✅ {wordProgress[word.id].stats.correct} rätt • ❌ {wordProgress[word.id].stats.incorrect} fel
                              {wordProgress[word.id].stats.lastPracticed ? (
                                <span> • Senast: {new Date(wordProgress[word.id].stats.lastPracticed).toLocaleDateString('sv-SE')}</span>
                              ) : (
                                <span> • Aldrig övat</span>
                              )}
                            </Typography>
                          )}
                        </Box>
                      }
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
        Klicka på ordlistan för att expandera och se orden. Klicka på progress-cirklarna för att markera ord. ⚪ Ej markerad → 🟡 Vill lära sig → 🟢 Lärt sig
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
        const wordsInList = getWordsFromList(wordList, wordDatabase)
          .sort((a, b) => a.ord.localeCompare(b.ord, 'sv')); // Sortera i bokstavsordning
        const isExpanded = expandedLists[wordList.id] || false;
        
        return (
          <Card key={wordList.id} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 0 }}>
              {/* Ordlista header - klickbar för att expandera */}
              <ListItemButton 
                onClick={() => handleToggleList(wordList.id)}
                sx={{ 
                  borderBottom: isExpanded ? '1px solid' : 'none',
                  borderColor: 'divider',
                  p: 2
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">
                        {wordList.name}
                      </Typography>
                      <Chip 
                        label={wordList.type === 'predefined' ? 'Förgenererad' : 'Dynamisk'} 
                        size="small" 
                        color={wordList.type === 'predefined' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {wordList.description} ({wordsInList.length} ord)
                    </Typography>
                  }
                />
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              {/* Expandera/kollapsa innehåll */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, pt: 1 }}>
                  {/* Bulk-tagging kontroller */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Markera alla som:
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <Select
                        value=""
                        displayEmpty
                        onChange={(e) => {
                          const level = parseInt(e.target.value as string);
                          if (!isNaN(level)) {
                            handleBulkTag(wordList, level);
                          }
                        }}
                      >
                        <MenuItem value="" disabled>
                          Välj nivå...
                        </MenuItem>
                        <MenuItem value={0}>⚪ Ej markerad</MenuItem>
                        <MenuItem value={1}>🟡 Vill lära sig</MenuItem>
                        <MenuItem value={2}>🟢 Lärt sig</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {/* Ordlista */}
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
                </Box>
              </Collapse>
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
      .filter(([_, progress]) => progress.level === 2)
      .map(([wordId]) => wordDatabase[wordId])
      .filter(word => word !== undefined)
      .sort((a, b) => a.ord.localeCompare(b.ord, 'sv')); // Sortera i bokstavsordning

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
        wordProgress={selectedWord ? getWordProgress(selectedWord.id) : 0}
        onProgressChange={(wordId, newLevel) => {
          setWordLevel(wordId, newLevel);
        }}
      />
    </Container>
  );
};

export default ListorPage;
