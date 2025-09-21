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
  const handleBulkTag = (wordList: WordList, level: number, points?: number) => {
    console.log(`[DEBUG] handleBulkTag called: listId=${wordList.id}, level=${level}, points=${points}, guard=${bulkTaggingRef.current}`);
    
    if (bulkTaggingRef.current) {
      console.log('[DEBUG] Bulk tagging already in progress, skipping...');
      return;
    }
    
    console.log('[DEBUG] Setting guard flag to true');
    bulkTaggingRef.current = true;
    
    const wordsInList = getWordsFromList(wordList, wordDatabase);
    console.log(`[DEBUG] Found ${wordsInList.length} words in list:`, wordsInList.map(w => `${w.id}(${w.ord})`));
    
    console.log(`[DEBUG] Starting bulk tagging ${wordsInList.length} words to level ${level}, points ${points}`);
    
    // Batch-uppdatera alla ord samtidigt
    setWordProgress((prev: WordProgressStorage) => {
      console.log('[DEBUG] setWordProgress callback started');
      const newProgress = { ...prev };
      
      wordsInList.forEach(word => {
        console.log(`[DEBUG] Processing word ${word.id} (${word.ord}) to level ${level}, points ${points}`);
        
        // Behåll befintlig data eller skapa ny
        const current = prev[word.id] || {
          level: 0,
          stats: { correct: 0, incorrect: 0, lastPracticed: '', difficulty: 50 },
          points: 0
        };
        
        console.log(`[DEBUG] Current progress for ${word.id}:`, current);
        
        newProgress[word.id] = {
          ...current,
          level: level,
          points: points !== undefined ? points : current.points
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
              backgroundColor: '#e3f2fd',
              borderColor: '#1976d2',
              color: '#1976d2'
            }}
            onClick={(e) => handleProgressClick(wordId, e)}
          >
            ⚪
          </Box>
        );
      case 2: // Lärt sig
        return (
          <Box
            sx={{
              ...circleStyle,
              backgroundColor: '#e8f5e8',
              borderColor: '#2e7d32',
              color: '#2e7d32'
            }}
            onClick={(e) => handleProgressClick(wordId, e)}
          >
            ✓
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
          Klicka på ordlistan för att expandera och se orden. Använd knapparna för att markera alla ord i ordlistan samtidigt.
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
              <Card key={wordList.id} sx={{ 
                mb: 3,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 0 }}>
                  {/* Ordlista header - klickbar för att expandera */}
                  <ListItemButton 
                    onClick={() => handleToggleList(wordList.id)}
                    sx={{ 
                      borderBottom: isExpanded ? '1px solid' : 'none',
                      borderColor: 'divider',
                      p: 3,
                      backgroundColor: isExpanded ? 'grey.50' : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'primary.50'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {wordList.name}
                          </Typography>
                        </Box>
                      }
                      secondary={null}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* Grön bock om alla ord är lärda */}
                      {(() => {
                        const wordsInList = getWordsFromList(wordList, wordDatabase);
                        const learnedCount = wordsInList.filter(word => wordProgress[word.id] && wordProgress[word.id].level === 2).length;
                        const allLearned = learnedCount === wordsInList.length && wordsInList.length > 0;
                        
                        return allLearned ? (
                          <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
                        ) : null;
                      })()}
                      
                      {isExpanded ? (
                        <ExpandLess sx={{ color: 'text.secondary' }} />
                      ) : (
                        <ExpandMore sx={{ color: 'text.secondary' }} />
                      )}
                    </Box>
                  </ListItemButton>
                  
                  {/* Expandable content */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 4, pt: 0 }}>
                      {/* Beskrivning av ordlistan */}
                      <Box sx={{ 
                        mb: 3, 
                        p: 3, 
                        backgroundColor: 'primary.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'primary.200'
                      }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {wordList.description}
                        </Typography>
                      </Box>
                      
                      {/* Status-visning */}
                      <Box sx={{ 
                        mb: 3, 
                        p: 3, 
                        backgroundColor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Status för orden i denna ordlista:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {(() => {
                            const wordsInList = getWordsFromList(wordList, wordDatabase);
                            const unmarked = wordsInList.filter(word => !wordProgress[word.id] || wordProgress[word.id].level === 0).length;
                            const learning = wordsInList.filter(word => wordProgress[word.id] && wordProgress[word.id].level === 1).length;
                            const learned = wordsInList.filter(word => wordProgress[word.id] && wordProgress[word.id].level === 2).length;
                            
                            return (
                              <>
                                <Typography variant="body2" sx={{ color: 'grey.600' }}>
                                  ⚪ Omarkerade: {unmarked}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#1976d2' }}>
                                  ⚪ Att lära mig: {learning}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                                  ✓ Lärda: {learned}
                                </Typography>
                              </>
                            );
                          })()}
                        </Box>
                      </Box>
                      
                      {/* Ordlista - Inline lista */}
                      <Box sx={{ 
                        mb: 4, 
                        p: 3,
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Typography variant="body1" sx={{ 
                          lineHeight: 1.8,
                          fontSize: '1.1rem'
                        }}>
                        {wordsInList.map((word, index) => {
                            const progress = wordProgress[word.id];
                            let wordStyle: React.CSSProperties = { fontWeight: 500 };
                            
                            if (progress) {
                              if (progress.level === 1) {
                                wordStyle.color = '#1976d2'; // Mer subtil blå
                                wordStyle.backgroundColor = '#e3f2fd';
                                wordStyle.padding = '2px 4px';
                                wordStyle.borderRadius = '3px';
                              } else if (progress.level === 2) {
                                wordStyle.color = '#2e7d32'; // Mer subtil grön
                                wordStyle.backgroundColor = '#e8f5e8';
                                wordStyle.padding = '2px 4px';
                                wordStyle.borderRadius = '3px';
                              }
                            }
                            
                            return (
                              <span key={word.id}>
                                <span style={wordStyle}>
                                  {word.ord}
                                </span>
                                {word.beskrivning && (
                                  <span style={{ color: 'inherit', fontWeight: 400 }}>
                                    {' '}({word.beskrivning})
                                  </span>
                                )}
                                {index < wordsInList.length - 1 && ', '}
                              </span>
                            );
                          })}
                        </Typography>
                      </Box>
                      
                      {/* Text ovanför knapparna */}
                      <Typography variant="h6" color="text.primary" sx={{ 
                        mb: 3, 
                        textAlign: 'center', 
                        fontWeight: 600,
                        color: 'text.primary'
                      }}>
                        Markera alla orden i ordlistan som:
                      </Typography>
                      
                      {/* Bulk-tagging knappar med dynamisk färgkodning */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        mb: 2
                      }}>
                        {(() => {
                          const wordsInList = getWordsFromList(wordList, wordDatabase);
                          const unmarked = wordsInList.filter(word => !wordProgress[word.id] || wordProgress[word.id].level === 0).length;
                          const learning = wordsInList.filter(word => wordProgress[word.id] && wordProgress[word.id].level === 1).length;
                          const learned = wordsInList.filter(word => wordProgress[word.id] && wordProgress[word.id].level === 2).length;
                          const totalWords = wordsInList.length;
                          
                          // Logik för att bestämma vilken knapp som ska vara markerad
                          let activeButton = 'vanta'; // Default
                          
                          if (learned === totalWords && totalWords > 0) {
                            // Alla ord är lärda - "Kan dessa" ska vara grön
                            activeButton = 'kan_dessa';
                          } else if (learning === totalWords && totalWords > 0) {
                            // Alla ord är "vill lära mig" - kontrollera poäng för "Behöver repetera"
                            const wordsWithHighPoints = wordsInList.filter(word => {
                              const progress = wordProgress[word.id];
                              return progress && progress.points > 1;
                            }).length;
                            
                            if (wordsWithHighPoints === totalWords) {
                              // Alla ord har mer än 1 poäng - "Behöver repetera" ska vara markerad
                              activeButton = 'behover_repetera';
                            } else {
                              // Alla ord är "vill lära mig" men inte alla har höga poäng
                              activeButton = 'vill_lara_mig';
                            }
                          } else if (learning > 0 || learned > 0) {
                            // Några ord är markerade som "att lära mig" eller "lärda" - "Vill lära mig" ska vara markerad
                            activeButton = 'vill_lara_mig';
                          } else {
                            // Inga ord är markerade - "Vänta" ska vara markerad
                            activeButton = 'vanta';
                          }
                          
                          return (
                            <>
                              <Button
                                variant={activeButton === 'kan_dessa' ? 'contained' : 'outlined'}
                                size="medium"
                                onClick={() => handleBulkTag(wordList, 2, 5)}
                                startIcon={<CheckCircle />}
                                sx={{ 
                                  flex: { xs: 1, sm: '0 1 auto' },
                                  minWidth: { xs: '100%', sm: '160px' },
                                  py: 2,
                                  px: 3,
                                  borderRadius: 3,
                                  fontWeight: activeButton === 'kan_dessa' ? 700 : 600,
                                  fontSize: '1rem',
                                  textTransform: 'none',
                                  backgroundColor: activeButton === 'kan_dessa' ? 'success.main' : 'transparent',
                                  color: activeButton === 'kan_dessa' ? 'white' : 'success.main',
                                  borderColor: 'success.main',
                                  borderWidth: 2,
                                  boxShadow: activeButton === 'kan_dessa' ? '0 4px 12px rgba(76, 175, 80, 0.3)' : 'none',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: activeButton === 'kan_dessa' ? 'success.dark' : 'success.50',
                                    color: activeButton === 'kan_dessa' ? 'white' : 'success.dark',
                                    borderColor: 'success.dark',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                                  }
                                }}
                              >
                                Kan dessa
                              </Button>
                              <Button
                                variant={activeButton === 'behover_repetera' ? 'contained' : 'outlined'}
                                size="medium"
                                onClick={() => handleBulkTag(wordList, 1, 3)}
                                sx={{ 
                                  flex: { xs: 1, sm: '0 1 auto' },
                                  minWidth: { xs: '100%', sm: '160px' },
                                  py: 2,
                                  px: 3,
                                  borderRadius: 3,
                                  fontWeight: activeButton === 'behover_repetera' ? 700 : 600,
                                  fontSize: '1rem',
                                  textTransform: 'none',
                                  backgroundColor: activeButton === 'behover_repetera' ? 'warning.main' : 'transparent',
                                  color: activeButton === 'behover_repetera' ? 'white' : 'warning.main',
                                  borderColor: 'warning.main',
                                  borderWidth: 2,
                                  boxShadow: activeButton === 'behover_repetera' ? '0 4px 12px rgba(255, 152, 0, 0.3)' : 'none',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: activeButton === 'behover_repetera' ? 'warning.dark' : 'warning.50',
                                    color: activeButton === 'behover_repetera' ? 'white' : 'warning.dark',
                                    borderColor: 'warning.dark',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)'
                                  }
                                }}
                              >
                                Behöver repetera
                              </Button>
                              <Button
                                variant={activeButton === 'vill_lara_mig' ? 'contained' : 'outlined'}
                                size="medium"
                                onClick={() => handleBulkTag(wordList, 1, 0)}
                                sx={{ 
                                  flex: { xs: 1, sm: '0 1 auto' },
                                  minWidth: { xs: '100%', sm: '160px' },
                                  py: 2,
                                  px: 3,
                                  borderRadius: 3,
                                  fontWeight: activeButton === 'vill_lara_mig' ? 700 : 600,
                                  fontSize: '1rem',
                                  textTransform: 'none',
                                  backgroundColor: activeButton === 'vill_lara_mig' ? 'primary.main' : 'transparent',
                                  color: activeButton === 'vill_lara_mig' ? 'white' : 'primary.main',
                                  borderColor: 'primary.main',
                                  borderWidth: 2,
                                  boxShadow: activeButton === 'vill_lara_mig' ? '0 4px 12px rgba(33, 150, 243, 0.3)' : 'none',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: activeButton === 'vill_lara_mig' ? 'primary.dark' : 'primary.50',
                                    color: activeButton === 'vill_lara_mig' ? 'white' : 'primary.dark',
                                    borderColor: 'primary.dark',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)'
                                  }
                                }}
                              >
                                Vill lära mig
                              </Button>
                              <Button
                                variant={activeButton === 'vanta' ? 'contained' : 'outlined'}
                                size="medium"
                                onClick={() => handleBulkTag(wordList, 0)}
                                startIcon={<HourglassEmpty />}
                                sx={{ 
                                  flex: { xs: 1, sm: '0 1 auto' },
                                  minWidth: { xs: '100%', sm: '160px' },
                                  py: 2,
                                  px: 3,
                                  borderRadius: 3,
                                  fontWeight: activeButton === 'vanta' ? 700 : 600,
                                  fontSize: '1rem',
                                  textTransform: 'none',
                                  backgroundColor: activeButton === 'vanta' ? 'grey.600' : 'transparent',
                                  color: activeButton === 'vanta' ? 'white' : 'grey.600',
                                  borderColor: 'grey.600',
                                  borderWidth: 2,
                                  boxShadow: activeButton === 'vanta' ? '0 4px 12px rgba(117, 117, 117, 0.3)' : 'none',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: activeButton === 'vanta' ? 'grey.700' : 'grey.50',
                                    color: activeButton === 'vanta' ? 'white' : 'grey.700',
                                    borderColor: 'grey.700',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(117, 117, 117, 0.4)'
                                  }
                                }}
                              >
                                Vänta
                              </Button>
                            </>
                          );
                        })()}
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
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            <School sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            mb: 2
          }}>
            Ordlistor & Progress
          </Typography>
          <Typography variant="h6" sx={{ 
            opacity: 0.9,
            fontWeight: 300,
            maxWidth: 600,
            mx: 'auto'
          }}>
            Hantera dina ordlistor och följ din utveckling
          </Typography>
        </Box>

        {/* Modern tabs container */}
        <Paper sx={{ 
          mb: 4, 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.primary',
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '2px 2px 0 0'
              }
            }}
          >
            <Tab label="Ordlistor" />
            <Tab label="Att lära mig" />
            <Tab label="Lärda" />
          </Tabs>
        </Paper>

        {/* Content container */}
        <Box sx={{ 
          minHeight: 500,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {activeTab === 0 && renderOrdlistor()}
          {activeTab === 1 && renderAttLaraMig()}
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
    </Box>
  );
};

export default ListorPage;
