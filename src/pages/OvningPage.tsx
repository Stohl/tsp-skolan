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
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Cancel,
  Refresh,
  Timer,
  School,
  Quiz,
  Gesture,
  Spellcheck,
  ChatBubbleOutline
} from '@mui/icons-material';
import { useDatabase } from '../contexts/DatabaseContext';
import { useWordProgress } from '../hooks/usePersistentState';
import { getVideoUrl } from '../types/database';
import { getWordListDifficulty } from '../types/wordLists';

// Enum för övningstyper
enum ExerciseType {
  FLASHCARDS = 'flashcards',
  QUIZ = 'quiz',
  SIGN = 'sign',
  SPELLING = 'spelling',
  SENTENCES = 'sentences',
  SENTENCES_DUPLICATE = 'sentences_duplicate'
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
  // Bestäm vilken typ av ord detta är baserat på progress level
  const isLearnedWord = word.progress?.level === 2;
  const isLearningWord = word.progress?.level === 1;
  const [showVideo, setShowVideo] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Återställ state när ordet ändras
  useEffect(() => {
    console.log(`[DEBUG] Flashcards: Word changed to: ${word.ord} (ID: ${word.id})`);
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
            // Visa videon automatiskt när countdown är slut
            setShowVideo(true);
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
    console.log(`[DEBUG] Flashcards: User answered ${isCorrect ? 'correct' : 'incorrect'} for word: ${word.ord} (ID: ${word.id})`);
    onResult(isCorrect);
  };

  console.log(`[DEBUG] Flashcards: Rendering word: ${word.ord} (ID: ${word.id}), showVideo: ${showVideo}, countdown: ${countdown}`);

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        {!showVideo ? (
          // Visa ordet
          <Box>
            <Typography variant="h4" gutterBottom>
              {word.ord}
            </Typography>
            {word.beskrivning && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {word.beskrivning}
            </Typography>
            )}
            
            {countdown !== null && countdown > 0 && (
              <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                {countdown}...
              </Typography>
            )}
            
            {countdown === null && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Tecknet visas om 3 sekunder...
              </Typography>
            )}
            
          </Box>
        ) : (
          // Visa videon och resultat-knappar
          <Box>
            {/* Visa ordet ovanför videon */}
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              {word.ord}
            </Typography>
            
            {word.video_url && (
              <Box sx={{ mb: 3 }}>
                <video
                  ref={videoRef}
                  key={word.id} // Tvingar React att skapa ny video när ordet ändras
                  autoPlay
                  muted
                  playsInline // Förhindrar helskärm på mobil
                  loop // Spelar videon i loop
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.play().catch(error => {
                        // Ignorera AbortError - detta händer när komponenten unmountas
                        if (error.name !== 'AbortError') {
                          console.warn('Video play error:', error);
                        }
                      });
                    }
                  }}
                  style={{ 
                    width: '100%', 
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer' // Visa att videon är klickbar
                  }}
                >
                  <source src={getVideoUrl(word.video_url)} type="video/mp4" />
                  Din webbläsare stöder inte video-elementet.
                </video>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={() => handleResult(true)}
                startIcon={<CheckCircle />}
                sx={{ textTransform: 'none' }}
              >
                Ja, jag kunde
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                onClick={() => handleResult(false)}
                startIcon={<Cancel />}
                sx={{ textTransform: 'none' }}
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
  // Bestäm vilken typ av ord detta är baserat på progress level
  const isLearnedWord = word.progress?.level === 2;
  const isLearningWord = word.progress?.level === 1;
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [clickedAnswer, setClickedAnswer] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generera felaktiga alternativ
  const getWrongAnswers = () => {
    const wrongWords = shuffleArray(allWords
      .filter(w => w.id !== word.id))
      .slice(0, 3);
    return wrongWords.map(w => ({ id: w.id, text: w.ord }));
  };

  // Använd useMemo för att generera svarsalternativ när ordet ändras
  const answers = useMemo(() => {
    const wrongAnswers = getWrongAnswers();
    const correctAnswer = { id: word.id, text: word.ord };
    const allAnswers = [...wrongAnswers, correctAnswer];
    return shuffleArray(allAnswers); // Blanda svaren
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
    setClickedAnswer(null);
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
    
    console.log(`[DEBUG] Answer selected: ${answerId}, word.id: ${word.id}`);
    
    // Sätt omedelbart för visuell feedback
    setClickedAnswer(answerId);
    setSelectedAnswer(answerId);
    setShowResult(true);
    
    const isCorrect = answerId === word.id;
    console.log(`[DEBUG] Answer is correct: ${isCorrect}`);
    
    const timeout = setTimeout(() => onResult(isCorrect), 2000);
    timeoutRef.current = timeout;
  };

  const isCorrectAnswer = (answerId: string) => answerId === word.id;

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        {/* Indikator för ordtyp */}
        <Box sx={{ mb: 2 }}>
          {isLearnedWord && (
            <Chip 
              label="✅ Lärd" 
              color="success" 
              size="small"
              sx={{ mr: 1 }}
            />
          )}
          {isLearningWord && (
            <Chip 
              label="🆕 Att lära mig" 
              color="primary" 
              size="small"
              sx={{ mr: 1 }}
            />
          )}
          {word.listDifficulty && (
            <Chip 
              label={`${word.listDifficulty.charAt(0).toUpperCase() + word.listDifficulty.slice(1)}`}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
        
        {/* Fråga */}
        <Box sx={{ mb: 4 }}>
          {word.video_url && (
            <Box sx={{ mb: 3 }}>
              <video
                ref={videoRef}
                key={word.id} // Tvingar React att skapa ny video när ordet ändras
                autoPlay
                muted
                playsInline // Förhindrar helskärm på mobil
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                  }
                }}
                style={{ 
                  width: '100%', 
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
              >
                <source src={getVideoUrl(word.video_url)} type="video/mp4" />
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
                    border: (selectedAnswer === answer.id || clickedAnswer === answer.id) ? '2px solid' : '1px solid',
                    borderColor: showResult 
                      ? (isCorrectAnswer(answer.id) ? 'success.main' : 'error.main')
                      : (clickedAnswer === answer.id ? 'primary.main' : 'divider'),
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: showResult 
                      ? (isCorrectAnswer(answer.id) ? 'success.light' : 'error.light')
                      : (clickedAnswer === answer.id ? 'primary.light' : 'transparent'),
                    // Tvinga omedelbar färguppdatering
                    transition: 'none !important',
                    '&:hover': {
                      backgroundColor: showResult 
                        ? (isCorrectAnswer(answer.id) ? 'success.light' : 'error.light')
                        : (clickedAnswer === answer.id ? 'primary.light' : 'action.hover')
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        {answer.text}
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
  // Bestäm vilken typ av ord detta är baserat på progress level
  const isLearnedWord = word.progress?.level === 2;
  const isLearningWord = word.progress?.level === 1;
  
  const [countdown, setCountdown] = useState(5);
  const [showVideo, setShowVideo] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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
            {/* Indikator för ordtyp */}
            <Box sx={{ mb: 2 }}>
              {isLearnedWord && (
                <Chip 
                  label="✅ Lärd" 
                  color="success" 
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              {isLearningWord && (
                <Chip 
                  label="🆕 Att lära mig" 
                  color="primary" 
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              {word.listDifficulty && (
                <Chip 
                  label={`${word.listDifficulty.charAt(0).toUpperCase() + word.listDifficulty.slice(1)}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
            
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
            {/* Indikator för ordtyp */}
            <Box sx={{ mb: 2 }}>
              {isLearnedWord && (
                <Chip 
                  label="✅ Lärd" 
                  color="success" 
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              {isLearningWord && (
                <Chip 
                  label="🆕 Att lära mig" 
                  color="primary" 
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              {word.listDifficulty && (
                <Chip 
                  label={`${word.listDifficulty.charAt(0).toUpperCase() + word.listDifficulty.slice(1)}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
            
            {word.video_url && (
              <Box sx={{ mb: 3 }}>
                <video
                  ref={videoRef}
                  key={word.id} // Tvingar React att skapa ny video när ordet ändras
                  autoPlay
                  muted
                  playsInline // Förhindrar helskärm på mobil
                  loop // Spelar videon i loop
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.play().catch(error => {
                        // Ignorera AbortError - detta händer när komponenten unmountas
                        if (error.name !== 'AbortError') {
                          console.warn('Video play error:', error);
                        }
                      });
                    }
                  }}
                  style={{ 
                    width: '100%', 
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer' // Visa att videon är klickbar
                  }}
                >
                  <source src={getVideoUrl(word.video_url)} type="video/mp4" />
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

// Komponent för Bokstavering-övning
const SpellingExercise: React.FC<{
  word: any;
  allSpellingWords: any[];
  onResult: (isCorrect: boolean) => void;
  onSkip: () => void;
  playbackSpeed: number;
}> = ({ word, allSpellingWords, onResult, onSkip, playbackSpeed }) => {
  // Bestäm vilken typ av ord detta är baserat på progress level
  const isLearnedWord = word.progress?.level === 2;
  const isLearningWord = word.progress?.level === 1;
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [clickedAnswer, setClickedAnswer] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sätt uppspelningshastighet när videon laddas
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, word.id]);

  // Generera felaktiga alternativ med samma längd som det korrekta ordet
  const getWrongAnswers = () => {
    const correctLength = word.ord.length;
    let wrongWords: any[] = [];
    
    // Försök först hitta ord med exakt samma längd
    const sameLengthWords = allSpellingWords.filter(w => w.id !== word.id && w.ord.length === correctLength);
    wrongWords = [...sameLengthWords];
    
    // Om vi inte har tillräckligt (3 ord), komplettera med ord med liknande längd (±1 bokstav)
    if (wrongWords.length < 3) {
      const similarLengthWords = allSpellingWords.filter(w => 
        w.id !== word.id && 
        w.ord.length >= correctLength - 1 && 
        w.ord.length <= correctLength + 1 &&
        !wrongWords.some(existing => existing.id === w.id)
      );
      wrongWords = [...wrongWords, ...similarLengthWords];
    }
    
    // Om vi fortfarande inte har tillräckligt, ta från alla ord (exklusive det korrekta)
    if (wrongWords.length < 3) {
      const allOtherWords = allSpellingWords.filter(w => 
        w.id !== word.id && 
        !wrongWords.some(existing => existing.id === w.id)
      );
      wrongWords = [...wrongWords, ...allOtherWords];
    }
    
    // Blanda och ta max 3 ord
    const shuffledWords = shuffleArray(wrongWords).slice(0, 3);
    console.log(`[DEBUG] Spelling alternatives: correct="${word.ord}" (${correctLength} chars), wrong alternatives:`, shuffledWords.map(w => `${w.ord} (${w.ord.length} chars)`));
    
    return shuffledWords.map(w => ({ id: w.id, text: w.ord }));
  };

  // Använd useMemo för att generera svarsalternativ när ordet ändras
  const answers = useMemo(() => {
    const wrongAnswers = getWrongAnswers();
    const correctAnswer = { id: word.id, text: word.ord };
    const allAnswers = [...wrongAnswers, correctAnswer];
    const shuffledAnswers = shuffleArray(allAnswers); // Blanda svaren
    
    console.log(`[DEBUG] Spelling exercise answers for "${word.ord}":`, shuffledAnswers.map(a => a.text));
    console.log(`[DEBUG] Total answers: ${shuffledAnswers.length}`);
    
    return shuffledAnswers;
  }, [word.id, allSpellingWords]);

  // Återställ state när ordet ändras
  useEffect(() => {
    // Rensa eventuell pågående timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setSelectedAnswer(null);
    setShowResult(false);
    setClickedAnswer(null);
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
    
    console.log(`[DEBUG] Spelling answer selected: ${answerId}, word.id: ${word.id}`);
    
    // Sätt omedelbart för visuell feedback
    setClickedAnswer(answerId);
    setSelectedAnswer(answerId);
    setShowResult(true);
    
    const isCorrect = answerId === word.id;
    console.log(`[DEBUG] Spelling answer is correct: ${isCorrect}`);
    
    const timeout = setTimeout(() => onResult(isCorrect), 2000);
    timeoutRef.current = timeout;
  };

  const isCorrectAnswer = (answerId: string) => answerId === word.id;

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        {/* Indikator för ordtyp */}
        <Box sx={{ mb: 2 }}>
          {isLearnedWord && (
            <Chip 
              label="✅ Lärd" 
              color="success" 
              size="small"
              sx={{ mr: 1 }}
            />
          )}
          {isLearningWord && (
            <Chip 
              label="🆕 Att lära mig" 
              color="primary" 
              size="small"
              sx={{ mr: 1 }}
            />
          )}
          {word.listDifficulty && (
            <Chip 
              label={`${word.listDifficulty.charAt(0).toUpperCase() + word.listDifficulty.slice(1)}`}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
        
        {/* Fråga */}
        <Box sx={{ mb: 4 }}>
          {word.video_url && (
            <Box sx={{ mb: 3 }}>
              <video
                ref={videoRef}
                key={word.id} // Tvingar React att skapa ny video när ordet ändras
                autoPlay
                muted
                playsInline // Förhindrar helskärm på mobil
                onClick={() => {
                  console.log(`[DEBUG] Video clicked for word: ${word.id}`);
                  if (videoRef.current) {
                    console.log(`[DEBUG] Resetting video to start and playing`);
                    videoRef.current.currentTime = 0;
                    videoRef.current.playbackRate = playbackSpeed;
                    videoRef.current.play().catch(error => {
                      // Ignorera AbortError - detta händer när komponenten unmountas
                      if (error.name !== 'AbortError') {
                        console.warn('Video play error:', error);
                      }
                    });
                  } else {
                    console.log(`[DEBUG] Video ref not found!`);
                  }
                }}
                style={{ 
                  width: '100%', 
                  maxWidth: '400px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer' // Visa att videon är klickbar
                }}
              >
                <source src={getVideoUrl(word.video_url)} type="video/mp4" />
                Din webbläsare stöder inte video-elementet.
              </video>
            </Box>
          )}
          
          <Typography variant="h5" gutterBottom>
            Vilket ord?
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
                    border: (selectedAnswer === answer.id || clickedAnswer === answer.id) ? '2px solid' : '1px solid',
                    borderColor: showResult 
                      ? (isCorrectAnswer(answer.id) ? 'success.main' : 'error.main')
                      : (clickedAnswer === answer.id ? 'primary.main' : 'divider'),
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: showResult 
                      ? (isCorrectAnswer(answer.id) ? 'success.light' : 'error.light')
                      : (clickedAnswer === answer.id ? 'primary.light' : 'transparent'),
                    // Tvinga omedelbar färguppdatering
                    transition: 'none !important',
                    '&:hover': {
                      backgroundColor: showResult 
                        ? (isCorrectAnswer(answer.id) ? 'success.light' : 'error.light')
                        : (clickedAnswer === answer.id ? 'primary.light' : 'action.hover')
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        {answer.text}
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

// Komponent för Meningar-övning (test-sida)
const SentencesExercise: React.FC<{
  learnedWords: any[];
  phraseDatabase: any;
  wordDatabase: any;
  onResult: (isCorrect: boolean) => void;
  onSkip: () => void;
}> = ({ learnedWords, phraseDatabase, wordDatabase, onResult, onSkip }) => {
  // Filtrera fraser baserat på lärda ord och kategorisera som primära/sekundära
  const getPhrasesForLearnedWords = () => {
    const learnedWordIds = learnedWords.map(word => word.id);
    const learnedWordsMap = new Map(learnedWords.map(word => [word.id, word]));
    const phrases = Object.entries(phraseDatabase); // Använd Object.entries för att få både key och value
    
    // Samla alla fras-ID:n som är länkade till lärda ord via exempel-fältet
    const examplePhraseIds = new Set<string>();
    learnedWords.forEach(word => {
      if (word.exempel) {
        // Lägg till primära exempel
        if (word.exempel.primära) {
          word.exempel.primära.forEach((ex: any) => {
            if (ex.id) examplePhraseIds.add(ex.id);
          });
        }
        // Lägg till sekundära exempel
        if (word.exempel.sekundära) {
          word.exempel.sekundära.forEach((ex: any) => {
            if (ex.id) examplePhraseIds.add(ex.id);
          });
        }
      }
    });
    
    // Filtrera fraser BARA baserat på ID-nummer från exempel-fältet
    const relevantPhrases = phrases.filter(([phraseId, phrase]: [string, any]) => {
      // Bara matchning via exempel-fältet (ID-nummer)
      return examplePhraseIds.has(phraseId);
    });
    
    const primaryPhrases: any[] = [];
    const secondaryPhrases: any[] = [];
    const sharedPhrases: any[] = []; // Nya kategori för gemensamma fraser
    
    relevantPhrases.forEach(([phraseId, phrase]: [string, any]) => {
      // Hitta vilka ord som är relaterade till denna fras via exempel-fältet
      const relatedWords: any[] = [];
      
      // Hitta ord som är länkade via exempel-fältet
      learnedWords.forEach(word => {
        if (word.exempel) {
          let isLinkedViaExample = false;
          
          // Kontrollera primära exempel
          if (word.exempel.primära) {
            isLinkedViaExample = word.exempel.primära.some((ex: any) => ex.id === phraseId);
          }
          
          // Kontrollera sekundära exempel
          if (!isLinkedViaExample && word.exempel.sekundära) {
            isLinkedViaExample = word.exempel.sekundära.some((ex: any) => ex.id === phraseId);
          }
          
          if (isLinkedViaExample && !relatedWords.some(rw => rw.id === word.id)) {
            relatedWords.push(word);
          }
        }
      });
      
      if (relatedWords.length > 0) {
        const phraseWithWord = {
          ...phrase,
          id: phraseId, // Använd huvudnyckeln som ID
          word: relatedWords[0].ord, // Primärt ord (det som frasen direkt länkar till)
          wordId: phrase.ord_id,
          relatedWords: relatedWords, // Alla relaterade ord
          type: 'primär' // Default
        };
        
        // Bestäm meningsnivå från det faktiska fältet i databasen
        phraseWithWord.meningsnivå = phrase.meningsnivå || null;
        
        // Bestäm om frasen är primär eller sekundär baserat på URL-mönster
        // URL-format: "fras/055741" där sista siffran indikerar typ
        // 1 = primär, 2+ = sekundär
        const urlMatch = phrase.url?.match(/(\d+)$/);
        
        if (urlMatch) {
          const frasNumber = parseInt(urlMatch[1]);
          const lastDigit = frasNumber % 10;
          
          // Kategorisera frasen baserat på URL-mönster
          if (lastDigit === 1) {
            phraseWithWord.type = 'primär';
            primaryPhrases.push(phraseWithWord);
          } else {
            phraseWithWord.type = 'sekundär';
            secondaryPhrases.push(phraseWithWord);
          }
        } else {
          // Om URL saknas eller är ogiltig, default till primär
          phraseWithWord.type = 'primär';
          primaryPhrases.push(phraseWithWord);
        }
      }
    });
    
    return { primaryPhrases, secondaryPhrases, sharedPhrases };
  };

  const { primaryPhrases, secondaryPhrases, sharedPhrases } = getPhrasesForLearnedWords();

  // Funktion för att rendera en tabell
  const renderPhraseTable = (phrases: any[], title: string, color: 'primary' | 'secondary' | 'success') => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom color={color} sx={{ mb: 2 }}>
        {title} ({phrases.length} fraser)
      </Typography>
      
      {phrases.length > 0 ? (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>Fras ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Typ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Meningsnivå</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Ord</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Fras-mening</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {phrases.map((phrase, index) => (
                <TableRow key={phrase.id} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {phrase.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={phrase.type} 
                      color={phrase.type === 'primär' ? 'primary' : phrase.type === 'sekundär' ? 'secondary' : 'success'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {phrase.meningsnivå ? (
                      <Chip 
                        label={phrase.meningsnivå} 
                        color={phrase.meningsnivå === 'N1' ? 'success' : phrase.meningsnivå === 'N2' ? 'warning' : 'error'}
                        size="small"
                        variant="filled"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Tooltip title={`Ord ID: ${phrase.wordId}`} arrow>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {phrase.word}
                        </Typography>
                      </Tooltip>
                      {phrase.relatedWords && phrase.relatedWords.length > 1 && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Innehåller också: {phrase.relatedWords.slice(1).map((w: any) => w.ord).join(', ')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {phrase.fras}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 3 }}>
          Inga {title.toLowerCase()} hittades.
        </Typography>
      )}
    </Box>
  );

  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Meningar - Test-sida
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Här visas alla fraser som är länkade till dina lärda ord från fras_database.json
        </Typography>

        {/* Gemensamma fraser är borttagna för att undvika för många resultat */}

        {/* Primära fraser tabell */}
        {renderPhraseTable(primaryPhrases, 'Primära fraser', 'primary')}

        {/* Sekundära fraser tabell */}
        {renderPhraseTable(secondaryPhrases, 'Sekundära fraser', 'secondary')}

        {/* Sammanfattning */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Sammanfattning:</strong> Totalt {primaryPhrases.length + secondaryPhrases.length} fraser 
            från {learnedWords.length} lärda ord
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Primära:</strong> {primaryPhrases.length} fraser | <strong>Sekundära:</strong> {secondaryPhrases.length} fraser
          </Typography>
        </Box>

        {/* Test-knappar */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => onResult(true)}
            startIcon={<CheckCircle />}
          >
            Test: Rätt
          </Button>
          <Button
            variant="outlined"
            onClick={() => onResult(false)}
            startIcon={<Cancel />}
          >
            Test: Fel
          </Button>
          <Button
            variant="outlined"
            onClick={onSkip}
          >
            Hoppa över
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Hjälpfunktion för bättre slumpning (Fisher-Yates algoritm)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Hjälpfunktion för slumpning med seed (för mer variation)
const shuffleArrayWithSeed = <T,>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  let currentSeed = seed;
  
  // Enkel pseudo-random generator baserad på seed
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Duplicerad komponent för Meningar-övning (test-sida)
const SentencesExerciseDuplicate: React.FC<{
  learnedWords: any[];
  phraseDatabase: any;
  wordDatabase: any;
  onResult: (isCorrect: boolean) => void;
  onSkip: () => void;
}> = ({ learnedWords, phraseDatabase, wordDatabase, onResult, onSkip }) => {
  // Filtrera fraser baserat på lärda ord och kategorisera som primära/sekundära
  const getPhrasesForLearnedWords = () => {
    const learnedWordIds = learnedWords.map(word => word.id);
    const learnedWordsMap = new Map(learnedWords.map(word => [word.id, word]));
    const phrases = Object.entries(phraseDatabase); // Använd Object.entries för att få både key och value
    
    // Samla alla fras-ID:n som är länkade till lärda ord via exempel-fältet
    const examplePhraseIds = new Set<string>();
    learnedWords.forEach(word => {
      if (word.exempel) {
        // Lägg till primära exempel
        if (word.exempel.primära) {
          word.exempel.primära.forEach((ex: any) => {
            if (ex.id) examplePhraseIds.add(ex.id);
          });
        }
        // Lägg till sekundära exempel
        if (word.exempel.sekundära) {
          word.exempel.sekundära.forEach((ex: any) => {
            if (ex.id) examplePhraseIds.add(ex.id);
          });
        }
      }
    });
    
    // Filtrera fraser BARA baserat på ID-nummer från exempel-fältet
    const relevantPhrases = phrases.filter(([phraseId, phrase]: [string, any]) => {
      // Bara matchning via exempel-fältet (ID-nummer)
      return examplePhraseIds.has(phraseId);
    });
    
    const primaryPhrases: any[] = [];
    const secondaryPhrases: any[] = [];
    const sharedPhrases: any[] = []; // Nya kategori för gemensamma fraser
    
    relevantPhrases.forEach(([phraseId, phrase]: [string, any]) => {
      // Hitta vilka ord som är relaterade till denna fras via exempel-fältet
      const relatedWords: any[] = [];
      
      // Hitta ord som är länkade via exempel-fältet
      learnedWords.forEach(word => {
        if (word.exempel) {
          let isLinkedViaExample = false;
          
          // Kontrollera primära exempel
          if (word.exempel.primära) {
            isLinkedViaExample = word.exempel.primära.some((ex: any) => ex.id === phraseId);
          }
          
          // Kontrollera sekundära exempel
          if (!isLinkedViaExample && word.exempel.sekundära) {
            isLinkedViaExample = word.exempel.sekundära.some((ex: any) => ex.id === phraseId);
          }
          
          if (isLinkedViaExample && !relatedWords.some(rw => rw.id === word.id)) {
            relatedWords.push(word);
          }
        }
      });
      
      if (relatedWords.length > 0) {
        const phraseWithWord = {
          ...phrase,
          id: phraseId, // Använd huvudnyckeln som ID
          word: relatedWords[0].ord, // Primärt ord (det som frasen direkt länkar till)
          wordId: phrase.ord_id,
          relatedWords: relatedWords, // Alla relaterade ord
          type: 'primär' // Default
        };
        
        // Bestäm meningsnivå från det faktiska fältet i databasen
        phraseWithWord.meningsnivå = phrase.meningsnivå || null;
        
        // Bestäm om frasen är primär eller sekundär baserat på URL-mönster
        // URL-format: "fras/055741" där sista siffran indikerar typ
        // 1 = primär, 2+ = sekundär
        const urlMatch = phrase.url?.match(/(\d+)$/);
        
        if (urlMatch) {
          const frasNumber = parseInt(urlMatch[1]);
          const lastDigit = frasNumber % 10;
          
          // Kategorisera frasen baserat på URL-mönster
          if (lastDigit === 1) {
            phraseWithWord.type = 'primär';
            primaryPhrases.push(phraseWithWord);
          } else {
            phraseWithWord.type = 'sekundär';
            secondaryPhrases.push(phraseWithWord);
          }
        } else {
          // Om URL saknas eller är ogiltig, default till primär
          phraseWithWord.type = 'primär';
          primaryPhrases.push(phraseWithWord);
        }
      }
    });
    
    return { primaryPhrases, secondaryPhrases, sharedPhrases };
  };

  const { primaryPhrases, secondaryPhrases, sharedPhrases } = getPhrasesForLearnedWords();

  // Funktion för att rendera en tabell
  const renderPhraseTable = (phrases: any[], title: string, color: 'primary' | 'secondary' | 'success') => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom color={color} sx={{ mb: 2 }}>
        {title} ({phrases.length} fraser)
      </Typography>
      
      {phrases.length > 0 ? (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>Fras ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Typ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Meningsnivå</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Ord</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Fras-mening</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {phrases.map((phrase, index) => (
                <TableRow key={phrase.id} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {phrase.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={phrase.type} 
                      color={phrase.type === 'primär' ? 'primary' : phrase.type === 'sekundär' ? 'secondary' : 'success'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {phrase.meningsnivå ? (
                      <Chip 
                        label={phrase.meningsnivå} 
                        color={phrase.meningsnivå === 'N1' ? 'success' : phrase.meningsnivå === 'N2' ? 'warning' : 'error'}
                        size="small"
                        variant="filled"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Tooltip title={`Ord ID: ${phrase.wordId}`} arrow>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {phrase.word}
                        </Typography>
                      </Tooltip>
                      {phrase.relatedWords && phrase.relatedWords.length > 1 && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Innehåller också: {phrase.relatedWords.slice(1).map((w: any) => w.ord).join(', ')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {phrase.fras}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 3 }}>
          Inga {title.toLowerCase()} hittades.
        </Typography>
      )}
    </Box>
  );

  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="secondary">
          Meningar - Test-sida (Duplicerad)
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Här visas alla fraser som är länkade till dina lärda ord från fras_database.json (Duplicerad version)
        </Typography>

        {/* Gemensamma fraser är borttagna för att undvika för många resultat */}

        {/* Primära fraser tabell */}
        {renderPhraseTable(primaryPhrases, 'Primära fraser', 'primary')}

        {/* Sekundära fraser tabell */}
        {renderPhraseTable(secondaryPhrases, 'Sekundära fraser', 'secondary')}

        {/* Sammanfattning */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Sammanfattning:</strong> Totalt {primaryPhrases.length + secondaryPhrases.length} fraser 
            från {learnedWords.length} lärda ord
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Primära:</strong> {primaryPhrases.length} fraser | <strong>Sekundära:</strong> {secondaryPhrases.length} fraser
          </Typography>
        </Box>

        {/* Test-knappar */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => onResult(true)}
            startIcon={<CheckCircle />}
          >
            Test: Rätt
          </Button>
          <Button
            variant="outlined"
            onClick={() => onResult(false)}
            startIcon={<Cancel />}
          >
            Test: Fel
          </Button>
          <Button
            variant="outlined"
            onClick={onSkip}
          >
            Hoppa över
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Huvudkomponent för övningssidan
const OvningPage: React.FC = () => {
  const { wordDatabase, phraseDatabase, isLoading, error } = useDatabase();
  const { getWordsForPractice, markWordResult, setWordLevel, wordProgress } = useWordProgress();
  
  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  const [learningWordsOnly, setLearningWordsOnly] = useState(false);
  
  // State för bokstavering-övning
  const [spellingWordLength, setSpellingWordLength] = useState<number>(3);
  const [spellingWords, setSpellingWords] = useState<any[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('spelling-playback-speed');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [selectedInterval, setSelectedInterval] = useState<number>(() => {
    const saved = localStorage.getItem('spelling-interval');
    return saved ? parseInt(saved) : 0; // 0 = 2-3 bokstäver
  });

  // State för att spåra avklarade bokstavering-rutor
  const [completedSpellingBoxes, setCompletedSpellingBoxes] = useState<string[]>(() => {
    const saved = localStorage.getItem('spelling-progress');
    return saved ? JSON.parse(saved) : [];
  });

  // Definiera förbestämda intervall (moved to before spelling section)

  // Funktioner för att spara inställningar
  const savePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    localStorage.setItem('spelling-playback-speed', speed.toString());
  };

  const saveSelectedInterval = (interval: number) => {
    setSelectedInterval(interval);
    localStorage.setItem('spelling-interval', interval.toString());
  };

  // Funktion för att spara avklarad bokstavering-ruta
  const markSpellingBoxCompleted = (speed: number, minLength: number, maxLength: number) => {
    const boxId = `${speed}x-${minLength}-${maxLength}`;
    if (!completedSpellingBoxes.includes(boxId)) {
      const newCompleted = [...completedSpellingBoxes, boxId];
      setCompletedSpellingBoxes(newCompleted);
      localStorage.setItem('spelling-progress', JSON.stringify(newCompleted));
      console.log(`[DEBUG] Marked spelling box as completed: ${boxId}`);
    }
  };

  // Funktion för att kontrollera om en ruta är avklarad
  const isSpellingBoxCompleted = (speed: number, minLength: number, maxLength: number) => {
    const boxId = `${speed}x-${minLength}-${maxLength}`;
    return completedSpellingBoxes.includes(boxId);
  };

  // Funktion för att ta bort avklarad bokstavering-ruta
  const removeSpellingBoxCompleted = (speed: number, minLength: number, maxLength: number) => {
    const boxId = `${speed}x-${minLength}-${maxLength}`;
    if (completedSpellingBoxes.includes(boxId)) {
      const newCompleted = completedSpellingBoxes.filter(id => id !== boxId);
      setCompletedSpellingBoxes(newCompleted);
      localStorage.setItem('spelling-progress', JSON.stringify(newCompleted));
      console.log(`[DEBUG] Removed spelling box from completed: ${boxId}`);
    }
  };

  // Hjälpfunktion för att få styling för en bokstavering-ruta
  const getSpellingBoxStyle = (speed: number, minLength: number, maxLength: number) => {
    const isCompleted = isSpellingBoxCompleted(speed, minLength, maxLength);
    return {
      cursor: 'pointer' as const,
      border: '1px solid',
      borderColor: isCompleted ? 'success.main' : 'primary.main',
      borderRadius: 2,
      backgroundColor: isCompleted ? '#e8f5e8' : 'primary.50', // Explicit grön färg istället för success.50
      color: isCompleted ? 'success.main' : 'primary.main',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: { xs: 50, sm: 60 },
      p: { xs: 0.5, sm: 1 },
      '&:hover': {
        transform: 'translateY(-2px)',
        transition: 'transform 0.2s',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: isCompleted ? '#d4edda' : 'primary.100' // Explicit grön hover-färg
      }
    };
  };

  // Återställ övningssidan när komponenten mountas (när användaren navigerar tillbaka)
  useEffect(() => {
    setSelectedExerciseType(null);
    setCurrentWordIndex(0);
    setShowResults(false);
    setResults([]);
  }, []);

  // Återställ även när komponenten åter-mountas (när användaren klickar på samma sida igen)
  useEffect(() => {
    // Scrolla till toppen när komponenten mountas
    window.scrollTo(0, 0);
  }, []);
  const getAllSpellingWords = useMemo(() => {
    const spellingWords = Object.values(wordDatabase).filter((word: any) => 
      word.ämne && word.ämne.includes('Verktyg - Bokstavering - Bokstaverade ord')
    );
    console.log(`[DEBUG] Found ${spellingWords.length} spelling words in database`);
    return spellingWords;
  }, [wordDatabase]);

  // Hämta lärda ord för Meningar-övningen
  const learnedWords = useMemo(() => {
    const wordsWithProgress = Object.values(wordDatabase).map((word: any) => ({
      ...word,
      progress: wordProgress[word.id] || { level: 0, stats: { difficulty: 0, lastPracticed: new Date().toISOString() } }
    }));
    return wordsWithProgress.filter(word => word.progress.level === 2);
  }, [wordDatabase, wordProgress]);

  // State för att hålla statisk lista av ord under hela övningen
  const [staticPracticeWords, setStaticPracticeWords] = useState<any[]>([]);
  // State för att hålla koll på vilka ord som faktiskt flyttades till level 2
  const [wordsMovedToLearned, setWordsMovedToLearned] = useState<Set<string>>(new Set());

  // Beräkna ord för övning med ny logik: svårighetsgrad-prioritering + slumpning + lärda ord-repetition
  const practiceWords = useMemo(() => {
    if (Object.keys(wordDatabase).length === 0) return [];
    
    // Hämta inställning för antal lärda ord att repetera
    const reviewCount = parseInt(localStorage.getItem('reviewLearnedWords') || '2');
    const minLearningWordsNeeded = 10 - reviewCount;
    
    const wordsWithProgress = Object.entries(wordDatabase).map(([wordId, word]: [string, any]) => ({
      ...word,
      progress: wordProgress[wordId] || {
        level: 0,
        stats: { correct: 0, incorrect: 0, lastPracticed: new Date().toISOString(), difficulty: 50 }
      },
      listDifficulty: getWordListDifficulty(wordId) // Lägg till svårighetsgrad från wordLists.ts
    }));

    // Om learningWordsOnly är aktiverat, filtrera bara ord som användaren vill lära sig
    let filteredWords = wordsWithProgress;
    if (learningWordsOnly) {
      filteredWords = wordsWithProgress.filter(word => word.progress.level === 1);
    }

    // Hämta ord från "att lära mig" (nivå 1) sorterade efter svårighetsgrad från wordLists.ts
    const learningWords = filteredWords.filter(word => word.progress.level === 1);
    
    // Sortera efter svårighetsgrad från wordLists.ts: nyborjare -> lite_erfaren -> erfaren -> proffs
    const difficultyOrder = ['nyborjare', 'lite_erfaren', 'erfaren', 'proffs'];
    const sortedLearningWords = learningWords.sort((a, b) => {
      const difficultyA = difficultyOrder.indexOf(a.listDifficulty);
      const difficultyB = difficultyOrder.indexOf(b.listDifficulty);
      
      if (difficultyA !== difficultyB) {
        return difficultyA - difficultyB; // Lägre index = lägre svårighetsgrad först
      }
      
      // Om samma svårighetsgrad, sortera efter senast övade (nyligen övade först)
      const lastPracticedA = new Date(a.progress.stats.lastPracticed).getTime();
      const lastPracticedB = new Date(b.progress.stats.lastPracticed).getTime();
      
      // Hantera NaN (tom sträng) genom att sätta dem till 0 (aldrig övade)
      const timeA = isNaN(lastPracticedA) ? 0 : lastPracticedA;
      const timeB = isNaN(lastPracticedB) ? 0 : lastPracticedB;
      
      return timeB - timeA; // Nyligen övade först (högre timestamp först)
    });

    // Hämta slumpade ord från "lärda" (nivå 2) för repetition
    const learnedWords = filteredWords.filter(word => word.progress.level === 2);
    // Använd timestamp som seed för mer variation mellan övningar
    const seed = Date.now();
    const shuffledLearnedWords = shuffleArrayWithSeed(learnedWords, seed);
    
    // Mjuk validering: Om för få "att lära mig" ord, komplettera med lärda ord
    let selectedLearningWords = sortedLearningWords.slice(0, minLearningWordsNeeded);
    let selectedLearnedWords = shuffledLearnedWords.slice(0, reviewCount);
    
    // Om vi har för få "att lära mig" ord, komplettera med lärda ord
    if (selectedLearningWords.length < minLearningWordsNeeded) {
      const neededFromLearned = minLearningWordsNeeded - selectedLearningWords.length;
      const additionalLearnedWords = shuffledLearnedWords.slice(reviewCount, reviewCount + neededFromLearned);
      selectedLearningWords = [...selectedLearningWords, ...additionalLearnedWords];
      
      // Uppdatera antalet lärda ord för repetition - exkludera de som redan är i selectedLearningWords
      const learningWordIds = new Set(selectedLearningWords.map(w => w.id));
      const availableLearnedWords = shuffledLearnedWords.filter(w => !learningWordIds.has(w.id));
      selectedLearnedWords = availableLearnedWords.slice(0, Math.max(0, reviewCount - neededFromLearned));
    }
    
    // Om vi fortfarande har för få ord totalt, ta från den andra listan
    const totalWords = selectedLearningWords.length + selectedLearnedWords.length;
    if (totalWords < 10) {
      const stillNeeded = 10 - totalWords;
      
      if (selectedLearningWords.length < minLearningWordsNeeded) {
        // Ta fler från lärda ord - exkludera de som redan är valda
        const allSelectedIds = new Set([...selectedLearningWords, ...selectedLearnedWords].map(w => w.id));
        const availableLearnedWords = shuffledLearnedWords.filter(w => !allSelectedIds.has(w.id));
        const moreLearnedWords = availableLearnedWords.slice(0, stillNeeded);
        selectedLearningWords = [...selectedLearningWords, ...moreLearnedWords];
      } else {
        // Ta fler från att lära mig ord - exkludera de som redan är valda
        const allSelectedIds = new Set([...selectedLearningWords, ...selectedLearnedWords].map(w => w.id));
        const availableLearningWords = sortedLearningWords.filter(w => !allSelectedIds.has(w.id));
        const moreLearningWords = availableLearningWords.slice(0, stillNeeded);
        selectedLearningWords = [...selectedLearningWords, ...moreLearningWords];
      }
    }
    
    // Kombinera och slumpa ordningen för flashcards
    const combinedWords = [...selectedLearningWords, ...selectedLearnedWords];
    
    // Debug: Logga antal ord i varje kategori
    console.log(`[DEBUG] Selected learning words: ${selectedLearningWords.length}`);
    console.log(`[DEBUG] Selected learned words: ${selectedLearnedWords.length}`);
    console.log(`[DEBUG] Combined words before deduplication: ${combinedWords.length}`);
    
    // Ta bort duplicerade ord baserat på ID
    const uniqueWords = combinedWords.filter((word, index, self) => 
      index === self.findIndex(w => w.id === word.id)
    );
    
    console.log(`[DEBUG] Unique words after deduplication: ${uniqueWords.length}`);
    console.log(`[DEBUG] Words for exercise:`, uniqueWords.map(w => `${w.ord} (ID: ${w.id})`));
    
    const shuffledCombinedWords = shuffleArrayWithSeed(uniqueWords, seed);
    
    // Om inga ord hittas för övning, använd alla ord
    if (shuffledCombinedWords.length === 0) {
      return Object.values(wordDatabase).slice(0, 10);
    }
    
    return shuffledCombinedWords;
  }, [wordDatabase, wordProgress, learningWordsOnly]); // Lägg till learningWordsOnly som dependency

  // Uppdatera staticPracticeWords när practiceWords ändras och vi inte är mitt i en övning
  useEffect(() => {
    if (practiceWords.length > 0 && !showResults && staticPracticeWords.length === 0) {
      console.log(`[DEBUG] Setting static practice words:`, practiceWords.map(w => `${w.ord} (ID: ${w.id})`));
      setStaticPracticeWords(practiceWords);
      setWordsMovedToLearned(new Set()); // Återställ när ny övning börjar
    }
  }, [practiceWords, showResults, staticPracticeWords.length]);

  // Beräkna ord för quiz med minst 10 ord (inklusive fallback till lärda ord)
  const quizWords = useMemo(() => {
    if (Object.keys(wordDatabase).length === 0) return [];
    
    const wordsWithProgress = Object.entries(wordDatabase).map(([wordId, word]: [string, any]) => ({
      ...word,
      progress: wordProgress[wordId] || {
        level: 0,
        points: 0,
        stats: { correct: 0, incorrect: 0, lastPracticed: new Date().toISOString(), difficulty: 50 }
      }
    }));

    // Hämta ord som användaren vill lära sig (nivå 1)
    const learningWords = wordsWithProgress.filter(word => word.progress.level === 1);
    
    // Hämta ord som användaren har lärt sig (nivå 2)
    const learnedWords = wordsWithProgress.filter(word => word.progress.level === 2);
    
    // Om vi har minst 10 ord från "att lära mig", använd bara dem
    if (learningWords.length >= 10) {
      return learningWords
      .sort((a, b) => {
          const difficultyDiff = b.progress.stats.difficulty - a.progress.stats.difficulty;
          if (difficultyDiff !== 0) return difficultyDiff;
          const lastPracticedA = new Date(a.progress.stats.lastPracticed).getTime();
          const lastPracticedB = new Date(b.progress.stats.lastPracticed).getTime();
          return lastPracticedA - lastPracticedB;
        })
        .slice(0, 10);
    }
    
    // Om vi inte har tillräckligt många "att lära mig", lägg till "lärda" ord
    const combinedWords = [...learningWords, ...learnedWords];
    
    if (combinedWords.length >= 10) {
      return combinedWords
        .sort((a, b) => {
          // Prioritera "att lära mig" över "lärda"
        const levelA = a.progress.level;
        const levelB = b.progress.level;
        if (levelA === 1 && levelB !== 1) return -1;
        if (levelA !== 1 && levelB === 1) return 1;
        
          // Sedan efter svårighetsgrad
        const difficultyDiff = b.progress.stats.difficulty - a.progress.stats.difficulty;
        if (difficultyDiff !== 0) return difficultyDiff;
        
          // Sedan efter senast övade
        const lastPracticedA = new Date(a.progress.stats.lastPracticed).getTime();
        const lastPracticedB = new Date(b.progress.stats.lastPracticed).getTime();
        return lastPracticedA - lastPracticedB;
      })
      .slice(0, 10);
    }
    
    // Om vi fortfarande inte har tillräckligt många ord, använd alla ord
    return wordsWithProgress.slice(0, 10);
  }, [wordDatabase, wordProgress]);

  // Funktion för att ladda bara ord som användaren vill lära sig
  const loadLearningWordsOnly = () => {
    setLearningWordsOnly(true);
    setCurrentWordIndex(0);
    setResults([]);
    setShowResults(false);
  };

  // Funktion som körs när användaren väljer övningstyp
  const handleExerciseTypeSelect = (exerciseType: ExerciseType) => {
    // Validera bara för övningar som behöver lärda ord (inte bokstavering eller meningar)
    if (exerciseType !== ExerciseType.SPELLING && exerciseType !== ExerciseType.SENTENCES) {
      const validation = validateAvailableWords();
      if (validation.showWarning) {
        // Visa varning men tillåt ändå
        const proceed = window.confirm(`${validation.message}\n\n${validation.suggestion}\n\nVill du ändå fortsätta med övningen?`);
        if (!proceed) {
          return;
        }
      }
    }
    
    setSelectedExerciseType(exerciseType);
    setCurrentWordIndex(0);
    setResults([]);
    setShowResults(false);
    setStaticPracticeWords([]); // Återställ för ny övning
    setWordsMovedToLearned(new Set()); // Återställ för ny övning
    
    // Rensa spellingWords för att säkerställa att val-sidan visas
    if (exerciseType === ExerciseType.SPELLING) {
      setSpellingWords([]);
    }
  };

  // Funktion som körs när användaren slutför en övning
  const handleExerciseResult = (isCorrect: boolean) => {
    const currentWords = selectedExerciseType === ExerciseType.SPELLING ? spellingWords : 
                         selectedExerciseType === ExerciseType.QUIZ ? quizWords : staticPracticeWords;
    const currentWord = currentWords[currentWordIndex];
    if (!currentWord) return;

    console.log(`[DEBUG] handleExerciseResult: currentWordIndex=${currentWordIndex}, currentWords.length=${currentWords.length}, isCorrect=${isCorrect}`);
    console.log(`[DEBUG] Current word: ${currentWord.ord} (ID: ${currentWord.id})`);

    // Spara resultat
    const result: ExerciseResult = {
      wordId: currentWord.id,
      isCorrect,
      exerciseType: selectedExerciseType!,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => [...prev, result]);

    
    // Spara inte progress för bokstavering-övningar
    if (selectedExerciseType !== ExerciseType.SPELLING) {
      // Kontrollera om ordet kommer att flyttas till level 2
      const currentProgress = wordProgress[currentWord.id];
      const currentPoints = currentProgress?.points || 0;
      const currentLevel = currentProgress?.level || 0;
      const willMoveToLevel2 = isCorrect && currentPoints + 1 >= 5 && currentLevel < 2;
      
      markWordResult(currentWord.id, isCorrect);
      
      // Om ordet flyttades till level 2, spåra det
      if (willMoveToLevel2) {
        setWordsMovedToLearned(prev => new Set(prev).add(currentWord.id));
      }
    }

    // Gå till nästa ord eller visa resultat direkt (utan timeout)
    if (currentWordIndex < currentWords.length - 1) {
      const nextIndex = currentWordIndex + 1;
      const nextWord = currentWords[nextIndex];
      console.log(`[DEBUG] Moving to next question: ${nextIndex}`);
      console.log(`[DEBUG] Next word will be: ${nextWord?.ord} (ID: ${nextWord?.id})`);
      setCurrentWordIndex(prev => prev + 1);
    } else {
      console.log(`[DEBUG] Quiz completed! Showing results.`);
      
      // Kontrollera om det är bokstavering och om alla svar var rätt
      if (selectedExerciseType === ExerciseType.SPELLING) {
        const correctAnswers = results.filter(r => r.isCorrect).length;
        const totalAnswers = results.length;
        console.log(`[DEBUG] Spelling exercise completed: ${correctAnswers}/${totalAnswers} correct`);
        
        // Om alla svar var rätt (100%), markera rutan som avklarad
        if (correctAnswers === totalAnswers && totalAnswers > 0) {
          console.log(`[DEBUG] Perfect score! Marking spelling box as completed.`);
          // Hitta vilken ruta som användes baserat på aktuella inställningar
          const currentSpeed = playbackSpeed;
          const currentInterval = predefinedIntervals[selectedInterval];
          console.log(`[DEBUG] Current speed: ${currentSpeed}, interval: ${selectedInterval}, min: ${currentInterval?.min}, max: ${currentInterval?.max}`);
          if (currentInterval) {
            markSpellingBoxCompleted(currentSpeed, currentInterval.min, currentInterval.max);
          } else {
            console.log(`[DEBUG] No currentInterval found, cannot mark as completed`);
          }
        } else {
          console.log(`[DEBUG] Not perfect score: ${correctAnswers}/${totalAnswers}, not marking as completed`);
        }
      }
      
      setShowResults(true);
    }
  };

  // Funktion som körs när användaren hoppar över en övning
  const handleSkip = () => {
    const currentWords = selectedExerciseType === ExerciseType.SPELLING ? spellingWords : 
                         selectedExerciseType === ExerciseType.QUIZ ? quizWords : staticPracticeWords;
    console.log(`[DEBUG] handleSkip: currentWordIndex=${currentWordIndex}, currentWords.length=${currentWords.length}`);
    
    if (currentWordIndex < currentWords.length - 1) {
      console.log(`[DEBUG] Skipping to next question: ${currentWordIndex + 1}`);
      setCurrentWordIndex(prev => prev + 1);
    } else {
      console.log(`[DEBUG] Skip completed quiz! Showing results.`);
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

  // Funktion för att starta bokstavering-övning
  const startSpellingExercise = (minLen: number, maxLen: number) => {
    console.log(`[DEBUG] startSpellingExercise called with range: ${minLen}-${maxLen}`);
    
    // Rensa staticPracticeWords för att undvika att öppna gamla övningar
    setStaticPracticeWords([]);
    setWordsMovedToLearned(new Set());
    
    const wordsForRange = getAllSpellingWords.filter((word: any) => 
      word.ord.length >= minLen && word.ord.length <= maxLen
    );
    console.log(`[DEBUG] Found ${wordsForRange.length} words for range ${minLen}-${maxLen}`);
    
    if (wordsForRange.length >= 4) { // Behöver minst 4 ord för alternativ
      console.log(`[DEBUG] Starting spelling exercise with ${wordsForRange.length} words`);
      // Bättre slumpning med timestamp som seed för mer variation
      const shuffledWords = shuffleArrayWithSeed(wordsForRange, Date.now());
      const selectedWords = shuffledWords.slice(0, 10); // Ta max 10 slumpade ord
      console.log(`[DEBUG] Selected ${selectedWords.length} words for spelling exercise:`, selectedWords.map(w => w.ord));
      setSpellingWords(selectedWords);
      setSpellingWordLength(maxLen); // Spara max-längden för display
      // Starta övningen direkt istället för att anropa handleExerciseTypeSelect igen
      setCurrentWordIndex(0);
      setResults([]);
      setShowResults(false);
    } else {
      console.log(`[DEBUG] Not enough words (${wordsForRange.length}) for range ${minLen}-${maxLen}`);
    }
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

  // Visa aktuell övning - använd useMemo för att säkerställa korrekt uppdatering
  const currentWord = useMemo(() => {
    if ((selectedExerciseType as ExerciseType) === ExerciseType.SPELLING) {
      return spellingWords[currentWordIndex];
    } else if ((selectedExerciseType as ExerciseType) === ExerciseType.QUIZ) {
      return quizWords[currentWordIndex];
    } else {
      return staticPracticeWords[currentWordIndex];
    }
  }, [selectedExerciseType, currentWordIndex, spellingWords, quizWords, staticPracticeWords]);

  // Funktion för att validera tillgängliga ord och returnera felmeddelande
  const validateAvailableWords = () => {
    const reviewCount = parseInt(localStorage.getItem('reviewLearnedWords') || '2');
    const minLearningWordsNeeded = 10 - reviewCount;
    
    // Räkna ord direkt från wordProgress istället för från practiceWords
    const availableLearningWords = Object.entries(wordProgress).filter(([_, progress]) => progress.level === 1);
    const availableLearnedWords = Object.entries(wordProgress).filter(([_, progress]) => progress.level === 2);
    
    const totalAvailableWords = availableLearningWords.length + availableLearnedWords.length;
    
    // Om totalt för få ord (mindre än 10), visa varning men tillåt ändå
    if (totalAvailableWords < 10) {
      return {
        isValid: true, // Tillåt ändå
        showWarning: true,
        message: `Du har bara ${totalAvailableWords} ord tillgängliga (${availableLearningWords.length} att lära mig + ${availableLearnedWords.length} lärda).`,
        suggestion: 'Överväg att köra start-guiden för att lägga till fler ord, eller lägg till ord från lexikonet.'
      };
    }
    
    return { isValid: true, showWarning: false };
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '70vh',
          textAlign: 'center'
        }}>
          {/* App-namn */}
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
                  sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}
          >
            TSP Skolan
                    </Typography>
          
          {/* Undertitel */}
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 4, fontWeight: 300 }}
          >
            Teckenspråk för alla
          </Typography>
          
          {/* Laddningsikon */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                color: 'primary.main',
                animation: 'pulse 2s ease-in-out infinite'
              }} 
            />
          </Box>
          
          {/* Laddningstext */}
          <Typography 
            variant="body1" 
            color="text.secondary"
                    sx={{ 
              animation: 'fadeInOut 2s ease-in-out infinite',
              '@keyframes fadeInOut': {
                '0%, 100%': { opacity: 0.6 },
                '50%': { opacity: 1 }
              }
            }}
          >
            Laddar ord och övningar...
                      </Typography>
          
          {/* Progress-indikator */}
          <Box sx={{ mt: 3, width: '100%', maxWidth: 300 }}>
            <LinearProgress 
              sx={{ 
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)'
                }
              }} 
            />
          </Box>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          textAlign: 'center'
        }}>
          <Typography 
            variant="h4" 
            color="error" 
            gutterBottom
            sx={{ mb: 2 }}
          >
            Oops! Något gick fel
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {error}
          </Typography>
            <Button
              variant="contained"
            onClick={() => window.location.reload()}
            startIcon={<Refresh />}
          >
            Försök igen
            </Button>
          </Box>
      </Container>
    );
  }


  // Definiera ordlängd-intervaller för bokstavering
  const predefinedIntervals = [
    { min: 2, max: 3, label: '2-3', description: '2-3 bokstäver' },
    { min: 3, max: 4, label: '3-4', description: '3-4 bokstäver' },
    { min: 4, max: 5, label: '4-5', description: '4-5 bokstäver' },
    { min: 5, max: 6, label: '5-6', description: '5-6 bokstäver' },
    { min: 6, max: 50, label: '6+', description: '6+ bokstäver' }
  ];

  // Visa val för bokstavering-ordlängd
  if (selectedExerciseType === ExerciseType.SPELLING && spellingWords.length === 0) {

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        
        {/* Modern rutnät-layout */}
        {/* Infotext för bokstavering */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Bokstavering
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
            Välj hastighet och ordlängd för att träna bokstavering. Du kommer att se en video och välja rätt ord från fyra alternativ.
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}>
          {/* Klickbart rutnät (3×5) - Hårdkodade rutor */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(5, 1fr)',
            gap: { xs: 1, sm: 2 }, // Mindre gap på mobil, större på desktop
            p: { xs: 1, sm: 2 }, // Mindre padding på mobil
            border: '2px solid',
            borderColor: 'divider',
                borderRadius: 3,
            backgroundColor: 'grey.50',
            maxWidth: '600px',
            width: '100%',
            minHeight: { xs: '400px', sm: '500px' } // Mindre höjd på mobil
          }}>
            {/* Rad 1: 2-3 bokstäver */}
            <Box sx={getSpellingBoxStyle(0.5, 2, 3)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.5x hastighet, 2-3 bokstäver'); savePlaybackSpeed(0.5); saveSelectedInterval(0); startSpellingExercise(2, 3); }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>0.5x</Typography>
              <Typography variant="caption" sx={{ textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>2-3</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 2 && word.ord.length <= 3).length} ord</Typography>
          </Box>
            <Box sx={getSpellingBoxStyle(0.75, 2, 3)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.75x hastighet, 2-3 bokstäver'); savePlaybackSpeed(0.75); saveSelectedInterval(0); startSpellingExercise(2, 3); }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>0.75x</Typography>
              <Typography variant="caption" sx={{ textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>2-3</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 2 && word.ord.length <= 3).length} ord</Typography>
            </Box>
            <Box sx={getSpellingBoxStyle(1.0, 2, 3)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 1.0x hastighet, 2-3 bokstäver'); savePlaybackSpeed(1.0); saveSelectedInterval(0); startSpellingExercise(2, 3); }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>1.0x</Typography>
              <Typography variant="caption" sx={{ textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>2-3</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 2 && word.ord.length <= 3).length} ord</Typography>
            </Box>
            
            {/* Rad 2: 3-4 bokstäver */}
            <Box sx={getSpellingBoxStyle(0.5, 3, 4)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.5x hastighet, 3-4 bokstäver'); savePlaybackSpeed(0.5); saveSelectedInterval(1); startSpellingExercise(3, 4); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>0.5x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>3-4</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 3 && word.ord.length <= 4).length} ord</Typography>
            </Box>
            <Box sx={getSpellingBoxStyle(0.75, 3, 4)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.75x hastighet, 3-4 bokstäver'); savePlaybackSpeed(0.75); saveSelectedInterval(1); startSpellingExercise(3, 4); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>0.75x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>3-4</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 3 && word.ord.length <= 4).length} ord</Typography>
            </Box>
            <Box sx={getSpellingBoxStyle(1.0, 3, 4)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 1.0x hastighet, 3-4 bokstäver'); savePlaybackSpeed(1.0); saveSelectedInterval(1); startSpellingExercise(3, 4); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>1.0x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>3-4</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 3 && word.ord.length <= 4).length} ord</Typography>
            </Box>
            
            {/* Rad 3: 4-5 bokstäver */}
            <Box sx={getSpellingBoxStyle(0.5, 4, 5)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.5x hastighet, 4-5 bokstäver'); savePlaybackSpeed(0.5); saveSelectedInterval(2); startSpellingExercise(4, 5); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>0.5x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center' }}>4-5</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 4 && word.ord.length <= 5).length} ord</Typography>
            </Box>
            <Box sx={getSpellingBoxStyle(0.75, 4, 5)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.75x hastighet, 4-5 bokstäver'); savePlaybackSpeed(0.75); saveSelectedInterval(2); startSpellingExercise(4, 5); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>0.75x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center' }}>4-5</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 4 && word.ord.length <= 5).length} ord</Typography>
            </Box>
            <Box sx={getSpellingBoxStyle(1.0, 4, 5)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 1.0x hastighet, 4-5 bokstäver'); savePlaybackSpeed(1.0); saveSelectedInterval(2); startSpellingExercise(4, 5); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>1.0x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center' }}>4-5</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 4 && word.ord.length <= 5).length} ord</Typography>
            </Box>
            
            {/* Rad 4: 5-6 bokstäver */}
            <Box sx={getSpellingBoxStyle(0.5, 5, 6)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.5x hastighet, 5-6 bokstäver'); savePlaybackSpeed(0.5); saveSelectedInterval(3); startSpellingExercise(5, 6); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>0.5x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center' }}>5-6</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 5 && word.ord.length <= 6).length} ord</Typography>
            </Box>
            <Box sx={getSpellingBoxStyle(0.75, 5, 6)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.75x hastighet, 5-6 bokstäver'); savePlaybackSpeed(0.75); saveSelectedInterval(3); startSpellingExercise(5, 6); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>0.75x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center' }}>5-6</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 5 && word.ord.length <= 6).length} ord</Typography>
            </Box>
            <Box sx={getSpellingBoxStyle(1.0, 5, 6)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 1.0x hastighet, 5-6 bokstäver'); savePlaybackSpeed(1.0); saveSelectedInterval(3); startSpellingExercise(5, 6); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>1.0x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center' }}>5-6</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 5 && word.ord.length <= 6).length} ord</Typography>
            </Box>
            
            {/* Rad 5: 6+ bokstäver */}
            <Box sx={getSpellingBoxStyle(0.5, 6, 50)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.5x hastighet, 6+ bokstäver'); savePlaybackSpeed(0.5); saveSelectedInterval(4); startSpellingExercise(6, 50); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>0.5x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center' }}>6+</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 6).length} ord</Typography>
          </Box>
            <Box sx={getSpellingBoxStyle(0.75, 6, 50)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.75x hastighet, 6+ bokstäver'); savePlaybackSpeed(0.75); saveSelectedInterval(4); startSpellingExercise(6, 50); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>0.75x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center' }}>6+</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 6).length} ord</Typography>
            </Box>
            <Box sx={getSpellingBoxStyle(1.0, 6, 50)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 1.0x hastighet, 6+ bokstäver'); savePlaybackSpeed(1.0); saveSelectedInterval(4); startSpellingExercise(6, 50); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>1.0x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center' }}>6+</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 6).length} ord</Typography>
            </Box>
          </Box>
        </Box>


        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => setSelectedExerciseType(null)}
            startIcon={<Refresh />}
          >
            Tillbaka till övningstyper
          </Button>
        </Box>
      </Container>
    );
  }

  // Visa övningstyp-val om ingen är vald
  if (!selectedExerciseType) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          },
          gap: 3,
          mb: 4
        }}>
          {/* Teckna */}
            <Card 
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                borderColor: 'primary.main'
              }
              }}
              onClick={() => handleExerciseTypeSelect(ExerciseType.FLASHCARDS)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <School sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Teckna
                </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Se ordet, teckna själv, och jämför med videon.
                </Typography>
              </CardContent>
            </Card>

          {/* Flervalsquiz */}
            <Card 
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                borderColor: 'secondary.main'
              }
            }}
            onClick={() => {
              if (quizWords.length < 10) {
                alert(`Du behöver minst 10 ord för att kunna göra flervalsquiz. Du har för närvarande ${quizWords.length} ord tillgängliga (från "att lära mig" och "lärda").\n\nMarkera fler ord som "vill lära mig" eller "lärda" för att kunna göra quizet.`);
                return;
              }
              handleExerciseTypeSelect(ExerciseType.QUIZ);
            }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Quiz sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Flervalsquiz
                </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  Se videon och välj rätt ord från flera alternativ.
                </Typography>
              </CardContent>
            </Card>

          {/* Övningstest */}
            <Card 
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                borderColor: 'success.main'
              }
              }}
              onClick={() => handleExerciseTypeSelect(ExerciseType.SIGN)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Gesture sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Övningstest
                </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Testsida?.
                </Typography>
              </CardContent>
            </Card>

          {/* Bokstavering */}
            <Card 
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                borderColor: 'warning.main'
              }
              }}
              onClick={() => handleExerciseTypeSelect(ExerciseType.SPELLING)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Spellcheck sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Bokstavering
                </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  Se bokstaveringsvideo och gissa vilket ord som bokstaveras.
                </Typography>
              </CardContent>
            </Card>

          {/* Meningar */}
          <Card 
            sx={{ 
              cursor: 'pointer', 
              height: '100%',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                borderColor: 'info.main'
              }
            }}
            onClick={() => handleExerciseTypeSelect(ExerciseType.SENTENCES)}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <ChatBubbleOutline sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Meningar
           </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Öva med meningar och fraser från dina lärda ord.
              </Typography>
            </CardContent>
          </Card>

          {/* Duplicerad Meningar-övning */}
          <Card sx={{ 
            cursor: 'pointer', 
            height: '100%',
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'all 0.2s ease',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              borderColor: 'secondary.main'
            }
          }}
          onClick={() => handleExerciseTypeSelect(ExerciseType.SENTENCES_DUPLICATE)}
        >
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <ChatBubbleOutline sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Meningar (Duplicerad)
           </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              Duplicerad version av meningar-övningen för testning.
            </Typography>
          </CardContent>
        </Card>
        </Box>

        {/* Progress-mätare */}
        <Paper sx={{ 
          mt: 4, 
          p: 3, 
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
            Mitt lärande
          </Typography>
          
          {(() => {
             // Räkna ord per nivå
             const level1Words = Object.entries(wordProgress).filter(([_, progress]) => progress.level === 1).length;
             const level2Words = Object.entries(wordProgress).filter(([_, progress]) => progress.level === 2).length;
            
            // Räkna omarkerade ord från ordlista-ordlista
            const unmarkedWords = Object.entries(wordDatabase).filter(([_, word]: [string, any]) => 
              word.ämne && word.ämne.includes('Ordlista - Ordlista') && 
              (!wordProgress[word.id] || wordProgress[word.id].level === 0)
            ).length;
            
            // Räkna ordlistor där alla ord är lärda
            // Hämta alla ordlistor från wordLists.ts
            const { getAllWordLists } = require('../types/wordLists');
            const allWordLists = getAllWordLists(wordDatabase);
            
            // Gruppera ordlistor efter namn för att räkna avklarade
            const wordListGroups = allWordLists.reduce((acc: any, wordList: any) => {
              if (!acc[wordList.name]) {
                acc[wordList.name] = [];
              }
              acc[wordList.name].push(wordList);
              return acc;
            }, {});
            
            // Debug: logga ordlistor
            console.log('[DEBUG] All word lists:', allWordLists.map((list: any) => list.name));
            console.log('[DEBUG] Word list groups:', Object.keys(wordListGroups));
            
            const completedLists = Object.entries(wordListGroups).filter(([listName, wordLists]: [string, any]) => {
              // Kontrollera om alla ord i alla wordLists med detta namn är lärda
              const allWordsInList = wordLists.flatMap((wordList: any) => wordList.wordIds || []);
              const allLearned = allWordsInList.every((wordId: string) => wordProgress[wordId]?.level === 2);
              console.log(`[DEBUG] List ${listName}: ${allWordsInList.length} words, all learned: ${allLearned}`);
              return allLearned;
            }).length;
            
            // Räkna avklarade bokstavering-rutor
            const completedSpellingBoxesCount = completedSpellingBoxes.length;
             
            // Räkna totalt antal ordlistor (unika namn)
            const totalLists = Object.keys(wordListGroups).length;
            
            console.log(`[DEBUG] Completed lists: ${completedLists}, Total lists: ${totalLists}`);
             
             return (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
                {/* Lärda */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'success.50',
                  border: '1px solid',
                  borderColor: 'success.200',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                    {level2Words}
                 </Typography>
                   <Typography variant="body2" color="text.secondary">
                    Lärda ord
                   </Typography>
                </Box>
                
                {/* Avklarade ordlistor */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'info.50',
                  border: '1px solid',
                  borderColor: 'info.200',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main', mb: 1 }}>
                    {completedLists}/{totalLists}
                   </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avklarade ordlistor
                   </Typography>
                 </Box>
                
                {/* Bokstavering framsteg */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'warning.50',
                  border: '1px solid',
                  borderColor: 'warning.200',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 1 }}>
                    {completedSpellingBoxesCount}/15
                  </Typography>
               <Typography variant="body2" color="text.secondary">
                    Bokstavering
               </Typography>
                 </Box>
               </Box>
             );
           })()}
        </Paper>

         {/* Start-guide knapp */}
         <Paper sx={{ mt: 3, p: 3 }}>
           <Typography variant="h6" gutterBottom>
             Lägg till fler ord
                    </Typography>
           <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
             Använd startguiden för att lägga till fler ord i "att lära mig" från olika ordlistor.
                    </Typography>
                        <Button
             variant="contained"
             startIcon={<School />}
             onClick={() => {
               // Öppna startguiden genom att trigga en custom event
               window.dispatchEvent(new CustomEvent('openStartGuide'));
             }}
             sx={{ mt: 1 }}
           >
             Öppna start-guide
                        </Button>
         </Paper>
       </Container>
     );
  }

  // Visa resultat-dialog
  if (showResults) {
    return (
      <Dialog open={showResults} maxWidth="sm" fullWidth>
        <DialogTitle>
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
              <List>
                {results.map((result, index) => {
                  // Hämta ordet från wordDatabase baserat på wordId istället för index
                  const word = wordDatabase[result.wordId];
                  console.log(`[DEBUG] Result ${index}: wordId=${result.wordId}, word=${word?.ord}, isCorrect=${result.isCorrect}`);
                  return (
                    <ListItem key={`${result.wordId}-${index}`}>
                      <ListItemText
                        primary={word?.ord || `Okänt ord (ID: ${result.wordId})`}
                        secondary={wordsMovedToLearned.has(result.wordId) ? "Flyttad till lärda ord!" : ""}
                      />
                      {result.isCorrect ? (
                        wordProgress[result.wordId]?.level === 2 ? (
                        <CheckCircle color="success" />
                        ) : (
                          <CheckCircle color="primary" />
                        )
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
          <Button onClick={handleBackToMenu} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }


  // Om en övning är vald men currentWord är undefined, visa valideringsmeddelande
  // Men bara för övningar som behöver lärda ord (inte bokstavering eller meningar)
  if (selectedExerciseType && !currentWord && 
      selectedExerciseType !== ExerciseType.SPELLING && 
      selectedExerciseType !== ExerciseType.SENTENCES) {
    const validation = validateAvailableWords();
    if (validation.showWarning) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom color="warning.main">
              Få ord tillgängliga
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="h6" gutterBottom>
                {validation.message}
              </Typography>
              <Typography variant="body2">
                {validation.suggestion}
              </Typography>
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
                startIcon={<Refresh />}
              >
                Uppdatera sidan
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setSelectedExerciseType(null)}
              >
                OK, fortsätt ändå
              </Button>
            </Box>
          </Box>
      </Container>
    );
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header med progress */}
      <Box sx={{ mb: 2 }}>
        {/* Visa rubrik bara för andra övningstyper än flashcards och bokstavering */}
        {selectedExerciseType !== ExerciseType.FLASHCARDS && selectedExerciseType !== ExerciseType.SPELLING && (
        <Typography variant="h4" gutterBottom align="center">
          {selectedExerciseType === ExerciseType.QUIZ && 'Flervalsquiz'}
            {selectedExerciseType === ExerciseType.SIGN && 'Övningstest'}
            {selectedExerciseType === ExerciseType.SENTENCES && 'Meningar'}
        </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Ord {currentWordIndex + 1} av {
              (selectedExerciseType as any) === ExerciseType.SPELLING ? spellingWords.length :
              (selectedExerciseType as any) === ExerciseType.QUIZ ? quizWords.length :
              practiceWords.length
            }
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={((currentWordIndex + 1) / (
            (selectedExerciseType as any) === ExerciseType.SPELLING ? spellingWords.length :
            (selectedExerciseType as any) === ExerciseType.QUIZ ? quizWords.length :
            practiceWords.length
          )) * 100}
          sx={{ mb: 1, height: 4 }}
        />

      </Box>

      {/* Övningskomponent */}
      {selectedExerciseType === ExerciseType.FLASHCARDS && (
        <>
          {console.log(`[DEBUG] Main: Rendering FlashcardsExercise with word: ${currentWord?.ord} (ID: ${currentWord?.id}), currentWordIndex: ${currentWordIndex}`)}
          {!currentWord ? (
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h5" gutterBottom color="text.secondary">
                  Inga ord att öva med
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Du behöver markera ord som "vill lära mig" eller "lärda" för att kunna göra övningar.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gå till startguiden eller ordlistor för att markera ord.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <>
        <FlashcardsExercise
          word={currentWord}
          onResult={handleExerciseResult}
          onSkip={handleSkip}
        />
              
              {/* Diskret knapp för att placera ord i lärda */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (currentWord) {
                      // Precis som "Ja, jag kunde" - använd samma funktion
                      handleExerciseResult(true); // Detta sparar resultatet OCH markerar som rätt OCH går till nästa ord
                      // Sedan ge extra poäng för att komma till 5 totalt
                      const current = wordProgress[currentWord.id];
                      if (current && current.points < 5) {
                        setWordLevel(currentWord.id, 2); // Sätt till level 2 (5 poäng)
                      }
                      console.log(`[DEBUG] Manually marked word ${currentWord.ord} as correct and moved to learned`);
                      // INTE handleSkip() här eftersom handleExerciseResult redan hanterar nästa ord
                    }
                  }}
                  sx={{ 
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 2,
                    borderColor: 'success.main',
                    color: 'success.main',
                    '&:hover': {
                      backgroundColor: 'success.50',
                      borderColor: 'success.main'
                    }
                  }}
                >
                  Placera i lärda ord
                </Button>
              </Box>
            </>
          )}
        </>
      )}
      
      {selectedExerciseType === ExerciseType.QUIZ && (
        <>
          {!currentWord ? (
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h5" gutterBottom color="text.secondary">
                  Inga ord att öva med
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Du behöver markera ord som "vill lära mig" eller "lärda" för att kunna göra övningar.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gå till startguiden eller ordlistor för att markera ord.
                </Typography>
              </CardContent>
            </Card>
          ) : (
        <QuizExercise
          word={currentWord}
              allWords={quizWords}
          onResult={handleExerciseResult}
          onSkip={handleSkip}
        />
          )}
        </>
      )}
      
      {selectedExerciseType === ExerciseType.SIGN && (
        <>
          {!currentWord ? (
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h5" gutterBottom color="text.secondary">
                  Inga ord att öva med
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Du behöver markera ord som "vill lära mig" eller "lärda" för att kunna göra övningar.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gå till startguiden eller ordlistor för att markera ord.
                </Typography>
              </CardContent>
            </Card>
          ) : (
        <SignExercise
          word={currentWord}
          onResult={handleExerciseResult}
          onSkip={handleSkip}
        />
          )}
        </>
      )}
      
      {(selectedExerciseType as any) === ExerciseType.SPELLING && (
        <>
          {!currentWord ? (
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h5" gutterBottom color="text.secondary">
                  Inga ord att öva med
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Du behöver markera ord som "vill lära mig" eller "lärda" för att kunna göra övningar.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gå till startguiden eller ordlistor för att markera ord.
                </Typography>
              </CardContent>
            </Card>
          ) : (
        <SpellingExercise
          word={currentWord}
          allSpellingWords={spellingWords}
          onResult={handleExerciseResult}
          onSkip={handleSkip}
          playbackSpeed={playbackSpeed}
        />
          )}
        </>
      )}

      {selectedExerciseType === ExerciseType.SENTENCES && (
        <>
          {learnedWords.length === 0 ? (
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h5" gutterBottom color="text.secondary">
                  Inga ord att öva med
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Du behöver markera ord som "lärda" för att kunna göra meningar-övningar.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gå till startguiden eller ordlistor för att markera ord.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <SentencesExercise
              learnedWords={learnedWords}
              phraseDatabase={phraseDatabase}
              wordDatabase={wordDatabase}
              onResult={handleExerciseResult}
              onSkip={handleSkip}
            />
          )}
        </>
      )}

      {/* Duplicerad Meningar-övning */}
      {selectedExerciseType === ExerciseType.SENTENCES_DUPLICATE && (
        <>
          {learnedWords.length === 0 ? (
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h5" gutterBottom color="text.secondary">
                  Inga ord att öva med
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Du behöver markera ord som "lärda" för att kunna göra meningar-övningar.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gå till startguiden eller ordlistor för att markera ord.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <SentencesExerciseDuplicate
              learnedWords={learnedWords}
              phraseDatabase={phraseDatabase}
              wordDatabase={wordDatabase}
              onResult={handleExerciseResult}
              onSkip={handleSkip}
            />
          )}
        </>
      )}


    </Container>
  );
};

export default OvningPage;
