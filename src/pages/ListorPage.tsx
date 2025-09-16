import React, { useState, useEffect, useRef } from 'react';
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
  Collapse,
  Grid,
  Paper
} from '@mui/material';
import { List as ListIcon, PlayArrow, ExpandMore, ExpandLess, School, CheckCircle, HourglassEmpty } from '@mui/icons-material';
import { useDatabase } from '../contexts/DatabaseContext';
import { getAllWordLists, getWordsFromList, WordList, getDifficultyInfo } from '../types/wordLists';
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
  const [sortBy, setSortBy] = useState<'name' | 'lastPracticed' | 'correct' | 'incorrect' | 'points'>('points');
  const [difficultyTab, setDifficultyTab] = useState(0); // State för svårighetsgrad-tabs

  // Använd persistent word progress hook
  const { wordProgress, setWordLevel, markWordResult, setWordProgress, getPointsDisplay } = useWordProgress();

  // Laddar alla ordlistor när databasen är redo
  useEffect(() => {
    console.log('[DEBUG] useEffect triggered, wordDatabase keys:', Object.keys(wordDatabase).length);
    if (Object.keys(wordDatabase).length > 0) {
      const allLists = getAllWordLists(wordDatabase);
      console.log('[DEBUG] getAllWordLists returned:', allLists.length, 'lists');
      console.log('[DEBUG] First few lists:', allLists.slice(0, 3));
      setWordLists(allLists);
    }
  }, [wordDatabase]);

  // Scrolla till toppen när komponenten mountas
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Funktion som körs när användaren klickar på en sub-tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(`[DEBUG] Tab changed from ${activeTab} to ${newValue}`);
    setActiveTab(newValue);
    console.log(`[DEBUG] Active tab set to: ${newValue}`);
  };

  // Funktion som körs när användaren klickar på en svårighetsgrad-tab
  const handleDifficultyTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setDifficultyTab(newValue);
  };

  // Funktion som körs när användaren klickar på ett ord
  const handleWordClick = (word: Word) => {
    console.log(`[DEBUG] Word clicked: ${word.id} (${word.ord})`);
    setSelectedWord(word);
    setDialogOpen(true);
    console.log(`[DEBUG] Dialog opened for word: ${word.id}`);
  };

  // Funktion som körs när användaren klickar på progress-cirkeln
  const handleProgressClick = (wordId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Förhindrar att dialog öppnas
    
    const currentLevel = wordProgress[wordId]?.level || 0;
    const newLevel = (currentLevel + 1) % 3; // Cyklar mellan 0, 1, 2
    
    console.log(`[DEBUG] Progress clicked: wordId=${wordId}, currentLevel=${currentLevel}, newLevel=${newLevel}`);
    setWordLevel(wordId, newLevel);
    console.log(`[DEBUG] setWordLevel called for ${wordId} with level ${newLevel}`);
  };

  const bulkTaggingRef = useRef(false);

  // Funktion som körs när användaren klickar på bulk-tagging knappen
  const handleBulkTag = (wordList: WordList, level: number) => {
    console.log(`[DEBUG] handleBulkTag called: listId=${wordList.id}, level=${level}, guard=${bulkTaggingRef.current}`);
    
    if (bulkTaggingRef.current) {
      console.log('[DEBUG] Bulk tagging already in progress, skipping...');
      return;
    }
    
    console.log('[DEBUG] Setting guard flag to true');
    bulkTaggingRef.current = true;
    
    const wordsInList = getWordsFromList(wordList, wordDatabase);
    console.log(`[DEBUG] Found ${wordsInList.length} words in list:`, wordsInList.map(w => `${w.id}(${w.ord})`));
    
    console.log(`[DEBUG] Starting bulk tagging ${wordsInList.length} words to level ${level}`);
    
    // Batch-uppdatera alla ord samtidigt
    setWordProgress((prev: WordProgressStorage) => {
      console.log('[DEBUG] setWordProgress callback started');
      const newProgress = { ...prev };
      
      wordsInList.forEach(word => {
        console.log(`[DEBUG] Processing word ${word.id} (${word.ord}) to level ${level}`);
        
        // Behåll befintlig data eller skapa ny
        const current = prev[word.id] || {
          level: 0,
          stats: { correct: 0, incorrect: 0, lastPracticed: '', difficulty: 50 }
        };
        
        console.log(`[DEBUG] Current progress for ${word.id}:`, current);
        
        newProgress[word.id] = {
          ...current,
          level: level
        };
        
        console.log(`[DEBUG] New progress for ${word.id}:`, newProgress[word.id]);
      });
      
      console.log('[DEBUG] setWordProgress callback completed, returning new progress');
      return newProgress;
    });
    
    // Reset flag efter state-uppdatering
    console.log('[DEBUG] Setting timeout to reset guard flag');
    setTimeout(() => {
      console.log('[DEBUG] Timeout executed, resetting guard flag to false');
      bulkTaggingRef.current = false;
    }, 100);
  };

  // Funktion som körs när användaren klickar på expandera/kollapsa ordlista
  const handleToggleList = (wordListId: string) => {
    console.log(`[DEBUG] Toggle list clicked: ${wordListId}, current state: ${expandedLists[wordListId]}`);
    setExpandedLists(prev => {
      const newState = {
        ...prev,
        [wordListId]: !prev[wordListId]
      };
      console.log(`[DEBUG] New expanded state for ${wordListId}: ${newState[wordListId]}`);
      return newState;
    });
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
          case 'points':
            const pointsA = progressA?.points || 0;
            const pointsB = progressB?.points || 0;
            return pointsB - pointsA; // Högst poäng först
          default:
            return a.ord.localeCompare(b.ord, 'sv');
        }
      });

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {`Ord att lära mig (${learningWords.length})`}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Ord som du har markerat som "vill lära sig".
        </Typography>
        
        {/* Sorteringsknappar */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant={sortBy === 'points' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setSortBy('points')}
          >
            Poäng
          </Button>
          <Button
            variant={sortBy === 'name' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setSortBy('name')}
          >
            Namn
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
                        <Box component="span">
                          <Typography component="span" variant="body2" color="text.secondary">
                            {word.beskrivning || 'Ingen beskrivning tillgänglig'}
                          </Typography>
                          {wordProgress[word.id] && (
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {getPointsDisplay(wordProgress[word.id].points || 0)} ({wordProgress[word.id].points || 0}/5)
                              {wordProgress[word.id].stats && (
                                <span> • ✅ {wordProgress[word.id].stats.correct} rätt • ❌ {wordProgress[word.id].stats.incorrect} fel</span>
                              )}
                              {wordProgress[word.id].stats?.lastPracticed ? (
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
  const renderOrdlistor = () => {
    // Definiera svårighetsgrader i ordning
    const difficulties: Array<'nyborjare' | 'lite_erfaren' | 'erfaren' | 'proffs'> = 
      ['nyborjare', 'lite_erfaren', 'erfaren', 'proffs'];
    
    // Filtrera ordlistor baserat på vald svårighetsgrad
    const filteredLists = wordLists.filter(list => list.difficulty === difficulties[difficultyTab]);
    
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Ordlistor
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Klicka på ordlistan för att expandera och se orden. Klicka på progress-cirklarna för att markera ord. ⚪ Ej markerad → 🟡 Vill lära sig → 🟢 Lärt sig
        </Typography>
        
        {/* Svårighetsgrad-tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={difficultyTab} 
            onChange={handleDifficultyTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 40,
                fontSize: '0.8rem',
                textTransform: 'none'
              }
            }}
          >
            {difficulties.map((difficulty, index) => {
              const difficultyInfo = getDifficultyInfo(difficulty);
              return (
                <Tab 
                  key={difficulty}
                  label={`${difficultyInfo.icon} ${difficultyInfo.label}`}
                  sx={{ minWidth: 'auto' }}
                />
              );
            })}
          </Tabs>
        </Box>
        
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
        
        {filteredLists.length > 0 ? (
          filteredLists.map((wordList) => {
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h6">
                            {wordList.name}
                          </Typography>
                          <Chip 
                            label={wordList.type === 'predefined' ? 'Förgenererad' : 'Dynamisk'} 
                            size="small" 
                            color={wordList.type === 'predefined' ? 'primary' : 'secondary'}
                          />
                          <Chip 
                            label={getDifficultyInfo(wordList.difficulty).label}
                            size="small" 
                            color={getDifficultyInfo(wordList.difficulty).color}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {wordList.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {wordsInList.length} ord
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isExpanded ? (
                        <ExpandLess sx={{ color: 'text.secondary' }} />
                      ) : (
                        <ExpandMore sx={{ color: 'text.secondary' }} />
                      )}
                    </Box>
                  </ListItemButton>
                  
                  {/* Expandable content */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, pt: 0 }}>
                      {/* Bulk-tagging knappar med samma design som startguiden */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        mb: 3, 
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                      }}>
                        <Button
                          variant="outlined"
                          size="medium"
                          onClick={() => handleBulkTag(wordList, 2)}
                          startIcon={<CheckCircle />}
                          sx={{ 
                            flex: { xs: 1, sm: '0 1 auto' },
                            minWidth: { xs: '100%', sm: '140px' },
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 'normal',
                            backgroundColor: 'transparent',
                            color: 'success.main',
                            borderColor: 'success.main',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              color: 'success.main',
                              borderColor: 'success.main'
                            }
                          }}
                        >
                          Ja
                        </Button>
                        <Button
                          variant="outlined"
                          size="medium"
                          onClick={() => handleBulkTag(wordList, 1)}
                          sx={{ 
                            flex: { xs: 1, sm: '0 1 auto' },
                            minWidth: { xs: '100%', sm: '140px' },
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 'normal',
                            backgroundColor: 'transparent',
                            color: 'warning.main',
                            borderColor: 'warning.main',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              color: 'warning.main',
                              borderColor: 'warning.main'
                            }
                          }}
                        >
                          Behöver repetera
                        </Button>
                        <Button
                          variant="outlined"
                          size="medium"
                          onClick={() => handleBulkTag(wordList, 1)}
                          sx={{ 
                            flex: { xs: 1, sm: '0 1 auto' },
                            minWidth: { xs: '100%', sm: '140px' },
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 'normal',
                            backgroundColor: 'transparent',
                            color: '#2196F3',
                            borderColor: '#2196F3',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              color: '#2196F3',
                              borderColor: '#2196F3'
                            }
                          }}
                        >
                          Nej
                        </Button>
                        <Button
                          variant="outlined"
                          size="medium"
                          onClick={() => handleBulkTag(wordList, 0)}
                          startIcon={<HourglassEmpty />}
                          sx={{ 
                            flex: { xs: 1, sm: '0 1 auto' },
                            minWidth: { xs: '100%', sm: '140px' },
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 'normal',
                            backgroundColor: 'transparent',
                            color: 'grey.600',
                            borderColor: 'grey.500',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              color: 'grey.600',
                              borderColor: 'grey.500'
                            }
                          }}
                        >
                          Vänta
                        </Button>
                      </Box>
                      
                      {/* Ordlista - Enkel lista */}
                      <Box sx={{ mt: 2 }}>
                        {wordsInList.map((word, index) => (
                          <Box 
                            key={word.id}
                            sx={{ 
                              py: 1.5,
                              px: 2,
                              borderBottom: index < wordsInList.length - 1 ? '1px solid' : 'none',
                              borderColor: 'divider',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {word.ord}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {word.beskrivning}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Inga ordlistor hittades för denna svårighetsgrad.
          </Typography>
        )}
      </Box>
    );
  };

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
                      secondary={
                        <Box component="span">
                          <Typography component="span" variant="body2" color="text.secondary">
                            {word.beskrivning || 'Ingen beskrivning tillgänglig'}
                          </Typography>
                          {wordProgress[word.id] && (
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {getPointsDisplay(wordProgress[word.id].points || 0)} ({wordProgress[word.id].points || 0}/5) ✅ Lärd!
                              {wordProgress[word.id].stats && (
                                <span> • ✅ {wordProgress[word.id].stats.correct} rätt • ❌ {wordProgress[word.id].stats.incorrect} fel</span>
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
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header med titel och ikon */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Ordlistor & Progress
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hantera dina ordlistor och följ din utveckling
        </Typography>
      </Box>

      {/* Sub-tabs för olika kategorier */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 56,
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          <Tab label="Att lära mig" />
          <Tab label="Ordlistor" />
          <Tab label="Lärda" />
        </Tabs>
      </Paper>

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
