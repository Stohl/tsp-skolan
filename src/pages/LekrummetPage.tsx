import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  TextField,
  InputAdornment,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
  Fab
} from '@mui/material';
import {
  Build,
  Add,
  Search,
  ExpandMore,
  ExpandLess,
  Delete,
  Edit,
  PlayArrow,
  ArrowBack,
  Share
} from '@mui/icons-material';
import { useDatabase } from '../contexts/DatabaseContext';
import { getAllWordLists, getWordsFromList, CustomWordList } from '../types/wordLists';

// Interface för delad ordlista från URL
interface SharedWordList {
  name: string;
  wordIds: string[];
}


const LekrummetPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { wordDatabase, wordIndex } = useDatabase();
  const [customWordLists, setCustomWordLists] = useState<CustomWordList[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [showAppLists, setShowAppLists] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSharedDialog, setShowSharedDialog] = useState(false);
  const [sharedWordList, setSharedWordList] = useState<SharedWordList | null>(null);
  const [sortBy, setSortBy] = useState<'alphabetical' | 'recent' | 'lastPracticed'>('recent');
  const [showAllLists, setShowAllLists] = useState(false);
  
  // States för att skapa nya ordlistor
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [wordSearchQuery, setWordSearchQuery] = useState('');
  
  // State för redigering
  const [editingList, setEditingList] = useState<CustomWordList | null>(null);

  // Funktion för att hämta träningsstatistik för en ordlista
  const getListTrainingStats = (list: CustomWordList) => {
    const words = getWordsFromList(list, wordDatabase);
    const wordProgress = JSON.parse(localStorage.getItem('wordProgress') || '{}');
    
    let lastPracticed: Date | null = null;
    let correctCount = 0;
    let totalAttempts = 0;
    
    words.forEach(word => {
      const progress = wordProgress[word.id];
      if (progress?.stats) {
        // Hitta senaste träningsdatum
        if (progress.stats.lastPracticed) {
          const practicedDate = new Date(progress.stats.lastPracticed);
          if (!lastPracticed || practicedDate > lastPracticed) {
            lastPracticed = practicedDate;
          }
        }
        
        // Räkna totala försök och rätta svar
        if (progress.stats.totalAttempts) {
          totalAttempts += progress.stats.totalAttempts;
        }
        if (progress.stats.correctAttempts) {
          correctCount += progress.stats.correctAttempts;
        }
      }
    });
    
    return {
      lastPracticed,
      correctCount,
      totalAttempts,
      wordCount: words.length
    };
  };

  // Funktion för att formatera tid sedan senaste träning
  const formatTimeSinceLastPractice = (lastPracticed: Date | null) => {
    if (!lastPracticed) return 'Aldrig tränat';
    
    const now = new Date();
    const diffMs = now.getTime() - lastPracticed.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Idag';
    if (diffDays === 1) return 'Igår';
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} veckor sedan`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} månader sedan`;
    return `${Math.floor(diffDays / 365)} år sedan`;
  };
  

  // Ladda anpassade ordlistor från localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customWordLists');
    if (saved) {
      try {
        setCustomWordLists(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading custom word lists:', error);
      }
    }
  }, []);

  // Kontrollera om det finns delad ordlista i URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const wordlistName = urlParams.get('wordlist');
    const wordIds = urlParams.getAll('wordid');
    
    if (wordlistName && wordIds.length > 0) {
      // Validera att alla wordIds finns i databasen
      const validWordIds = wordIds.filter(id => wordDatabase[id]);
      
      if (validWordIds.length > 0) {
        setSharedWordList({
          name: wordlistName,
          wordIds: validWordIds
        });
        setShowSharedDialog(true);
      }
    }
  }, [wordDatabase]);

  // Spara anpassade ordlistor till localStorage
  const saveCustomWordLists = (lists: CustomWordList[]) => {
    setCustomWordLists(lists);
    localStorage.setItem('customWordLists', JSON.stringify(lists));
  };

  // Hämta alla ordlistor från appen
  const appWordLists = useMemo(() => {
    return getAllWordLists(wordDatabase);
  }, [wordDatabase]);

  // Kombinerad sökfunktion för både ord och ordlistor
  const combinedSearchResults = useMemo(() => {
    if (!wordSearchQuery.trim() || !wordDatabase) return { words: [], wordLists: [] };
    
    const query = wordSearchQuery.toLowerCase();
    
    // Sök ord
    const wordResults = Object.values(wordDatabase)
      .filter(word => 
        word.ord.toLowerCase().includes(query) ||
        word.beskrivning?.toLowerCase().includes(query)
      )
      .slice(0, 10); // Bara första 10 resultaten
    
    // Sök ordlistor
    const wordListResults = appWordLists
      .filter(list => 
        list.name.toLowerCase().includes(query) ||
        list.description.toLowerCase().includes(query)
      )
      .slice(0, 5); // Bara första 5 resultaten
    
    return { words: wordResults, wordLists: wordListResults };
  }, [wordSearchQuery, wordDatabase, appWordLists]);

  // Sök ordlistor i appen
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return appWordLists;
    
    const query = searchQuery.toLowerCase();
    return appWordLists.filter(list => 
      list.name.toLowerCase().includes(query) ||
      list.description.toLowerCase().includes(query)
    );
  }, [searchQuery, appWordLists]);

  // Sortera anpassade ordlistor
  const sortedCustomLists = useMemo(() => {
    const sorted = [...customWordLists].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'lastPracticed') {
        const statsA = getListTrainingStats(a);
        const statsB = getListTrainingStats(b);
        
        // Ordlistor som aldrig tränats hamnar sist
        if (!statsA.lastPracticed && !statsB.lastPracticed) return 0;
        if (!statsA.lastPracticed) return 1;
        if (!statsB.lastPracticed) return -1;
        
        // Sortera efter senaste träning (nyast först)
        return (statsB.lastPracticed as Date).getTime() - (statsA.lastPracticed as Date).getTime();
      } else {
        // 'recent' - sortera efter skapelsedatum
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    // Visa max 10 ordlistor om inte expanderat
    return showAllLists ? sorted : sorted.slice(0, 10);
  }, [customWordLists, sortBy, showAllLists]);

  // Hantera val av ordlistor
  const handleListToggle = (listId: string) => {
    setSelectedLists(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  // Räkna totalt antal ord från valda listor
  const totalSelectedWords = useMemo(() => {
    let total = 0;
    selectedLists.forEach(listId => {
      // Hitta ordlistan (antingen från appens listor eller egna listor)
      const appList = appWordLists.find(list => list.id === listId);
      const customList = customWordLists.find(list => list.id === listId);
      const wordList = appList || customList;
      
      if (wordList) {
        const words = getWordsFromList(wordList, wordDatabase);
        total += words.length;
      }
    });
    return total;
  }, [selectedLists, wordDatabase, appWordLists, customWordLists]);

  // Starta övning med valda ordlistor
  const handleStartExercise = (exerciseType: 'flashcards' | 'quiz') => {
    if (selectedLists.length === 0) return;
    
    // Samla alla ord från valda listor
    const allWords: any[] = [];
    selectedLists.forEach(listId => {
      const appList = appWordLists.find(list => list.id === listId);
      const customList = customWordLists.find(list => list.id === listId);
      const wordList = appList || customList;
      
      if (wordList) {
        const words = getWordsFromList(wordList, wordDatabase);
        allWords.push(...words);
      }
    });
    
    // Ta bort dubletter baserat på word.id
    const uniqueWords = allWords.filter((word, index, arr) => 
      arr.findIndex(w => w.id === word.id) === index
    );
    
    if (uniqueWords.length === 0) {
      alert('Inga ord hittades i de valda ordlistorna.');
      return;
    }
    
    // Spara ordlistan i localStorage så OvningPage kan använda den
    localStorage.setItem('customExerciseWords', JSON.stringify(uniqueWords));
    
    // Navigera till ÖvningPage (page 0) och triggera övning
    window.history.pushState(
      { page: 0, showHelp: false, showKorpus: false, showLekrummet: false },
      '',
      window.location.href
    );
    
    // Triggera navigation till ÖvningPage
    window.dispatchEvent(new CustomEvent('navigateToExercise'));
    
    // Triggera övning via custom event med övningstyp
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('startCustomExercise', { 
        detail: { words: uniqueWords, exerciseType } 
      }));
    }, 100);
  };


  // Hantera val av ord för nya ordlistor
  const handleWordToggle = (wordId: string) => {
    setSelectedWordIds(prev => 
      prev.includes(wordId) 
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );
  };

  // Hantera borttagning av valda ord
  const handleRemoveWord = (wordId: string) => {
    setSelectedWordIds(prev => prev.filter(id => id !== wordId));
  };

  // Skapa ny ordlista eller uppdatera befintlig
  const handleCreateList = () => {
    if (!newListName.trim() || selectedWordIds.length === 0) return;
    
    if (editingList) {
      // Uppdatera befintlig ordlista
      const updatedList: CustomWordList = {
        ...editingList,
        name: newListName.trim(),
        description: newListDescription.trim() || 'Anpassad ordlista',
        wordIds: selectedWordIds,
      };
      
      const updatedLists = customWordLists.map(list => 
        list.id === editingList.id ? updatedList : list
      );
      saveCustomWordLists(updatedLists);
    } else {
      // Skapa ny ordlista
      const newList: CustomWordList = {
        id: `custom_${Date.now()}`,
        name: newListName.trim(),
        description: newListDescription.trim() || 'Anpassad ordlista',
        wordIds: selectedWordIds,
        type: 'custom',
        createdAt: new Date().toISOString(),
        isShared: false,
        priority: 1000, // Lägre prioritet än appens ordlistor
        difficulty: 'nyborjare' // Default svårighetsgrad
      };
      
      saveCustomWordLists([...customWordLists, newList]);
    }
    
    // Återställ formulär
    setNewListName('');
    setNewListDescription('');
    setSelectedWordIds([]);
    setWordSearchQuery('');
    setEditingList(null);
    setShowCreateDialog(false);
  };

  // Funktioner för att hantera egna ordlistor
  const handleShareList = (list: CustomWordList) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const wordIds = list.wordIds.map(id => `wordid=${id}`).join('&');
    const shareUrl = `${baseUrl}?wordlist=${encodeURIComponent(list.name)}&${wordIds}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`Länk till ordlistan "${list.name}" kopierad till urklipp!`);
    }).catch(() => {
      // Fallback för äldre webbläsare
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`Länk till ordlistan "${list.name}" kopierad till urklipp!`);
    });
  };

  const handleEditList = (list: CustomWordList) => {
    setEditingList(list);
    setNewListName(list.name);
    setNewListDescription(list.description);
    setSelectedWordIds([...list.wordIds]);
    setShowCreateDialog(true);
  };

  const handleDeleteList = (list: CustomWordList) => {
    if (window.confirm(`Är du säker på att du vill ta bort ordlistan "${list.name}"?`)) {
      const updatedLists = customWordLists.filter(l => l.id !== list.id);
      saveCustomWordLists(updatedLists);
    }
  };

  // Ta emot delad ordlista
  const handleAcceptSharedList = () => {
    if (!sharedWordList) return;
    
    const newList: CustomWordList = {
      id: `custom_${Date.now()}`,
      name: sharedWordList.name,
      description: 'Delad ordlista',
      wordIds: sharedWordList.wordIds,
      type: 'custom',
      createdAt: new Date().toISOString(),
      isShared: true,
      priority: 1000, // Lägre prioritet än appens ordlistor
      difficulty: 'nyborjare' // Default svårighetsgrad
    };
    
    saveCustomWordLists([...customWordLists, newList]);
    setShowSharedDialog(false);
    setSharedWordList(null);
    
    // Rensa URL-parametrar
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      {/* Header med tillbaka-knapp */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1, textAlign: 'center' }}>
          🛠️ Lekrummet
        </Typography>
      </Box>

      {/* Skapa ny ordlista */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateDialog(true)}
            sx={{ width: '100%' }}
          >
            📝 Skapa ny ordlista
          </Button>
        </CardContent>
      </Card>

      {/* Mina ordlistor */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              📚 Mina ordlistor ({customWordLists.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                size="small"
                variant={sortBy === 'recent' ? 'contained' : 'outlined'}
                onClick={() => setSortBy('recent')}
              >
                Senast skapade
              </Button>
              <Button
                size="small"
                variant={sortBy === 'alphabetical' ? 'contained' : 'outlined'}
                onClick={() => setSortBy('alphabetical')}
              >
                A-Ö
              </Button>
              <Button
                size="small"
                variant={sortBy === 'lastPracticed' ? 'contained' : 'outlined'}
                onClick={() => setSortBy('lastPracticed')}
              >
                Senast tränat
              </Button>
              {customWordLists.length > 10 && (
                <Button
                  size="small"
                  onClick={() => setShowAllLists(!showAllLists)}
                  startIcon={showAllLists ? <ExpandLess /> : <ExpandMore />}
                >
                  {showAllLists ? 'Visa färre' : `Visa alla (${customWordLists.length})`}
                </Button>
              )}
            </Box>
          </Box>
          
          {!showAllLists && customWordLists.length > 10 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
              Visar {Math.min(10, customWordLists.length)} av {customWordLists.length} ordlistor
            </Typography>
          )}
          
          {sortedCustomLists.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Inga egna ordlistor än. Skapa din första!
            </Typography>
          ) : (
            <List>
              {sortedCustomLists.map((list) => {
                const stats = getListTrainingStats(list);
                const timeSince = formatTimeSinceLastPractice(stats.lastPracticed);
                const scoreText = stats.totalAttempts > 0 ? `${stats.correctCount}/${stats.totalAttempts}` : 'Ingen träning';
                
                return (
                  <ListItem key={list.id} sx={{ px: 0 }}>
                    <Checkbox
                      checked={selectedLists.includes(list.id)}
                      onChange={() => handleListToggle(list.id)}
                    />
                    <ListItemText
                      primary={list.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {stats.wordCount} ord • Skapad {new Date(list.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Senast tränat: {timeSince} • Senaste resultat: {scoreText}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => handleEditList(list)}>
                        <Edit />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Appens ordlistor */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              📖 Appens ordlistor ({appWordLists.length})
            </Typography>
            <IconButton onClick={() => setShowAppLists(!showAppLists)}>
              {showAppLists ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={showAppLists}>
            <TextField
              fullWidth
              placeholder="Sök ordlistor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <List>
              {searchResults.map((list) => {
                const wordCount = getWordsFromList(list, wordDatabase).length;
                return (
                  <ListItem key={list.id} sx={{ px: 0 }}>
                    <Checkbox
                      checked={selectedLists.includes(list.id)}
                      onChange={() => handleListToggle(list.id)}
                    />
                    <ListItemText
                      primary={list.name}
                      secondary={`${wordCount} ord • ${list.description}`}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </CardContent>
      </Card>

      {/* Starta övning */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Valda för övning ({selectedLists.length} listor)
            </Typography>
            <Typography variant="h6" color="primary">
              {totalSelectedWords} ord
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={() => handleStartExercise('flashcards')}
              disabled={selectedLists.length === 0}
              sx={{ py: 2, textTransform: 'none', fontSize: '1.1rem' }}
            >
              🙌 Teckna själv ({totalSelectedWords} ord)
            </Button>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={() => handleStartExercise('quiz')}
              disabled={selectedLists.length === 0}
              sx={{ py: 2, textTransform: 'none', fontSize: '1.1rem' }}
            >
              👀 Se tecknet ({totalSelectedWords} ord)
            </Button>
          </Box>
        </CardContent>
      </Card>



      {/* Dialog för att skapa nya ordlistor */}
      <Dialog open={showCreateDialog} onClose={() => {
        setShowCreateDialog(false);
        setEditingList(null);
        setNewListName('');
        setNewListDescription('');
        setSelectedWordIds([]);
        setWordSearchQuery('');
      }} maxWidth="md" fullWidth>
        <DialogTitle>{editingList ? 'Redigera ordlista' : 'Skapa ny ordlista'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Namn på ordlista"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Beskrivning (valfritt)"
            value={newListDescription}
            onChange={(e) => setNewListDescription(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            Sök och lägg till ord eller ordlistor
          </Typography>
          <TextField
            fullWidth
            placeholder="Sök ord eller ordlistor..."
            value={wordSearchQuery}
            onChange={(e) => setWordSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {(combinedSearchResults.words.length > 0 || combinedSearchResults.wordLists.length > 0) && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Sökresultat:
              </Typography>
              <List sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
                {/* Visa ord först */}
                {combinedSearchResults.words.map((word) => (
                  <ListItem key={`word-${word.id}`} sx={{ px: 0 }}>
                    <Checkbox
                      checked={selectedWordIds.includes(word.id)}
                      onChange={() => handleWordToggle(word.id)}
                    />
                    <ListItemText
                      primary={word.ord}
                      secondary={`Ord • ${word.beskrivning}`}
                    />
                  </ListItem>
                ))}
                
                {/* Visa ordlistor sedan */}
                {combinedSearchResults.wordLists.map((list) => {
                  const words = getWordsFromList(list, wordDatabase);
                  const alreadySelected = words.every(word => selectedWordIds.includes(word.id));
                  const partiallySelected = words.some(word => selectedWordIds.includes(word.id));
                  
                  return (
                    <ListItem key={`list-${list.id}`} sx={{ px: 0 }}>
                      <Checkbox
                        checked={alreadySelected}
                        indeterminate={partiallySelected && !alreadySelected}
                        onChange={() => {
                          if (alreadySelected) {
                            // Ta bort alla ord från denna lista
                            const wordsToRemove = words.map(w => w.id);
                            setSelectedWordIds(prev => prev.filter(id => !wordsToRemove.includes(id)));
                          } else {
                            // Lägg till alla ord från denna lista (ta bort dubletter)
                            const wordsToAdd = words.map(w => w.id);
                            setSelectedWordIds(prev => {
                              const combined = [...prev, ...wordsToAdd];
                              return combined.filter((id, index) => combined.indexOf(id) === index);
                            });
                          }
                        }}
                      />
                      <ListItemText
                        primary={list.name}
                        secondary={`Ordlista • ${words.length} ord • ${list.description}`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
          
          {selectedWordIds.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Valda ord ({selectedWordIds.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedWordIds.map((wordId) => {
                  const word = wordDatabase[wordId];
                  return word ? (
                    <Chip
                      key={wordId}
                      label={word.ord}
                      onDelete={() => handleRemoveWord(wordId)}
                      color="primary"
                      variant="outlined"
                    />
                  ) : null;
                })}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowCreateDialog(false);
            setEditingList(null);
            setNewListName('');
            setNewListDescription('');
            setSelectedWordIds([]);
            setWordSearchQuery('');
          }}>
            Avbryt
          </Button>
          
          {editingList && (
            <>
              <Button 
                onClick={() => handleShareList(editingList)}
                startIcon={<Share />}
                color="info"
              >
                Dela
              </Button>
              <Button 
                onClick={() => handleDeleteList(editingList)}
                startIcon={<Delete />}
                color="error"
              >
                Ta bort
              </Button>
            </>
          )}
          
          <Button 
            onClick={handleCreateList} 
            variant="contained"
            disabled={!newListName.trim() || selectedWordIds.length === 0}
          >
            {editingList ? 'Uppdatera ordlista' : 'Skapa ordlista'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog för delad ordlista */}
      <Dialog open={showSharedDialog} onClose={() => setShowSharedDialog(false)}>
        <DialogTitle>Delad ordlista</DialogTitle>
        <DialogContent>
          {sharedWordList && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {sharedWordList.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {sharedWordList.wordIds.length} ord
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Vill du spara denna ordlista i ditt Lekrum?
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSharedDialog(false)}>
            Avbryt
          </Button>
          <Button onClick={handleAcceptSharedList} variant="contained">
            Spara ordlista
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LekrummetPage;
