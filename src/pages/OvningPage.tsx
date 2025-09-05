import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Fab,
  Paper
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Cancel,
  Refresh,
  Timer,
  School,
  Quiz,
  Gesture
} from '@mui/icons-material';
import { useDatabase } from '../contexts/DatabaseContext';
import { useWordProgress } from '../hooks/usePersistentState';

// Enum för övningstyper
enum ExerciseType {
  FLASHCARDS = 'flashcards',
  QUIZ = 'quiz',
  SIGN = 'sign'
}

// Interface för övningsresultat
interface ExerciseResult {
  wordId: string;
  isCorrect: boolean;
  exerciseType: ExerciseType;
  timestamp: string;
}

// Komponent för Flashcards-övning
const FlashcardsExercise: React.FC<{
  word: any;
  onResult: (isCorrect: boolean) => void;
  onSkip: () => void;
}> = ({ word, onResult, onSkip }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Återställ state när ordet ändras
  useEffect(() => {
    setShowVideo(false);
    setCountdown(null);
  }, [word.id]);

  // Starta countdown när komponenten laddas
  useEffect(() => {
    if (!showVideo) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showVideo]);

  const handleFlipCard = () => {
    setShowVideo(true);
  };

  const handleResult = (isCorrect: boolean) => {
    onResult(isCorrect);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        {!showVideo ? (
          // Visa ordet
          <Box>
            <Typography variant="h4" gutterBottom>
              {word.ord}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {word.beskrivning || 'Ingen beskrivning tillgänglig'}
            </Typography>
            
            {countdown !== null && countdown > 0 && (
              <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                {countdown}...
              </Typography>
            )}
            
            <Button
              variant="contained"
              size="large"
              onClick={handleFlipCard}
              disabled={countdown !== null && countdown > 0}
              startIcon={<PlayArrow />}
              sx={{ mb: 2 }}
            >
              Visa tecknet
            </Button>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={onSkip}
                sx={{ mr: 1 }}
              >
                Hoppa över
              </Button>
            </Box>
          </Box>
        ) : (
          // Visa videon och resultat-knappar
          <Box>
            {word.video_url && (
              <Box sx={{ mb: 3 }}>
                <video
                  key={word.id} // Tvingar React att skapa ny video när ordet ändras
                  controls
                  autoPlay
                  muted
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <source src={word.video_url} type="video/mp4" />
                  Din webbläsare stöder inte video-elementet.
                </video>
              </Box>
            )}
            
            <Typography variant="h6" gutterBottom>
              Kunde du teckna ordet korrekt?
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={() => handleResult(true)}
                startIcon={<CheckCircle />}
              >
                Ja, jag kunde
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                onClick={() => handleResult(false)}
                startIcon={<Cancel />}
              >
                Nej, jag kunde inte
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Komponent för Quiz-övning
const QuizExercise: React.FC<{
  word: any;
  allWords: any[];
  onResult: (isCorrect: boolean) => void;
  onSkip: () => void;
}> = ({ word, allWords, onResult, onSkip }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generera felaktiga alternativ
  const getWrongAnswers = () => {
    const wrongWords = allWords
      .filter(w => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return wrongWords.map(w => ({ id: w.id, text: w.ord }));
  };

  // Använd useMemo för att generera svarsalternativ när ordet ändras
  const answers = useMemo(() => {
    const wrongAnswers = getWrongAnswers();
    const correctAnswer = { id: word.id, text: word.ord };
    const allAnswers = [...wrongAnswers, correctAnswer];
    return allAnswers.sort(() => Math.random() - 0.5); // Blanda svaren
  }, [word.id, allWords]); // Uppdatera när ordet eller allWords ändras

  // Återställ state när ordet ändras
  useEffect(() => {
    // Rensa eventuell pågående timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setSelectedAnswer(null);
    setShowResult(false);
  }, [word.id]);

  // Cleanup timeout när komponenten unmountas
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAnswerSelect = (answerId: string) => {
    if (selectedAnswer || showResult) return;
    
    setSelectedAnswer(answerId);
    setShowResult(true);
    
    const isCorrect = answerId === word.id;
    const timeout = setTimeout(() => onResult(isCorrect), 2000);
    timeoutRef.current = timeout;
  };

  const isCorrectAnswer = (answerId: string) => answerId === word.id;

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        {/* Fråga */}
        <Box sx={{ mb: 4 }}>
          {word.video_url && (
            <Box sx={{ mb: 3 }}>
              <video
                key={word.id} // Tvingar React att skapa ny video när ordet ändras
                controls
                autoPlay
                muted
                style={{ 
                  width: '100%', 
                  maxWidth: '400px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                <source src={word.video_url} type="video/mp4" />
                Din webbläsare stöder inte video-elementet.
              </video>
            </Box>
          )}
          
          <Typography variant="h5" gutterBottom>
            Vilket ord visar videon?
          </Typography>
        </Box>

        {/* Svarsalternativ */}
        <List>
          {answers.map((answer, index) => (
            <React.Fragment key={answer.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleAnswerSelect(answer.id)}
                  disabled={selectedAnswer !== null || showResult}
                  sx={{
                    border: selectedAnswer === answer.id ? '2px solid' : '1px solid',
                    borderColor: showResult 
                      ? (isCorrectAnswer(answer.id) ? 'success.main' : 'error.main')
                      : 'divider',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: showResult 
                      ? (isCorrectAnswer(answer.id) ? 'success.light' : 'error.light')
                      : 'transparent'
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        {String.fromCharCode(65 + index)}. {answer.text}
                      </Typography>
                    }
                  />
                  {showResult && isCorrectAnswer(answer.id) && (
                    <CheckCircle color="success" />
                  )}
                </ListItemButton>
              </ListItem>
              {index < answers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* Resultat */}
        {showResult && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color={isCorrectAnswer(selectedAnswer || '') ? 'success.main' : 'error.main'}>
              {isCorrectAnswer(selectedAnswer || '') ? 'Rätt!' : 'Fel!'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Rätt svar: {word.ord}
            </Typography>
          </Box>
        )}

        {/* Hoppa över knapp */}
        {!showResult && (
          <Button
            variant="outlined"
            onClick={onSkip}
            sx={{ mt: 2 }}
          >
            Hoppa över
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Komponent för Teckna-övning
const SignExercise: React.FC<{
  word: any;
  onResult: (isCorrect: boolean) => void;
  onSkip: () => void;
}> = ({ word, onResult, onSkip }) => {
  const [countdown, setCountdown] = useState(5);
  const [showVideo, setShowVideo] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(true);

  // Återställ state när ordet ändras
  useEffect(() => {
    setCountdown(5);
    setShowVideo(false);
    setIsCountingDown(true);
  }, [word.id]);

  // Countdown timer
  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isCountingDown) {
      setIsCountingDown(false);
      setShowVideo(true);
    }
  }, [countdown, isCountingDown]);

  const handleResult = (isCorrect: boolean) => {
    onResult(isCorrect);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        {isCountingDown ? (
          // Countdown-fas
          <Box>
            <Typography variant="h4" gutterBottom>
              {word.ord}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Teckna ordet själv!
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <Timer color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h2" color="primary">
                {countdown}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Förbered dig för att teckna ordet...
            </Typography>
          </Box>
        ) : showVideo ? (
          // Visa videon och resultat-knappar
          <Box>
            {word.video_url && (
              <Box sx={{ mb: 3 }}>
                <video
                  key={word.id} // Tvingar React att skapa ny video när ordet ändras
                  controls
                  autoPlay
                  muted
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <source src={word.video_url} type="video/mp4" />
                  Din webbläsare stöder inte video-elementet.
                </video>
              </Box>
            )}
            
            <Typography variant="h6" gutterBottom>
              Tecknade du ordet korrekt?
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={() => handleResult(true)}
                startIcon={<CheckCircle />}
              >
                Ja, jag tecknade rätt
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                onClick={() => handleResult(false)}
                startIcon={<Cancel />}
              >
                Nej, jag tecknade fel
              </Button>
            </Box>
          </Box>
        ) : (
          // Visa ordet igen
          <Box>
            <Typography variant="h4" gutterBottom>
              {word.ord}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Förbered dig för att teckna ordet...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Huvudkomponent för övningssidan
const OvningPage: React.FC = () => {
  const { wordDatabase, isLoading, error } = useDatabase();
  const { getWordsForPractice, markWordResult, setWordLevel, wordProgress } = useWordProgress();
  
  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [learningWordsOnly, setLearningWordsOnly] = useState(false);

  // Beräkna ord för övning med useMemo för att undvika oändlig loop
  const practiceWords = useMemo(() => {
    if (Object.keys(wordDatabase).length === 0) return [];
    
    const wordsWithProgress = Object.entries(wordDatabase).map(([wordId, word]: [string, any]) => ({
      ...word,
      progress: wordProgress[wordId] || {
        level: 0,
        stats: { correct: 0, incorrect: 0, lastPracticed: new Date().toISOString(), difficulty: 50 }
      }
    }));

    // Om learningWordsOnly är aktiverat, filtrera bara ord som användaren vill lära sig
    let filteredWords = wordsWithProgress;
    if (learningWordsOnly) {
      filteredWords = wordsWithProgress.filter(word => word.progress.level === 1);
    }

    // Sortera ord för övning:
    // 1. Ord markerade som "vill lära mig" (nivå 1) först
    // 2. Sedan efter svårighetsgrad (högst först)
    // 3. Sedan efter senast övade (längst tillbaka först)
    const sortedWords = filteredWords
      .sort((a, b) => {
        // Prioritera ord som användaren vill lära sig (nivå 1)
        const levelA = a.progress.level;
        const levelB = b.progress.level;
        
        // Om ena är nivå 1 och andra inte, prioritera nivå 1
        if (levelA === 1 && levelB !== 1) return -1;
        if (levelA !== 1 && levelB === 1) return 1;
        
        // Om båda är nivå 1 eller båda inte är nivå 1, sortera efter svårighetsgrad
        const difficultyDiff = b.progress.stats.difficulty - a.progress.stats.difficulty;
        if (difficultyDiff !== 0) return difficultyDiff;
        
        // Om svårighetsgrad är samma, sortera efter senast övade
        const lastPracticedA = new Date(a.progress.stats.lastPracticed).getTime();
        const lastPracticedB = new Date(b.progress.stats.lastPracticed).getTime();
        return lastPracticedA - lastPracticedB;
      })
      .slice(0, 10);

    // Om inga ord hittas för övning, använd alla ord
    if (sortedWords.length === 0) {
      return Object.values(wordDatabase).slice(0, 10);
    }
    
    return sortedWords;
  }, [wordDatabase, wordProgress, learningWordsOnly]); // Lägg till learningWordsOnly som dependency

  // Funktion för att ladda bara ord som användaren vill lära sig
  const loadLearningWordsOnly = () => {
    setLearningWordsOnly(true);
    setCurrentWordIndex(0);
    setResults([]);
    setShowResults(false);
  };

  // Funktion som körs när användaren väljer övningstyp
  const handleExerciseTypeSelect = (exerciseType: ExerciseType) => {
    setSelectedExerciseType(exerciseType);
    setCurrentWordIndex(0);
    setResults([]);
    setShowResults(false);
  };

  // Funktion som körs när användaren slutför en övning
  const handleExerciseResult = (isCorrect: boolean) => {
    const currentWord = practiceWords[currentWordIndex];
    if (!currentWord) return;

    // Spara resultat
    const result: ExerciseResult = {
      wordId: currentWord.id,
      isCorrect,
      exerciseType: selectedExerciseType!,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => [...prev, result]);
    markWordResult(currentWord.id, isCorrect);

    // Gå till nästa ord eller visa resultat direkt (utan timeout)
    if (currentWordIndex < practiceWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  // Funktion som körs när användaren hoppar över en övning
  const handleSkip = () => {
    if (currentWordIndex < practiceWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  // Funktion som körs när användaren startar om övningen
  const handleRestart = () => {
    setSelectedExerciseType(null);
    setCurrentWordIndex(0);
    setResults([]);
    setShowResults(false);
    setLearningWordsOnly(false);
  };

  // Funktion som körs när användaren går tillbaka till menyn
  const handleBackToMenu = () => {
    setSelectedExerciseType(null);
    setCurrentWordIndex(0);
    setResults([]);
    setShowResults(false);
    setLearningWordsOnly(false);
  };

  // Beräkna statistik
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const totalAnswers = results.length;
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography variant="h6">Laddar övningar...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">Fel: {error}</Typography>
      </Container>
    );
  }

  // Visa övningstyp-val om ingen är vald
  if (!selectedExerciseType) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Välj övningstyp
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Välj hur du vill öva på orden
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
              }}
              onClick={() => handleExerciseTypeSelect(ExerciseType.FLASHCARDS)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Flashcards
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Se ordet och vänd kortet för att se tecknet. Markera om du kunde ordet eller inte.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
              }}
              onClick={() => handleExerciseTypeSelect(ExerciseType.QUIZ)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Quiz sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Flervalsquiz
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Se videon och välj rätt ord från flera alternativ.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
              }}
              onClick={() => handleExerciseTypeSelect(ExerciseType.SIGN)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Gesture sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Teckna
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Se ordet, teckna själv, och jämför med videon.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Progress-info */}
        {practiceWords.length > 0 && (
          <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Din progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {practiceWords.length} ord redo för övning
            </Typography>
            
            {/* Visa hur många ord som är markerade som "vill lära mig" */}
            {(() => {
              const learningWords = practiceWords.filter(word => 
                word.progress?.level === 1
              );
              const otherWords = practiceWords.filter(word => 
                word.progress?.level !== 1
              );
              
              return (
                <Box sx={{ mt: 2 }}>
                  {learningWords.length > 0 && (
                    <Typography variant="body2" color="primary.main">
                      🟡 {learningWords.length} ord markerade som "vill lära mig" (prioriterade)
                    </Typography>
                  )}
                  {otherWords.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      ⚪ {otherWords.length} andra ord baserat på svårighetsgrad
                    </Typography>
                  )}
                  
                  {/* Knapp för att bara öva på ord som användaren vill lära sig */}
                  {(() => {
                    const allLearningWords = Object.entries(wordDatabase).filter(([wordId, word]: [string, any]) => {
                      const progress = wordProgress[wordId];
                      return progress?.level === 1;
                    });
                    
                    if (allLearningWords.length > 0) {
                      return (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={loadLearningWordsOnly}
                          sx={{ mt: 2 }}
                        >
                          Öva bara på ord jag vill lära mig ({allLearningWords.length})
                        </Button>
                      );
                    }
                    return null;
                  })()}
                </Box>
              );
            })()}
          </Paper>
        )}
      </Container>
    );
  }

  // Visa resultat-dialog
  if (showResults) {
    return (
      <Dialog open={showResults} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" align="center">
            Övning slutförd!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {accuracy}% rätt
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {correctAnswers} av {totalAnswers} rätt
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resultat per ord:
              </Typography>
              <List>
                {results.map((result, index) => {
                  const word = practiceWords[index];
                  return (
                    <ListItem key={result.wordId}>
                      <ListItemText
                        primary={word?.ord}
                        secondary={`${result.isCorrect ? 'Rätt' : 'Fel'} - ${result.exerciseType}`}
                      />
                      {result.isCorrect ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
          <Button onClick={handleBackToMenu} variant="outlined">
            Tillbaka till menyn
          </Button>
          <Button onClick={handleRestart} variant="contained">
            Öva igen
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Visa aktuell övning
  const currentWord = practiceWords[currentWordIndex];
  if (!currentWord) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6">Inga ord tillgängliga för övning</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header med progress */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {selectedExerciseType === ExerciseType.FLASHCARDS && 'Flashcards'}
          {selectedExerciseType === ExerciseType.QUIZ && 'Flervalsquiz'}
          {selectedExerciseType === ExerciseType.SIGN && 'Teckna'}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Ord {currentWordIndex + 1} av {practiceWords.length}
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={((currentWordIndex + 1) / practiceWords.length) * 100}
          sx={{ mb: 2 }}
        />

        {/* Debug: Manuell nästa-knapp */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              console.log('Manuell nästa-knapp klickad');
              if (currentWordIndex < practiceWords.length - 1) {
                setCurrentWordIndex(prev => prev + 1);
              } else {
                setShowResults(true);
              }
            }}
          >
            Nästa ord (debug)
          </Button>
        </Box>
      </Box>

      {/* Övningskomponent */}
      {selectedExerciseType === ExerciseType.FLASHCARDS && (
        <FlashcardsExercise
          word={currentWord}
          onResult={handleExerciseResult}
          onSkip={handleSkip}
        />
      )}
      
      {selectedExerciseType === ExerciseType.QUIZ && (
        <QuizExercise
          word={currentWord}
          allWords={practiceWords}
          onResult={handleExerciseResult}
          onSkip={handleSkip}
        />
      )}
      
      {selectedExerciseType === ExerciseType.SIGN && (
        <SignExercise
          word={currentWord}
          onResult={handleExerciseResult}
          onSkip={handleSkip}
        />
      )}

      {/* Floating Action Button för att avbryta */}
      <Fab
        color="secondary"
        aria-label="avbryt"
        onClick={handleBackToMenu}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Refresh />
      </Fab>

      {/* Debug-knapp för att testa navigering */}
      <Fab
        color="primary"
        aria-label="debug"
        onClick={() => {
          console.log('Debug info:');
          console.log('Current word index:', currentWordIndex);
          console.log('Practice words length:', practiceWords.length);
          console.log('Current word:', practiceWords[currentWordIndex]);
          console.log('Results:', results);
        }}
        sx={{ position: 'fixed', bottom: 16, right: 80 }}
      >
        <Typography variant="h6">?</Typography>
      </Fab>
    </Container>
  );
};

export default OvningPage;
