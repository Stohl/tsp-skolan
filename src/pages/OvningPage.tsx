import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  CircularProgress,
  Link
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
  ChatBubbleOutline,
  Menu
} from '@mui/icons-material';
import { useDatabase, WordIndex } from '../contexts/DatabaseContext';
import { useWordProgress } from '../hooks/usePersistentState';
import { getVideoUrl } from '../types/database';
import { getWordListDifficulty, getAllWordLists } from '../types/wordLists';

// Enum för övningstyper
enum ExerciseType {
  FLASHCARDS = 'flashcards',
  QUIZ = 'quiz',
  SIGN = 'sign',
  SPELLING = 'spelling',
  SENTENCES = 'sentences'
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
  onMoveToLearned: () => void;
  wordIndex: WordIndex | null;
  wordDatabase: any;
}> = ({ word, onResult, onSkip, onMoveToLearned, wordIndex, wordDatabase }) => {
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


  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3, boxShadow: 'none', border: 'none' }}>
      <CardContent sx={{ textAlign: 'center', p: 0, pt: 0, border: 'none' }}>
        {!showVideo ? (
          // Visa ordet
          <Box sx={{ border: 'none' }}>
            <Typography variant="h4" sx={{ mb: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              {isLearnedWord && (
                <CheckCircle sx={{ color: 'success.main', fontSize: '0.6em' }} />
              )}
              {word.ord}
              {word.beskrivning && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.5em' }}>
                  ({word.beskrivning})
            </Typography>
              )}
            </Typography>
            
            {countdown !== null && countdown > 0 && (
              <Typography variant="h6" color="primary" sx={{ mb: 0.3 }}>
                {countdown}...
              </Typography>
            )}
            
            {countdown === null && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 0.3 }}>
                Tecknet visas om 3 sekunder...
              </Typography>
            )}
            
          </Box>
        ) : (
          // Visa videon och resultat-knappar
          <Box sx={{ border: 'none' }}>
            {/* Visa ordet ovanför videon */}
            <Typography variant="h4" sx={{ mb: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              {isLearnedWord && (
                <CheckCircle sx={{ color: 'success.main', fontSize: '0.6em' }} />
              )}
              {word.ord}
              {word.beskrivning && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.5em' }}>
                  ({word.beskrivning})
                </Typography>
              )}
            </Typography>
            <VariantSequencePlayer 
              word={word} 
              wordIndex={wordIndex} 
              wordDatabase={wordDatabase} 
            />
            
            {/* Resultat-knappar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
              {/* De två första knapparna bredvid varandra på mobil */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, gap: 2 }}>
            <Button
              variant="contained"
                  color="success"
              size="large"
                  onClick={() => handleResult(true)}
                  startIcon={<CheckCircle />}
                  sx={{ textTransform: 'none', flex: 1 }}
                >
                  Det kunde jag
            </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={() => handleResult(false)}
                  startIcon={<Cancel />}
                  sx={{ textTransform: 'none', flex: 1 }}
                >
                  Behöver öva mer
                </Button>
              </Box>
              {/* Placera i lärda ord knappen längst ner */}
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  onMoveToLearned();
                }}
                sx={{ 
                  textTransform: 'none',
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
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Komponent för att spela alla varianter av ett ord i sekvens
const VariantSequencePlayer: React.FC<{
  word: any;
  wordIndex: WordIndex | null;
  wordDatabase: any;
}> = ({ word, wordIndex, wordDatabase }) => {
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hämta alla varianter av ordet
  const variants = useMemo(() => {
    if (!wordIndex || !word) return [];
    
    const wordVariants = wordIndex.variants[word.ord.toLowerCase()];
    if (!wordVariants || wordVariants.count <= 1) return [word];
    
    return wordVariants.variants.map(variantId => wordDatabase[variantId]).filter(Boolean);
  }, [word, wordIndex, wordDatabase]);

  // Spela nästa variant när videon är klar
  useEffect(() => {
    if (!isPlaying || variants.length <= 1) return;

    const handleVideoEnd = () => {
      console.log(`[DEBUG] Video ended for variant ${currentVariantIndex + 1} of ${variants.length}`);
      if (currentVariantIndex < variants.length - 1) {
        setCurrentVariantIndex(prev => prev + 1);
      } else {
        // Börja om från början
        setCurrentVariantIndex(0);
      }
    };

    // Lägg till event listener när videot är redo
    const video = videoRef.current;
    if (video) {
      console.log(`[DEBUG] Adding event listener to video for variant ${currentVariantIndex + 1}`);
      // Ta bort eventuell befintlig listener först
      video.removeEventListener('ended', handleVideoEnd);
      // Lägg till ny listener
      video.addEventListener('ended', handleVideoEnd);
      
      return () => {
        console.log(`[DEBUG] Removing event listener from video for variant ${currentVariantIndex + 1}`);
        video.removeEventListener('ended', handleVideoEnd);
      };
    } else {
      console.log(`[DEBUG] Video ref is null for variant ${currentVariantIndex + 1}`);
    }
  }, [currentVariantIndex, isPlaying, variants.length]);

  // Starta sekvensen när komponenten mountas
  useEffect(() => {
    if (variants.length > 1) {
      setIsPlaying(true);
    }
  }, [variants.length]);

  const currentVariant = variants[currentVariantIndex];

  if (variants.length <= 1) {
    // Ingen variant-sekvens, visa bara det vanliga videot
    return word.video_url ? (
              <Box sx={{ mb: 0.3 }}>
                <video
                  ref={videoRef}
          key={word.id}
                  autoPlay
                  muted
          playsInline
          loop
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
              videoRef.current.play().catch(error => {
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
            cursor: 'pointer'
                  }}
                >
                  <source src={getVideoUrl(word.video_url)} type="video/mp4" />
                  Din webbläsare stöder inte video-elementet.
                </video>
              </Box>
    ) : null;
  }

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ mb: 0.3 }}>
        <Typography variant="caption" color="text.secondary">
          variant {currentVariantIndex + 1} av {variants.length}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={((currentVariantIndex + 1) / variants.length) * 100}
          sx={{ mt: 1, height: 4, borderRadius: 2 }}
        />
      </Box>
      
      {currentVariant?.video_url && (
        <video
          ref={videoRef}
          key={`${currentVariant.id}-${currentVariantIndex}`}
          autoPlay
          muted
          playsInline
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(error => {
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
            cursor: 'pointer'
          }}
        >
          <source src={getVideoUrl(currentVariant.video_url)} type="video/mp4" />
          Din webbläsare stöder inte video-elementet.
        </video>
      )}
    </Box>
  );
};

// Komponent för Flervalsquiz-övning (baserad på FlashcardsExercise men utan countdown och med 4 alternativ)
const MultipleChoiceExercise: React.FC<{
  word: any;
  allWords: any[];
  onResult: (isCorrect: boolean) => void;
  onSkip: () => void;
  onMoveToLearned: () => void;
  wordIndex: WordIndex | null;
  wordDatabase: any;
}> = ({ word, allWords, onResult, onSkip, onMoveToLearned, wordIndex, wordDatabase }) => {
  // Bestäm vilken typ av ord detta är baserat på progress level
  const isLearnedWord = word.progress?.level === 2;
  const [showVideo, setShowVideo] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Återställ state när ordet ändras
  useEffect(() => {
    console.log(`[DEBUG] MultipleChoice: Word changed to: ${word.ord} (ID: ${word.id})`);
    setShowVideo(false);
    setSelectedAnswer(null);
    setShowResult(false);
  }, [word.id, word.ord]);

  // Visa videon direkt (ingen countdown)
  useEffect(() => {
    if (!showVideo) {
      setShowVideo(true);
    }
  }, [showVideo]);

  // Generera felaktiga alternativ
  const getWrongAnswers = () => {
    const wrongWords = shuffleArray(allWords
      .filter(w => w.id !== word.id))
      .slice(0, 3);
    return wrongWords.map(w => w.ord);
  };

  const wrongAnswers = useMemo(() => getWrongAnswers(), [word.id, allWords]);

  // Skapa alla alternativ (rätt svar + 3 fel)
  const allAnswers = useMemo(() => {
    const answers = [word.ord, ...wrongAnswers];
    return shuffleArray(answers);
  }, [word.ord, wrongAnswers]);

  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer) return; // Förhindra flera klick
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === word.ord;
    console.log(`[DEBUG] MultipleChoice: User selected "${answer}", correct: ${isCorrect} for word: ${word.ord} (ID: ${word.id})`);
    
    // Vänta lite innan vi anropar onResult för att användaren ska se resultatet
    // Vänta längre om svaret är fel för att ge tid att se rätt svar
    const delay = isCorrect ? 1500 : 3000;
    setTimeout(() => {
      onResult(isCorrect);
    }, delay);
  };

  const handleMoveToLearned = () => {
    onMoveToLearned();
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3, boxShadow: 'none', border: 'none' }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        <Box>
          <VariantSequencePlayer 
            word={word} 
            wordIndex={wordIndex} 
            wordDatabase={wordDatabase} 
          />
          
          {/* Visa svarsalternativ */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {allAnswers.map((answer, index) => {
              let buttonColor: 'primary' | 'success' | 'error' = 'primary';
              let disabled = false;
              
              if (showResult && selectedAnswer) {
                if (answer === word.ord) {
                  buttonColor = 'success'; // Rätt svar är alltid grön
                } else if (answer === selectedAnswer) {
                  buttonColor = 'error'; // Valda fel svar är röd
                } else {
                  disabled = true; // Andra alternativ blir inaktiva
                }
              }
              
              return (
              <Button
                  key={index}
                  variant={(selectedAnswer === answer || (showResult && answer === word.ord)) ? 'contained' : 'outlined'}
                  color={buttonColor}
                size="large"
                  disabled={disabled}
                  onClick={() => handleAnswerClick(answer)}
                  sx={{ 
                    textTransform: 'none',
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  {answer}
              </Button>
              );
            })}
          </Box>
          
          {/* Placera i lärda ord knapp */}
              <Button
            variant="outlined"
                size="large"
            onClick={handleMoveToLearned}
            sx={{ 
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
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3, boxShadow: 'none', border: 'none' }}>
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
            <Box sx={{ mb: 0.3 }}>
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

        {/* Hoppa över-knapp borttagen för bokstavering */}
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
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3, boxShadow: 'none', border: 'none' }}>
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
            
            <Typography variant="h4" sx={{ mb: 1 }}>
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
              <Box sx={{ mb: 0.3 }}>
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
            <Typography variant="h4" sx={{ mb: 1 }}>
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

  // Generera felaktiga alternativ med liknande bokstäver som det korrekta ordet
  const getWrongAnswers = () => {
    const correctWord = word.ord.toLowerCase();
    const correctLength = correctWord.length;
    let wrongWords: any[] = [];
    
    // Funktion för att beräkna likhet mellan två ord
    const calculateSimilarity = (word1: string, word2: string): number => {
      const w1 = word1.toLowerCase();
      const w2 = word2.toLowerCase();
      let similarity = 0;
      
      // Poäng för samma första bokstav
      if (w1[0] === w2[0]) similarity += 2;
      
      // Poäng för samma sista bokstav
      if (w1[w1.length - 1] === w2[w2.length - 1]) similarity += 2;
      
      // Poäng för gemensamma bokstäver
      const commonLetters = new Set();
      for (let i = 0; i < Math.min(w1.length, w2.length); i++) {
        if (w1[i] === w2[i]) {
          similarity += 1;
          commonLetters.add(w1[i]);
        }
      }
      
      // Poäng för bokstäver som finns i båda orden (men inte på samma position)
      for (const letter of w1) {
        if (w2.includes(letter) && !commonLetters.has(letter)) {
          similarity += 0.5;
        }
      }
      
      return similarity;
    };
    
    // Försök först hitta ord med exakt samma längd
    const sameLengthWords = allSpellingWords.filter(w => w.id !== word.id && w.ord.length === correctLength);
    
    if (sameLengthWords.length > 0) {
      // Beräkna likhet för alla ord med samma längd
      const wordsWithSimilarity = sameLengthWords.map(w => ({
        word: w,
        similarity: calculateSimilarity(correctWord, w.ord)
      })).sort((a, b) => b.similarity - a.similarity);
      
      // Ta 2-3 ord med hög likhet (likhet >= 3)
      const highSimilarity = wordsWithSimilarity.filter(w => w.similarity >= 3);
      const selectedWords: Array<{word: any, similarity: number}> = [];
      
      if (highSimilarity.length > 0) {
        const numHigh = Math.min(3, highSimilarity.length);
        const shuffledHigh = shuffleArray(highSimilarity).slice(0, numHigh);
        selectedWords.push(...shuffledHigh);
      }
      
      // Slumpa resten från ord med samma längd (exklusive de redan valda)
      const remainingWords = wordsWithSimilarity.filter(w => 
        !selectedWords.some(selected => selected.word.id === w.word.id)
      );
      
      if (remainingWords.length > 0) {
        const needed = 7 - selectedWords.length;
        const shuffledRemaining = shuffleArray(remainingWords).slice(0, needed);
        selectedWords.push(...shuffledRemaining);
      }
      
      wrongWords = selectedWords.map(item => item.word);
    }
    
    // Om vi inte har tillräckligt (7 ord), komplettera med ord med liknande längd (±1 bokstav)
    if (wrongWords.length < 7) {
      const similarLengthWords = allSpellingWords.filter(w => 
        w.id !== word.id && 
        w.ord.length >= correctLength - 1 && 
        w.ord.length <= correctLength + 1 &&
        !wrongWords.some(existing => existing.id === w.id)
      );
      
      if (similarLengthWords.length > 0) {
        const similarLengthWithScore = similarLengthWords.map(w => ({
          word: w,
          similarity: calculateSimilarity(correctWord, w.ord)
        })).sort((a, b) => b.similarity - a.similarity);
        
        const needed = 7 - wrongWords.length;
        const shuffled = shuffleArray(similarLengthWithScore).slice(0, needed);
        wrongWords = [...wrongWords, ...shuffled.map(item => item.word)];
      }
    }
    
    // Om vi fortfarande inte har tillräckligt, komplettera med alla andra ord
    if (wrongWords.length < 7) {
      const allOtherWords = allSpellingWords.filter(w => 
        w.id !== word.id && 
        !wrongWords.some(existing => existing.id === w.id)
      );
      
      if (allOtherWords.length > 0) {
        const otherWordsWithScore = allOtherWords.map(w => ({
          word: w,
          similarity: calculateSimilarity(correctWord, w.ord)
        })).sort((a, b) => b.similarity - a.similarity);
        
        const needed = 7 - wrongWords.length;
        const shuffled = shuffleArray(otherWordsWithScore).slice(0, needed);
        wrongWords = [...wrongWords, ...shuffled.map(item => item.word)];
      }
    }
    
    // Blanda och ta max 7 ord (för totalt 8 alternativ inklusive det korrekta)
    const shuffledWords = shuffleArray(wrongWords).slice(0, 7);
    console.log(`[DEBUG] Spelling alternatives: correct="${word.ord}" (${correctLength} chars), wrong alternatives:`, shuffledWords.map(w => `${w.ord} (${w.ord.length} chars, similarity: ${calculateSimilarity(correctWord, w.ord).toFixed(1)})`));
    
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
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3, boxShadow: 'none', border: 'none' }}>
      <CardContent sx={{ textAlign: 'center', p: 1 }}>
        {/* Indikator för ordtyp */}
        <Box sx={{ mb: 1 }}>
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
            Vilket ordyyy?
          </Typography>
          
          {word.video_url && (
            <Box sx={{ mb: 0 }}>
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
        </Box>

        {/* Svarsalternativ */}
        <Box
          sx={(theme) => ({
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: 1,
            p: 0.25,
            mt: 1,
            // Säkerställ bra kontrast i mörkt läge runt rutnätet
            backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : 'transparent',
          })}
        >
          {answers.map((answer, index) => (
            <Button
              key={answer.id}
              variant={showResult && isCorrectAnswer(answer.id) ? 'contained' : 'outlined'}
              onClick={() => handleAnswerSelect(answer.id)}
              disabled={selectedAnswer !== null || showResult}
              sx={(theme) => ({
                minHeight: '45px',
                fontSize: '1rem',
                fontWeight: 600,
                border: (selectedAnswer === answer.id || clickedAnswer === answer.id) ? '2px solid' : '1px solid',
                borderColor: showResult
                  ? (isCorrectAnswer(answer.id) ? 'success.main' : 'error.main')
                  : (clickedAnswer === answer.id ? 'primary.main' : 'divider'),
                // Bakgrund i mörkt tema ska inte vara helt transparent – ge svag ton
                backgroundColor: showResult
                  ? (isCorrectAnswer(answer.id) ? 'success.main' : (theme.palette.mode === 'dark' ? 'error.dark' : 'error.light'))
                  : (clickedAnswer === answer.id
                      ? (theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light')
                      : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.palette.background.paper)),
                color: showResult
                  ? (isCorrectAnswer(answer.id) ? 'success.contrastText' : 'error.contrastText')
                  : (theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary'),
                transition: 'none !important',
                '&:hover': {
                  backgroundColor: showResult
                    ? (isCorrectAnswer(answer.id) ? 'success.main' : (theme.palette.mode === 'dark' ? 'error.dark' : 'error.light'))
                    : (clickedAnswer === answer.id
                        ? (theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light')
                        : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'action.hover'))
                },
                '&:disabled': {
                  opacity: showResult && !isCorrectAnswer(answer.id) ? 0.5 : 1
                }
              })}
            >
              {answer.text}
            </Button>
          ))}
        </Box>

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

        {/* Hoppa över-knapp borttagen för denna övning */}
      </CardContent>
    </Card>
  );
};

// Komponent för Meningar-övning - visar alla meningar länkade till lärda ord
const SentencesExercise: React.FC<{
  learnedWords: any[];
  phraseDatabase: any;
  wordDatabase: any;
  onResult: (isCorrect: boolean) => void;
  onSkip: () => void;
  sentencesOnlyWithLevel?: boolean;
}> = ({ learnedWords, phraseDatabase, wordDatabase, onResult, onSkip, sentencesOnlyWithLevel = true }) => {
  // Ladda phrase_index.json för att hitta fraser länkade till lärda ord
  const [phraseIndex, setPhraseIndex] = useState<any>(null);
  const [isLoadingPhrases, setIsLoadingPhrases] = useState(true);
  const [sortBy, setSortBy] = useState<'id' | 'learned' | 'unlearned'>('unlearned');
  const [sortAscending, setSortAscending] = useState(true);

  useEffect(() => {
    const loadPhraseIndex = async () => {
      try {
        const response = await fetch('/phrase_index.json');
        const data = await response.json();
        setPhraseIndex(data);
      } catch (error) {
        console.error('Fel vid laddning av phrase_index.json:', error);
      } finally {
        setIsLoadingPhrases(false);
      }
    };

    loadPhraseIndex();
  }, []);

  // Hitta alla fraser som är länkade till lärda ord (optimerad version)
  const getLinkedPhrases = () => {
    if (!phraseIndex || !phraseDatabase || learnedWords.length === 0) {
      return { completePhrases: [], almostCompletePhrases: [] };
    }

    const learnedWordIds = new Set(learnedWords.map(word => word.id));
    const phraseMap = new Map(); // För att undvika duplicerade fraser

    // Gå igenom alla lärda ord och hitta deras fraser
    learnedWords.forEach(learnedWord => {
      const phraseIds = phraseIndex.word_to_phrases[learnedWord.id];
      if (phraseIds) {
        phraseIds.forEach((phraseId: string) => {
          if (!phraseMap.has(phraseId)) {
            const phraseData = phraseDatabase[phraseId];
            if (phraseData) {
              // Filtrera baserat på inställningen för meningsnivå
              if (sentencesOnlyWithLevel && !phraseData.meningsnivå) {
                return; // Hoppa över meningar utan meningsnivå
              }

              // Hitta vilka ord som hänvisar till denna fras (optimerat med phrase_to_words)
              const referringWords: any[] = [];
              
              // Använd phrase_to_words för direkt lookup istället för att gå igenom alla ord
              const wordIds = phraseIndex.phrase_to_words[phraseId];
              if (wordIds) {
                wordIds.forEach((wordId: string) => {
                  const wordData = wordDatabase[wordId];
                  if (wordData) {
                    referringWords.push(wordData);
                  }
                });
              }

              const learnedReferringWords = referringWords.filter(word => learnedWordIds.has(word.id));
              const unlearnedReferringWords = referringWords.filter(word => !learnedWordIds.has(word.id));

              phraseMap.set(phraseId, {
                id: phraseId,
                fras: phraseData.fras,
                meningsnivå: phraseData.meningsnivå || null,
                video_url: phraseData.video_url,
                learnedWords: learnedReferringWords,
                unlearnedWords: unlearnedReferringWords,
                primaryWord: learnedWord
              });
            }
          }
        });
      }
    });

    // Konvertera Map till array
    const uniquePhrases = Array.from(phraseMap.values());
    
    // Separera meningar baserat på antal saknade ord
    const completePhrases = uniquePhrases.filter(phrase => phrase.unlearnedWords.length === 0);
    const almostCompletePhrases = uniquePhrases.filter(phrase => phrase.unlearnedWords.length === 1);
    
    // Sortera varje lista
    const sortPhrases = (phrases: any[]) => {
      return [...phrases].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'id':
            comparison = a.id.localeCompare(b.id);
            break;
          case 'learned':
            comparison = a.learnedWords.length - b.learnedWords.length;
            break;
          case 'unlearned':
            comparison = a.unlearnedWords.length - b.unlearnedWords.length;
            break;
          default:
            return 0;
        }
        
        // Växla riktning baserat på sortAscending
        return sortAscending ? comparison : -comparison;
      });
    };

    return {
      completePhrases: sortPhrases(completePhrases),
      almostCompletePhrases: sortPhrases(almostCompletePhrases)
    };
  };

  const { completePhrases, almostCompletePhrases } = getLinkedPhrases();

  // Typer för Top 3-debug
  type PhraseDetail = { id: string; fras: string; meningsnivå: string | null; words: string[]; missingWord: string };
  type Top3Entry = { wordId: string; word: string; count: number; phraseIds: string[]; phraseDetails: PhraseDetail[] };

  // Beräkna vilka ord som skulle göra flest meningar kompletta (unika fraser, N1–N4, exakt 1 saknat ord)
  const getMostCommonUnlearnedWords = (): Top3Entry[] => {
    if (!phraseIndex || !phraseDatabase || learnedWords.length === 0) {
      return [] as Top3Entry[];
    }

    const allowedLevels = new Set(['N1','N2','N3','N4']);
    const learnedWordIds = new Set(learnedWords.map(word => word.id));
    const wordCompletionMap = new Map<string, number>();
    // Samla vilka meningar (fras-ID) som skulle bli kompletta för respektive ord
    const phraseIdsPerWordId = new Map<string, Set<string>>();
    // Samla detaljer per fras för respektive ord: text, nivå och ord
    const phraseDetailsPerWordId = new Map<string, PhraseDetail[]>();

    // Undvik dubbletter när samma fras hittas via flera lärda ord
    // (vi deduplar per wordId via phraseIdsPerWordId set:en)

    // Gå igenom alla lärda ord och deras fraser
    learnedWords.forEach(learnedWord => {
      const phraseIds = phraseIndex.word_to_phrases[learnedWord.id];
      if (phraseIds) {
        phraseIds.forEach((phraseId: string) => {
          const phraseData = phraseDatabase[phraseId];
          if (!phraseData) return;

          const meningsniva: string | undefined = (phraseData as any).meningsnivå;
          // ENDAST fraser med nivå N1–N4
          if (!meningsniva || !allowedLevels.has(meningsniva)) return;

            const referringWordIds = phraseIndex.phrase_to_words[phraseId];
          if (!referringWordIds) return;

              // Räkna hur många okända ord som finns i denna mening
              const unlearnedWordsInPhrase = referringWordIds.filter((wordId: string) => !learnedWordIds.has(wordId));
              
          // Exkludera redan kompletta (0 saknade) och fraser med fler än 1 saknat ord
          if (unlearnedWordsInPhrase.length !== 1) return;

          const neededWordId = unlearnedWordsInPhrase[0];

          // Dedupl per wordId: räkna fras bara en gång per ord
          if (!phraseIdsPerWordId.has(neededWordId)) {
            phraseIdsPerWordId.set(neededWordId, new Set<string>());
          }
          const seenSet = phraseIdsPerWordId.get(neededWordId)!;
          if (seenSet.has(phraseId)) return; // redan räknad denna fras för ordet

          // Räkna
          seenSet.add(phraseId);
          const currentCount = wordCompletionMap.get(neededWordId) || 0;
          wordCompletionMap.set(neededWordId, currentCount + 1);

          // Bygg fras-detaljer för debug
          const wordsInPhrase = referringWordIds
            .map((wid: string) => wordDatabase[wid]?.ord || wid)
            .filter(Boolean) as string[];
          const missingWordName = (wordDatabase[neededWordId]?.ord as string) || neededWordId;
          const entry: PhraseDetail = {
            id: phraseId,
            fras: (phraseData as any).fras || '',
            meningsnivå: meningsniva || null,
            words: wordsInPhrase,
            missingWord: missingWordName
          };
          if (!phraseDetailsPerWordId.has(neededWordId)) {
            phraseDetailsPerWordId.set(neededWordId, []);
          }
          phraseDetailsPerWordId.get(neededWordId)!.push(entry);
        });
      }
    });

    // Konvertera till array och sortera efter antal kompletterade (unika) meningar
    const wordCounts: Top3Entry[] = Array.from(wordCompletionMap.entries())
      .map(([wordId, _obsoleteCount]) => {
        const phraseDetails = phraseDetailsPerWordId.get(wordId) || [];
        const wordData = wordDatabase[wordId];
        return {
          wordId,
          word: wordData ? (wordData.ord as string) : `Ord ${wordId}`,
          // Sätt count till antal unika fraser som uppfyller reglerna
          count: phraseDetails.length,
          phraseIds: Array.from(phraseIdsPerWordId.get(wordId) || []),
          phraseDetails
        } as Top3Entry;
      })
      .filter(entry => entry.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Ta bara de 3 bästa

    // DEBUG: visa för Top 3 vilka (unika) fraser som skulle bli kompletta med detaljer
    wordCounts.forEach((entry) => {
      if (entry.phraseDetails.length > 0) {
        console.log(`[DEBUG][Exercise][Top3] Ord "${entry.word}" (${entry.wordId}) skulle komplettera ${entry.phraseDetails.length} (unika, N1–N4) meningar:`);
        entry.phraseDetails.forEach((p: PhraseDetail) => {
          console.log(`  - ${p.id}${p.fras ? ` (${p.fras})` : ''} | nivå: ${p.meningsnivå ?? '—'} | ord: ${p.words.join(', ')} | saknas: ${p.missingWord}`);
        });
      }
    });

    return wordCounts;
  };

  const mostCommonUnlearnedWords = getMostCommonUnlearnedWords();

  // Hjälpare: bygg fras-detaljer för ett specifikt ord (samma regler som ovan: unika, N1–N4, exakt 1 saknat)
  const buildPhraseDetailsForWord = (targetWordId: string): { id: string; fras: string; meningsnivå: string | null; words: string[]; missingWord: string }[] => {
    if (!phraseIndex || !phraseDatabase || learnedWords.length === 0) return [];
    const allowedLevels = new Set(['N1','N2','N3','N4']);
    const learnedWordIds = new Set(learnedWords.map(w => w.id));
    const seen = new Set<string>();
    const details: { id: string; fras: string; meningsnivå: string | null; words: string[]; missingWord: string }[] = [];

    Object.keys(phraseDatabase).forEach((phraseId: string) => {
      if (seen.has(phraseId)) return;
      const phraseData: any = (phraseDatabase as any)[phraseId];
      if (!phraseData) return;
      const meningsniva: string | undefined = phraseData.meningsnivå;
      if (!meningsniva || !allowedLevels.has(meningsniva)) return;
      const referringWordIds: string[] | undefined = phraseIndex?.phrase_to_words?.[phraseId];
      if (!referringWordIds) return;
      const unlearned = referringWordIds.filter((wid: string) => !learnedWordIds.has(wid));
      if (unlearned.length === 1 && unlearned[0] === targetWordId) {
        seen.add(phraseId);
        const words = referringWordIds.map((wid: string) => (wordDatabase[wid]?.ord as string) || wid).filter(Boolean) as string[];
        details.push({
          id: phraseId,
          fras: (phraseData.fras as string) || '',
          meningsnivå: meningsniva || null,
          words,
          missingWord: (wordDatabase[targetWordId]?.ord as string) || targetWordId
        });
      }
    });

    return details;
  };

  // Uppdatera sortering när sortBy eller sortAscending ändras
  useEffect(() => {
    // Trigger re-render när sortering ändras
  }, [sortBy, sortAscending]);

  if (isLoadingPhrases) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3, boxShadow: 'none', border: 'none' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Laddar meningar...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (completePhrases.length === 0 && almostCompletePhrases.length === 0) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3, boxShadow: 'none', border: 'none' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="primary">
            Meningar
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Inga meningar hittades för dina lärda ord.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lär dig fler ord för att se relaterade meningar.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // DEBUG: skriv bara ut om något hittades
  if (completePhrases.length > 0) {
    console.log('[DEBUG][Exercise] Kompletta meningar:', completePhrases.map(p => `${p.id} (${p.fras || ''})`));
  }
  if (almostCompletePhrases.length > 0) {
    console.log('[DEBUG][Exercise] Nästan kompletta meningar:', almostCompletePhrases.map(p => `${p.id} (${p.fras || ''})`));
  }

  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Meningar
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          {completePhrases.length + almostCompletePhrases.length} meningar/fraser hittades
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Länkade till dina {learnedWords.length} lärda ord
        </Typography>

        {/* Top 3 ord att lära sig */}
        {mostCommonUnlearnedWords.length > 0 && (
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
              🎯 Bästa ord att lära sig (Top 3)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Dessa ord skulle göra flest "nästan kompletta" meningar kompletta:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {mostCommonUnlearnedWords.map((wordData, index) => (
                <Chip 
                  key={wordData.wordId}
                  label={`${wordData.word} (+${wordData.count})`}
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Sorteringsknappar */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant={sortBy === 'id' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => {
              if (sortBy === 'id') {
                setSortAscending(!sortAscending);
              } else {
                setSortBy('id');
                setSortAscending(true);
              }
            }}
            sx={{ minWidth: 100 }}
          >
            ID {sortBy === 'id' ? (sortAscending ? '↑' : '↓') : ''}
          </Button>
          <Button
            variant={sortBy === 'learned' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => {
              if (sortBy === 'learned') {
                setSortAscending(!sortAscending);
              } else {
                setSortBy('learned');
                setSortAscending(false); // Default: flest först
              }
            }}
            sx={{ minWidth: 120 }}
          >
            Lärda ord {sortBy === 'learned' ? (sortAscending ? '↑' : '↓') : ''}
          </Button>
          <Button
            variant={sortBy === 'unlearned' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => {
              if (sortBy === 'unlearned') {
                setSortAscending(!sortAscending);
              } else {
                setSortBy('unlearned');
                setSortAscending(false); // Default: flest först
              }
            }}
            sx={{ minWidth: 120 }}
          >
            Andra ord {sortBy === 'unlearned' ? (sortAscending ? '↑' : '↓') : ''}
          </Button>
        </Box>

        {/* Kompletta meningar (0 saknade ord) */}
        {completePhrases.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2, mt: 3, color: 'success.main', fontWeight: 600 }}>
              Kompletta meningar ({completePhrases.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Alla ord i dessa meningar är lärda
            </Typography>
            <List>
              {completePhrases.map((phrase, index) => (
                <React.Fragment key={phrase.id}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}>
                    {/* Rad 1: Fras-ID, meningsnivå och meningen */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5, width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip 
                        label={`ID: ${phrase.id}`} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                      {phrase.meningsnivå && (
                        <Chip 
                          label={`Nivå ${phrase.meningsnivå}`} 
                          size="small" 
                          variant="filled"
                          color={phrase.meningsnivå === '1' ? 'success' : phrase.meningsnivå === '2' ? 'warning' : 'error'}
                        />
                      )}
                      <Typography variant="body1" sx={{ fontWeight: 500, flex: 1, minWidth: 0 }}>
                        {phrase.fras}
                      </Typography>
                    </Box>

                    {/* Rad 2: Lärda ord */}
                    <Box sx={{ display: 'flex', gap: 2, width: '100%', flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                          Lärda:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {phrase.learnedWords.map((word: any) => (
                            <Chip 
                              key={word.id}
                              label={word.ord} 
                              size="small" 
                              color="success"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < completePhrases.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}

        {/* Nästan kompletta meningar (1 saknat ord) */}
        {almostCompletePhrases.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2, mt: 3, color: 'warning.main', fontWeight: 600 }}>
              Nästan kompletta meningar ({almostCompletePhrases.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Saknar bara 1 ord
            </Typography>
            <List>
              {almostCompletePhrases.map((phrase, index) => (
                <React.Fragment key={phrase.id}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}>
                    {/* Rad 1: Fras-ID, meningsnivå och meningen */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5, width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip 
                        label={`ID: ${phrase.id}`} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                      {phrase.meningsnivå && (
                        <Chip 
                          label={`Nivå ${phrase.meningsnivå}`} 
                          size="small" 
                          variant="filled"
                          color={phrase.meningsnivå === '1' ? 'success' : phrase.meningsnivå === '2' ? 'warning' : 'error'}
                        />
                      )}
                      <Typography variant="body1" sx={{ fontWeight: 500, flex: 1, minWidth: 0 }}>
                        {phrase.fras}
                      </Typography>
                    </Box>

                    {/* Rad 2: Lärda och saknade ord */}
                    <Box sx={{ display: 'flex', gap: 2, width: '100%', flexWrap: 'wrap' }}>
                      {/* Lärda ord */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                          Lärda:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {phrase.learnedWords.map((word: any) => (
                            <Chip 
                              key={word.id}
                              label={word.ord} 
                              size="small" 
                              color="success"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Saknade ord */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                          Saknas:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {phrase.unlearnedWords.map((word: any) => (
                            <Chip 
                              key={word.id}
                              label={word.ord} 
                              size="small" 
                              color="warning"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < almostCompletePhrases.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
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

// Komponent för Meningar-övning med video + gissning
const SentencesPracticeExercise: React.FC<{
  learnedWords: any[];
  phraseDatabase: any;
  wordDatabase: any;
  onResult: (isCorrect: boolean) => void;
  onSkip: () => void;
  selectedLevels: string[];
  sentencesWords: any[];
}> = ({ learnedWords, phraseDatabase, wordDatabase, onResult, onSkip, selectedLevels, sentencesWords }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sentencesProgress, setSentencesProgress] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sentences-progress');
    return saved ? JSON.parse(saved) : {};
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentPhrase = sentencesWords[currentPhraseIndex];

  // Debug: logga video URL när mening ändras
  useEffect(() => {
    if (currentPhrase) {
      console.log('[DEBUG] Current phrase video URL (raw):', currentPhrase.video_url);
      if (currentPhrase.video_url) {
        console.log('[DEBUG] Current phrase video URL (processed):', getVideoUrl(currentPhrase.video_url));
      } else {
        console.log('[DEBUG] Current phrase has no video_url');
      }
      console.log('[DEBUG] Current phrase:', currentPhrase.fras);
    }
  }, [currentPhrase]);

  // Hantera rätt svar
  const handleCorrect = () => {
    if (currentPhrase) {
      const newProgress = { ...sentencesProgress, [currentPhrase.id]: true };
      setSentencesProgress(newProgress);
      localStorage.setItem('sentences-progress', JSON.stringify(newProgress));
      onResult(true);
      nextPhrase();
    }
  };

  // Hantera fel svar
  const handleIncorrect = () => {
    if (currentPhrase) {
      const newProgress = { ...sentencesProgress, [currentPhrase.id]: false };
      setSentencesProgress(newProgress);
      localStorage.setItem('sentences-progress', JSON.stringify(newProgress));
    }
    onResult(false);
    nextPhrase();
  };

  // Gå till nästa mening
  const nextPhrase = () => {
    setIsRevealed(false);
    if (currentPhraseIndex < sentencesWords.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
    } else {
      // Om vi är på sista meningen, gå tillbaka till första
      setCurrentPhraseIndex(0);
    }
  };

  // Hoppa över mening
  const handleSkip = () => {
    onSkip();
    nextPhrase();
  };

  if (sentencesWords.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center', boxShadow: 'none', border: 'none' }}>
        <Typography variant="h6" gutterBottom>
          Inga meningar tillgängliga
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Du behöver lära dig fler ord för att öva på meningar på de valda nivåerna.
        </Typography>
      </Card>
    );
  }

  if (!currentPhrase) {
    return (
      <Card sx={{ p: 3, textAlign: 'center', boxShadow: 'none', border: 'none' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Laddar meningar...
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, boxShadow: 'none', border: 'none' }}>
      {/* Progress indikator */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        {/* Segmenterad progress för meningsövning (likt Teckna/Se tecknet) */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {Array.from({ length: sentencesWords.length }, (_, i) => (
            <Box
              key={i}
              sx={{
                width: { xs: 12, sm: 14 },
                height: 4,
                borderRadius: 2,
                backgroundColor: i < currentPhraseIndex ? 'primary.main' : 'rgba(25, 118, 210, 0.1)'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Video */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        {currentPhrase.video_url ? (
          <video
            ref={videoRef}
            key={currentPhrase.id} // Tvingar React att skapa ny video när meningen ändras
            src={getVideoUrl(currentPhrase.video_url)}
            autoPlay
            muted
            playsInline // Förhindrar helskärm på mobil
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
          onError={(e) => {
            console.error('Video load error:', e);
            alert('Kunde inte ladda videon. Kontrollera internetanslutningen.');
          }}
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            height: '300px',
            objectFit: 'cover',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
        />
        ) : (
          <Box sx={{ 
            width: '100%', 
            maxWidth: '400px', 
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
            borderRadius: '8px',
            border: '2px dashed',
            borderColor: 'grey.300'
          }}>
            <Typography variant="body1" color="text.secondary">
              Ingen video tillgänglig för denna mening
            </Typography>
          </Box>
        )}
      </Box>

      {/* Avslöja knapp */}
      {!isRevealed && (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setIsRevealed(true)}
            sx={{ minWidth: 150 }}
          >
            Visa mening
          </Button>
        </Box>
      )}

      {/* Mening (visas efter avslöjande) */}
      {isRevealed && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {currentPhrase.fras}
          </Typography>
        </Box>
      )}

      {/* Rätt/Fel knappar (visas efter avslöjande) */}
      {isRevealed && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={handleCorrect}
            sx={{ minWidth: 120, textTransform: 'none' }}
          >
            Det förstod jag
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={handleIncorrect}
            sx={{ minWidth: 120, textTransform: 'none' }}
          >
            Behöver öva mer
          </Button>
        </Box>
      )}
    </Card>
  );
};


// Huvudkomponent för övningssidan
interface OvningPageProps {
  onShowKorpus?: () => void;
  onOpenMenu?: () => void;
}

const OvningPage: React.FC<OvningPageProps> = ({ onShowKorpus, onOpenMenu }) => {
  const { wordDatabase, phraseDatabase, wordIndex, isLoading, error } = useDatabase();
  const { getWordsForPractice, markWordResult, setWordLevel, wordProgress, createWordGroups, markWordGroupAsLearned, updateWordProgress } = useWordProgress();
  
  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [flashcardResults, setFlashcardResults] = useState<(boolean | null)[]>(new Array(10).fill(null)); // null = inte besvarad, true = rätt, false = fel
  const [quizResults, setQuizResults] = useState<(boolean | null)[]>(new Array(10).fill(null)); // null = inte besvarad, true = rätt, false = fel

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

  // State för inställning om meningar med meningsnivå
  const [sentencesOnlyWithLevel, setSentencesOnlyWithLevel] = useState<boolean>(() => {
    const saved = localStorage.getItem('sentences-only-with-level');
    return saved ? saved === 'true' : true; // Default till true
  });

  // State för valda meningsnivåer för meningar-övning
  const [selectedSentenceLevels, setSelectedSentenceLevels] = useState<string[]>(['N1']);
  
  // State för meningar-övning
  const [sentencesWords, setSentencesWords] = useState<any[]>([]);
  const [phraseIndex, setPhraseIndex] = useState<any>(null);

  // Ladda phrase_index.json för meningar-övning
  useEffect(() => {
    const loadPhraseIndex = async () => {
      try {
        const response = await fetch('/phrase_index.json');
        const data = await response.json();
        setPhraseIndex(data);
      } catch (error) {
        console.error('Fel vid laddning av phrase_index.json:', error);
      }
    };

    loadPhraseIndex();
  }, []);

  // Rensa sentencesWords när selectedExerciseType ändras från SENTENCES
  useEffect(() => {
    if (selectedExerciseType !== ExerciseType.SENTENCES && sentencesWords.length > 0) {
      console.log('[DEBUG] Clearing sentencesWords because exercise type changed from SENTENCES');
      setSentencesWords([]);
    }
  }, [selectedExerciseType, sentencesWords.length]);

  // Lyssna på ändringar i localStorage för meningar-inställningen
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sentences-only-with-level');
      if (saved !== null) {
        setSentencesOnlyWithLevel(saved === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Hämta lärda ord för Meningar-övningen
  const learnedWords = useMemo(() => {
    const wordsWithProgress = Object.values(wordDatabase).map((word: any) => ({
      ...word,
      progress: wordProgress[word.id] || { level: 0, stats: { difficulty: 0, lastPracticed: new Date().toISOString() } }
    }));
    return wordsWithProgress.filter(word => word.progress.level === 2);
  }, [wordDatabase, wordProgress]);

  // Beräkna progress för meningar per nivå (samma logik som getAvailablePhrasesForLevel)
  const getSentencesProgress = useMemo(() => {
    if (!phraseDatabase || learnedWords.length === 0 || !phraseIndex) {
      return { N1: { correct: 0, total: 0 }, N2: { correct: 0, total: 0 }, N3: { correct: 0, total: 0 }, N4: { correct: 0, total: 0 } };
    }

    const learnedWordIds = new Set(learnedWords.map(word => word.id));
    const sentencesProgress = JSON.parse(localStorage.getItem('sentences-progress') || '{}');
    
    const progress = { N1: { correct: 0, total: 0 }, N2: { correct: 0, total: 0 }, N3: { correct: 0, total: 0 }, N4: { correct: 0, total: 0 } };

    // Se till att inte dubbelräkna samma fras (unik per fras-ID)
    const countedPhraseIds = new Set<string>();

    // DEBUG: samla listor på hittade (unika) meningar per nivå
    const debugFoundPerLevel: Record<string, string[]> = { N1: [], N2: [], N3: [], N4: [] };
    const debugCorrectPerLevel: Record<string, string[]> = { N1: [], N2: [], N3: [], N4: [] };

    // Använd samma logik som getAvailablePhrasesForLevel - gå igenom lärda ord och hitta deras fraser
    learnedWords.forEach(learnedWord => {
      const phraseIds = phraseIndex?.word_to_phrases?.[learnedWord.id];
      if (phraseIds) {
        phraseIds.forEach((phraseId: string) => {
          if (countedPhraseIds.has(phraseId)) {
            return; // hoppa över dubbletter
          }
          const phraseData = phraseDatabase[phraseId];
          if (!phraseData) return;

          const meningsniva = (phraseData as any).meningsnivå as string | undefined;
            // Kontrollera att meningen har en meningsnivå (N1-N4)
          if (meningsniva && ['N1', 'N2', 'N3', 'N4'].includes(meningsniva)) {
              const referringWordIds = phraseIndex?.phrase_to_words?.[phraseId];
            if (!referringWordIds) return;

            // Alla ord som refererar till frasen måste vara lärda
                const allWordsLearned = referringWordIds.every((wordId: string) => learnedWordIds.has(wordId));
            if (!allWordsLearned) return;

            // Markera som räknad nu när vi vet att den uppfyller kraven
            countedPhraseIds.add(phraseId);

            const level = meningsniva as keyof typeof progress;
                  progress[level].total++;
            debugFoundPerLevel[level].push(`${phraseId} (${(phraseData as any).fras || ''})`);
                  if (sentencesProgress[phraseId]) {
                    progress[level].correct++;
              debugCorrectPerLevel[level].push(`${phraseId}`);
            }
          }
        });
      }
    });

    // DEBUG: skriv bara ut om något hittades
    (['N1','N2','N3','N4'] as const).forEach(lvl => {
      if (debugFoundPerLevel[lvl].length > 0) {
        console.log(`[DEBUG][Home] (UNIKA) Hittade meningar ${lvl}:`, debugFoundPerLevel[lvl]);
      }
      if (debugCorrectPerLevel[lvl].length > 0) {
        console.log(`[DEBUG][Home] (UNIKA) Markerade korrekta ${lvl}:`, debugCorrectPerLevel[lvl]);
      }
    });

    return progress;
  }, [phraseDatabase, learnedWords, phraseIndex]);

  // Beräkna vilka ord som skulle göra flest meningar kompletta (samma logik som SentencesExerciseDuplicate)
  const getMostCommonUnlearnedWords = useMemo(() => {
    if (!phraseIndex || !phraseDatabase || learnedWords.length === 0) {
      return [];
    }

    const learnedWordIds = new Set(learnedWords.map(word => word.id));
    const wordCompletionMap = new Map<string, number>();

    // Gå igenom alla lärda ord och deras fraser
    learnedWords.forEach(learnedWord => {
      const phraseIds = phraseIndex.word_to_phrases[learnedWord.id];
      if (phraseIds) {
        phraseIds.forEach((phraseId: string) => {
          const phraseData = phraseDatabase[phraseId];
          if (phraseData && (phraseData as any).meningsnivå) {
            // Hitta vilka ord som hänvisar till denna fras
            const referringWordIds = phraseIndex.phrase_to_words[phraseId];
            if (referringWordIds) {
              // Räkna hur många okända ord som finns i denna mening
              const unlearnedWordsInPhrase = referringWordIds.filter((wordId: string) => !learnedWordIds.has(wordId));
              
              // Om det finns exakt 1 okänt ord, så skulle det ordet göra meningen komplett
              if (unlearnedWordsInPhrase.length === 1) {
                const wordId = unlearnedWordsInPhrase[0];
                const currentCount = wordCompletionMap.get(wordId) || 0;
                wordCompletionMap.set(wordId, currentCount + 1);
              }
            }
          }
        });
      }
    });

    // Konvertera till array och sortera efter antal kompletterade meningar
    const wordCounts = Array.from(wordCompletionMap.entries())
      .map(([wordId, count]) => {
        const wordData = wordDatabase[wordId];
        return {
          wordId,
          word: wordData ? wordData.ord : `Ord ${wordId}`,
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Ta bara de 3 bästa

    return wordCounts;
  }, [phraseIndex, phraseDatabase, learnedWords, wordDatabase]);

  const top3Words = getMostCommonUnlearnedWords;

  // Hjälpare: bygg fras-detaljer för ett specifikt ord som skulle göra meningar kompletta
  const buildPhraseDetailsForWord = (targetWordId: string): { id: string; fras: string; meningsnivå: string | null; words: string[]; missingWord: string }[] => {
    if (!phraseIndex || !phraseDatabase || learnedWords.length === 0) return [];
    const learnedWordIds = new Set(learnedWords.map(w => w.id));
    const details: { id: string; fras: string; meningsnivå: string | null; words: string[]; missingWord: string }[] = [];

    // Gå igenom alla fraser som refererar till targetWordId via phrase_to_words (omvänd lookup saknas, iterera över map:en)
    // Effektivt sätt: iterera alla fraser och kontrollera om targetWordId är det enda olärda
    Object.keys(phraseDatabase).forEach((phraseId: string) => {
      const phraseData: any = (phraseDatabase as any)[phraseId];
      if (!phraseData) return;
      if (sentencesOnlyWithLevel && !phraseData.meningsnivå) return;
      const referringWordIds: string[] | undefined = phraseIndex?.phrase_to_words?.[phraseId];
      if (!referringWordIds) return;
      const unlearned = referringWordIds.filter((wid: string) => !learnedWordIds.has(wid));
      if (unlearned.length === 1 && unlearned[0] === targetWordId) {
        const words = referringWordIds.map((wid: string) => (wordDatabase[wid]?.ord as string) || wid).filter(Boolean) as string[];
        details.push({
          id: phraseId,
          fras: (phraseData.fras as string) || '',
          meningsnivå: (phraseData.meningsnivå as string) || null,
          words,
          missingWord: (wordDatabase[targetWordId]?.ord as string) || targetWordId
        });
      }
    });

    return details;
  };

  // DEBUG: visa en sammanfattning av vad Top 3-rutan visar just nu och detaljer per ord
  if (top3Words && top3Words.length > 0) {
    const summaryWithLiveCounts = top3Words.map(e => {
      const live = buildPhraseDetailsForWord(e.wordId).filter(d => d.meningsnivå && ['N1','N2','N3','N4'].includes(d.meningsnivå)).length;
      return `${e.word} (${e.wordId}) x${live}`;
    });
    console.log('[DEBUG][Exercise][Top3][Shown] Ord:', summaryWithLiveCounts);
    top3Words.forEach(entry => {
      const details = buildPhraseDetailsForWord(entry.wordId);
      // För säkerhets skull, använd samma filter även här så vi inte visar nivå —
      const filteredDetails = details.filter(d => d.meningsnivå && ['N1','N2','N3','N4'].includes(d.meningsnivå));
      if (filteredDetails.length > 0) {
        console.log(`[DEBUG][Exercise][Top3][Shown] → "${entry.word}" (${entry.wordId}) meningar:`, filteredDetails.map(d => `${d.id}${d.fras ? ` (${d.fras})` : ''} | nivå: ${d.meningsnivå ?? '—'} | ord: ${d.words.join(', ')} | saknas: ${d.missingWord}`));
      } else {
        console.log(`[DEBUG][Exercise][Top3][Shown] → "${entry.word}" (${entry.wordId}) (inga matchande meningar hittades vid on-the-fly kontroll).`);
      }
    });
  } else {
    console.log('[DEBUG][Exercise][Top3][Shown] Inga kandidater nu (0 nästan kompletta).');
  }

  // Funktion för att lägga till ord i "att lära mig" listan
  const addWordToLearningList = (wordId: string) => {
    console.log(`[DEBUG] Adding word ${wordId} to learning list`);
    
    // Sätt ordet till nivå 1 (att lära mig) och uppdatera lastPracticed
    updateWordProgress(wordId, {
      level: 1,
      points: 0,
      stats: {
        correct: 0,
        incorrect: 0,
        lastPracticed: new Date().toISOString(),
        difficulty: 50
      }
    });
    
    console.log(`[DEBUG] Word ${wordId} added to learning list with level 1`);
  };

  // Funktion för att kontrollera om ett ord är i "att lära mig" listan
  const isWordInLearningList = (wordId: string) => {
    const progress = wordProgress[wordId];
    return progress && progress.level === 1;
  };

  // Hämta tillgängliga meningar för en specifik nivå
  const getAvailablePhrasesForLevel = (level: 'N1' | 'N2' | 'N3' | 'N4') => {
    if (!phraseIndex || !phraseDatabase || learnedWords.length === 0) {
      return [] as any[];
    }
    
    const learnedWordIds = new Set(learnedWords.map(word => word.id));
    const phraseMap = new Map<string, any>();
    
    // Gå igenom alla lärda ord och hitta deras fraser (samma logik som SentencesExerciseDuplicate)
    learnedWords.forEach(learnedWord => {
      const phraseIds = phraseIndex.word_to_phrases[learnedWord.id];
      if (phraseIds) {
        phraseIds.forEach((phraseId: string) => {
          if (phraseMap.has(phraseId)) return; // undvik dubbletter
          const phraseData = phraseDatabase[phraseId];
          if (!phraseData) return;

            // Kontrollera att meningen har den specifika nivån (N1-N4)
            if ((phraseData as any).meningsnivå === level) {
              // Kontrollera att alla ord som hänvisar till meningen är lärda
            const referringWordIds = phraseIndex.phrase_to_words[phraseId];
            if (!referringWordIds) return;
                const allWordsLearned = referringWordIds.every((wordId: string) => learnedWordIds.has(wordId));
            if (!allWordsLearned) return;

            phraseMap.set(phraseId, {
              id: phraseId,
              fras: (phraseData as any).fras,
              meningsnivå: (phraseData as any).meningsnivå,
              video_url: (phraseData as any).video_url
            });
          }
        });
      }
    });

    const available = Array.from(phraseMap.values());
    if (available.length > 0) {
      console.log(`[DEBUG][Exercise][AvailableForLevel] ${level}:`, available.map(p => `${p.id}${p.fras ? ` (${p.fras})` : ''}`));
    }
    return available;
  };

  // Hämta tillgängliga meningar UTAN meningsnivå
  const getAvailablePhrasesWithoutLevel = () => {
    if (!phraseIndex || !phraseDatabase || learnedWords.length === 0) {
      return [] as any[];
    }

    const learnedWordIds = new Set(learnedWords.map(word => word.id));
    const phraseMap = new Map<string, any>();

    learnedWords.forEach(learnedWord => {
      const phraseIds = phraseIndex.word_to_phrases[learnedWord.id];
      if (phraseIds) {
        phraseIds.forEach((phraseId: string) => {
          if (phraseMap.has(phraseId)) return; // undvik dubbletter
          const phraseData = phraseDatabase[phraseId];
          if (!phraseData) return;

          const meningsniva = (phraseData as any).meningsnivå as string | undefined;
          // Endast fraser UTAN nivå (saknar meningsnivå eller inte i N1–N4)
          if (!meningsniva || !['N1','N2','N3','N4'].includes(meningsniva)) {
            const referringWordIds = phraseIndex.phrase_to_words[phraseId];
            if (!referringWordIds) return;
            const allWordsLearned = referringWordIds.every((wordId: string) => learnedWordIds.has(wordId));
            if (!allWordsLearned) return;

            phraseMap.set(phraseId, {
              id: phraseId,
              fras: (phraseData as any).fras,
              meningsnivå: (phraseData as any).meningsnivå || null,
              video_url: (phraseData as any).video_url
            });
          }
        });
      }
    });
    
    return Array.from(phraseMap.values());
  };

  // Progress för UTAN nivå (räknar hur många av de tillgängliga utan nivå som är avklarade)
  const getNoLevelProgress = () => {
    const sentencesProgress = JSON.parse(localStorage.getItem('sentences-progress') || '{}');
    const available = getAvailablePhrasesWithoutLevel();
    const correct = available.filter(p => sentencesProgress[p.id]).length;
    return { correct, total: available.length };
  };

  // Starta meningar-övning för valda nivåer
  const startSentencesExercise = (levels: string[]) => {
    console.log(`[DEBUG] startSentencesExercise called with levels: ${levels.join(', ')}`);

    // Pusha history state för meningar med valda nivåer
    window.history.pushState(
      { 
        page: 0,
        showHelp: false, 
        showKorpus: false, 
        exerciseType: ExerciseType.SENTENCES,
        sentenceLevels: levels
      },
      '',
      window.location.href
    );

    // Samla alla tillgängliga meningar för de valda nivåerna
    const allAvailable: any[] = [];
    levels.forEach((lvl) => {
      if (['N1','N2','N3','N4'].includes(lvl)) {
        allAvailable.push(...getAvailablePhrasesForLevel(lvl as 'N1'|'N2'|'N3'|'N4'));
      } else if (lvl === 'NONE') {
        allAvailable.push(...getAvailablePhrasesWithoutLevel());
      }
    });

    // Undvik dubbletter mellan nivåer
    const uniqueByIdMap = new Map<string, any>();
    allAvailable.forEach(p => uniqueByIdMap.set(p.id, p));
    const uniqueAvailable = Array.from(uniqueByIdMap.values());

    console.log('[DEBUG][Exercise][Start] Tillgängliga (unika) före slumpning:', uniqueAvailable.map(p => `${p.id}${p.fras ? ` (${p.fras})` : ''}`));
    
    // Hämta tidigare progress för att separera felaktiga och korrekta svar
    const sentencesProgress = JSON.parse(localStorage.getItem('sentences-progress') || '{}');
    
    // Separera meningar baserat på tidigare resultat
    const incorrectSentences = uniqueAvailable.filter(p => sentencesProgress[p.id] === false);
    const correctSentences = uniqueAvailable.filter(p => sentencesProgress[p.id] === true);
    const newSentences = uniqueAvailable.filter(p => sentencesProgress[p.id] === undefined);
    
    console.log(`[DEBUG][Exercise][Selection] Felaktiga: ${incorrectSentences.length}, Korrekta: ${correctSentences.length}, Nya: ${newSentences.length}`);
    
    // Välj meningar enligt 75% felaktiga, 25% korrekta (IMPLEMENTERAD 2025-01-25)
    const targetCount = Math.min(10, uniqueAvailable.length);
    const targetIncorrect = Math.floor(targetCount * 0.75);
    const targetCorrect = targetCount - targetIncorrect;
    
    console.log(`[DEBUG][Exercise][Target] Mål: ${targetIncorrect} felaktiga, ${targetCorrect} korrekta (totalt ${targetCount})`);
    
    let selectedSentences: any[] = [];
    
    // Lägg till felaktiga meningar (prioritera dem)
    const shuffledIncorrect = [...incorrectSentences].sort(() => Math.random() - 0.5);
    const selectedIncorrect = shuffledIncorrect.slice(0, targetIncorrect);
    selectedSentences.push(...selectedIncorrect);
    console.log(`[DEBUG][Exercise][Selected] Valda felaktiga (${selectedIncorrect.length}):`, selectedIncorrect.map(p => `${p.id} (${p.fras})`));
    
    // Lägg till korrekta meningar
    const shuffledCorrect = [...correctSentences].sort(() => Math.random() - 0.5);
    const selectedCorrect = shuffledCorrect.slice(0, targetCorrect);
    selectedSentences.push(...selectedCorrect);
    console.log(`[DEBUG][Exercise][Selected] Valda korrekta (${selectedCorrect.length}):`, selectedCorrect.map(p => `${p.id} (${p.fras})`));
    
    // Om vi inte har tillräckligt, fyll på med nya meningar
    const remaining = targetCount - selectedSentences.length;
    if (remaining > 0) {
      const shuffledNew = [...newSentences].sort(() => Math.random() - 0.5);
      const selectedNew = shuffledNew.slice(0, remaining);
      selectedSentences.push(...selectedNew);
      console.log(`[DEBUG][Exercise][Selected] Valda nya (${selectedNew.length}):`, selectedNew.map(p => `${p.id} (${p.fras})`));
    }
    
    // Om vi fortfarande inte har tillräckligt, fyll på med slumpade från alla tillgängliga
    const stillRemaining = targetCount - selectedSentences.length;
    if (stillRemaining > 0) {
      const allRemaining = uniqueAvailable.filter(p => !selectedSentences.some(s => s.id === p.id));
      const shuffledRemaining = [...allRemaining].sort(() => Math.random() - 0.5);
      const selectedRemaining = shuffledRemaining.slice(0, stillRemaining);
      selectedSentences.push(...selectedRemaining);
      console.log(`[DEBUG][Exercise][Selected] Valda från resterande (${selectedRemaining.length}):`, selectedRemaining.map(p => `${p.id} (${p.fras})`));
    }
    
    // Slumpa den slutliga ordningen
    const shuffled = selectedSentences.sort(() => Math.random() - 0.5);
    const selectedPhrases = shuffled.slice(0, 10);

    console.log('[DEBUG][Exercise][Start] Valda (efter slumpning/max10):', selectedPhrases.map(p => `${p.id}${p.fras ? ` (${p.fras})` : ''}`));

    if (selectedPhrases.length === 0) {
      alert(`Inga meningar tillgängliga för nivå ${levels.join(', ')}. Du behöver lära dig fler ord.`);
      return;
    }

    setSelectedSentenceLevels(levels);
    setSentencesWords(selectedPhrases);
    setSelectedExerciseType(ExerciseType.SENTENCES);
  };

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
    return (theme: any) => ({
      cursor: 'pointer' as const,
      border: '1px solid',
      borderColor: isCompleted
        ? 'success.main'
        : (theme.palette.mode === 'dark' ? 'divider' : 'primary.main'),
      borderRadius: 2,
      backgroundColor: isCompleted
        ? (theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e8')
        : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.palette.background.paper),
      color: isCompleted
        ? (theme.palette.mode === 'dark' ? 'success.light' : 'success.main')
        : (theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main'),
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: { xs: 50, sm: 60 },
      p: { xs: 0.5, sm: 1 },
      '&:hover': {
        transform: 'translateY(-2px)',
        transition: 'transform 0.2s',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        backgroundColor: isCompleted
          ? (theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.25)' : '#d4edda')
          : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'action.hover')
      }
    });
  };

  // Återställ övningssidan när komponenten mountas (när användaren navigerar tillbaka)
  useEffect(() => {
    setSelectedExerciseType(null);
    setCurrentWordIndex(0);
    setShowResults(false);
    setResults([]);
  }, []);

  // Lyssna på browser back/forward för att återställa till övningsval
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Om state indikerar att vi är på övningssidan men utan vald övning
      if (event.state?.exerciseType === null || !event.state?.exerciseType) {
        setSelectedExerciseType(null);
        setSpellingWords([]);
        setSentencesWords([]);
        setCurrentWordIndex(0);
        setShowResults(false);
        setResults([]);
      } else if (event.state?.exerciseType === ExerciseType.SPELLING && !event.state?.spellingRange) {
        // Tillbaka till bokstavering-val (utan specifikt intervall)
        setSpellingWords([]);
        setCurrentWordIndex(0);
        setShowResults(false);
        setResults([]);
      } else if (event.state?.exerciseType === ExerciseType.SENTENCES && !event.state?.sentenceLevels) {
        // Tillbaka till meningar-val (utan specifika nivåer)
        setSentencesWords([]);
        setCurrentWordIndex(0);
        setShowResults(false);
        setResults([]);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
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

  // State för att hålla statisk lista av ord under hela övningen
  const [staticPracticeWords, setStaticPracticeWords] = useState<any[]>([]);
  // State för att hålla koll på vilka ord som faktiskt flyttades till level 2
  const [wordsMovedToLearned, setWordsMovedToLearned] = useState<Set<string>>(new Set());

  // Hjälpfunktion för att hämta prioritet för ett ord från wordLists
  // Memoize getAllWordLists to prevent infinite loops
  const allWordLists = useMemo(() => {
    return getAllWordLists(wordDatabase);
  }, [wordDatabase]);

  const getWordPriority = (wordId: string): number => {
    for (const list of allWordLists) {
      if (list.type === 'predefined' && list.wordIds.includes(wordId)) {
        return list.priority;
      }
    }
    return 999; // Default hög prioritet för ord som inte finns i någon lista
  };

  // Beräkna ord för övning med ny logik: senast övade först, sedan prioritet från wordLists
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
      listDifficulty: getWordListDifficulty(wordId), // Lägg till svårighetsgrad från wordLists.ts
      priority: getWordPriority(wordId) // Lägg till prioritet från wordLists.ts
    }));

    // Om learningWordsOnly är aktiverat, filtrera bara ord som användaren vill lära sig
    let filteredWords = wordsWithProgress;
    if (learningWordsOnly) {
      filteredWords = wordsWithProgress.filter(word => word.progress.level === 1);
    }

    // Hämta ord från "att lära mig" (nivå 1) sorterade efter senast övade först, sedan prioritet
    const learningWords = filteredWords.filter(word => word.progress.level === 1);
    
    // Sortera först efter senast övade (nyligen övade först), sedan efter prioritet från wordLists
    const sortedLearningWords = learningWords.sort((a, b) => {
      // Först: Sortera efter senast övade (nyligen övade först)
      const lastPracticedA = new Date(a.progress.stats.lastPracticed).getTime();
      const lastPracticedB = new Date(b.progress.stats.lastPracticed).getTime();
      
      // Hantera NaN (tom sträng) genom att sätta dem till 0 (aldrig övade)
      const timeA = isNaN(lastPracticedA) ? 0 : lastPracticedA;
      const timeB = isNaN(lastPracticedB) ? 0 : lastPracticedB;
      
      if (timeA !== timeB) {
        return timeB - timeA; // Nyligen övade först (högre timestamp först)
      }
      
      // Om samma övningstid, sortera efter prioritet från wordLists (lägre prioritet = högre prioritet)
      return a.priority - b.priority;
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
    
    // Ta bort duplicerade ord baserat på ID (första steget)
    const uniqueWordsById = combinedWords.filter((word, index, self) => 
      index === self.findIndex(w => w.id === word.id)
    );
    
       // Gruppbaserad deduplication - ta bort ord med samma betydelse
       const uniqueWordsByMeaning = createWordGroups(uniqueWordsById, wordDatabase, wordIndex);
    
    console.log(`[DEBUG] Unique words after ID deduplication: ${uniqueWordsById.length}`);
    console.log(`[DEBUG] Unique words after meaning deduplication: ${uniqueWordsByMeaning.length}`);
    console.log(`[DEBUG] Words for exercise:`, uniqueWordsByMeaning.map(w => `${w.ord} (ID: ${w.id})`));
    
    const shuffledCombinedWords = shuffleArrayWithSeed(uniqueWordsByMeaning, seed);
    
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
      },
      priority: getWordPriority(wordId) // Lägg till prioritet från wordLists.ts
    }));

    // Hämta ord som användaren vill lära sig (nivå 1)
    const learningWords = wordsWithProgress.filter(word => word.progress.level === 1);
    
    // Hämta ord som användaren har lärt sig (nivå 2)
    const learnedWords = wordsWithProgress.filter(word => word.progress.level === 2);
    
    // Om vi har minst 10 ord från "att lära mig", använd bara dem
    if (learningWords.length >= 10) {
      return learningWords
      .sort((a, b) => {
          // Först: Sortera efter senast övade (nyligen övade först)
          const lastPracticedA = new Date(a.progress.stats.lastPracticed).getTime();
          const lastPracticedB = new Date(b.progress.stats.lastPracticed).getTime();
          
          // Hantera NaN (tom sträng) genom att sätta dem till 0 (aldrig övade)
          const timeA = isNaN(lastPracticedA) ? 0 : lastPracticedA;
          const timeB = isNaN(lastPracticedB) ? 0 : lastPracticedB;
          
          if (timeA !== timeB) {
            return timeB - timeA; // Nyligen övade först (högre timestamp först)
          }
          
          // Om samma övningstid, sortera efter prioritet från wordLists (lägre prioritet = högre prioritet)
          return a.priority - b.priority;
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
        
          // Sedan efter senast övade (nyligen övade först)
        const lastPracticedA = new Date(a.progress.stats.lastPracticed).getTime();
        const lastPracticedB = new Date(b.progress.stats.lastPracticed).getTime();
          
          // Hantera NaN (tom sträng) genom att sätta dem till 0 (aldrig övade)
          const timeA = isNaN(lastPracticedA) ? 0 : lastPracticedA;
          const timeB = isNaN(lastPracticedB) ? 0 : lastPracticedB;
          
          if (timeA !== timeB) {
            return timeB - timeA; // Nyligen övade först (högre timestamp först)
          }
          
          // Om samma övningstid, sortera efter prioritet från wordLists (lägre prioritet = högre prioritet)
          return a.priority - b.priority;
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
    
    // Pusha history state för övningsvalet
    window.history.pushState(
      { 
        page: 0, // Övningssidan är alltid page 0
        showHelp: false, 
        showKorpus: false, 
        exerciseType: exerciseType 
      },
      '',
      window.location.href
    );

    setSelectedExerciseType(exerciseType);
    setCurrentWordIndex(0);
    setResults([]);
    setShowResults(false);
    setFlashcardResults(new Array(10).fill(null)); // Återställ progress-baren
    setQuizResults(new Array(10).fill(null)); // Återställ quiz progress-baren
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
                         selectedExerciseType === ExerciseType.QUIZ ? quizWords : 
                         selectedExerciseType === ExerciseType.SENTENCES ? sentencesWords : staticPracticeWords;
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

    // Uppdatera flashcard results för progress-baren
    if (selectedExerciseType === ExerciseType.FLASHCARDS) {
      setFlashcardResults(prev => {
        const newResults = [...prev];
        newResults[currentWordIndex] = isCorrect;
        return newResults;
      });
    }
    
    // Uppdatera quiz results för progress-baren
    if (selectedExerciseType === ExerciseType.QUIZ) {
      setQuizResults(prev => {
        const newResults = [...prev];
        newResults[currentWordIndex] = isCorrect;
        return newResults;
      });
    }
    
    // Spara inte progress för bokstavering-övningar
    if (selectedExerciseType !== ExerciseType.SPELLING) {
      // Kontrollera om ordet kommer att flyttas till level 2
      const currentProgress = wordProgress[currentWord.id];
      const currentPoints = currentProgress?.points || 0;
      const currentLevel = currentProgress?.level || 0;
      const willMoveToLevel2 = isCorrect && currentPoints + 1 >= 5 && currentLevel < 2;
      
      console.log(`[DEBUG] Word progress check: ${currentWord.ord} (ID: ${currentWord.id})`);
      console.log(`[DEBUG] - Current points: ${currentPoints}, Current level: ${currentLevel}`);
      console.log(`[DEBUG] - isCorrect: ${isCorrect}, willMoveToLevel2: ${willMoveToLevel2}`);
      
       markWordResult(currentWord.id, isCorrect, wordDatabase, wordIndex);
      
      // Om ordet flyttades till level 2, spåra det
      if (willMoveToLevel2) {
        console.log(`[DEBUG] Adding ${currentWord.ord} (ID: ${currentWord.id}) to wordsMovedToLearned`);
        setWordsMovedToLearned(prev => new Set(prev).add(currentWord.id));
      } else {
        console.log(`[DEBUG] NOT adding ${currentWord.ord} (ID: ${currentWord.id}) to wordsMovedToLearned`);
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

  // Funktion som körs när användaren klickar på "Placera i lärda ord"
  const handleMoveToLearned = () => {
    const currentWords = selectedExerciseType === ExerciseType.SPELLING ? spellingWords : 
                         selectedExerciseType === ExerciseType.QUIZ ? quizWords : 
                         selectedExerciseType === ExerciseType.SENTENCES ? sentencesWords : staticPracticeWords;
    const currentWord = currentWords[currentWordIndex];
    if (!currentWord) return;

    console.log(`[DEBUG] handleMoveToLearned: Moving ${currentWord.ord} (ID: ${currentWord.id}) to learned level`);

         // Använd gruppinlärning - markera ordet och alla synonymer som lärda
         markWordGroupAsLearned(currentWord.id, wordDatabase, wordIndex);
    
    // Lägg till i wordsMovedToLearned för att visa i resultatvyn
    setWordsMovedToLearned(prev => new Set(prev).add(currentWord.id));
    
    // Spara resultat som korrekt
    const result: ExerciseResult = {
      wordId: currentWord.id,
      isCorrect: true,
      exerciseType: selectedExerciseType!,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => [...prev, result]);

    // Uppdatera flashcard results för progress-baren (Placera i lärda = rätt)
    if (selectedExerciseType === ExerciseType.FLASHCARDS) {
      setFlashcardResults(prev => {
        const newResults = [...prev];
        newResults[currentWordIndex] = true; // Placera i lärda = rätt
        return newResults;
      });
    }
    
    // Uppdatera quiz results för progress-baren (Placera i lärda = rätt)
    if (selectedExerciseType === ExerciseType.QUIZ) {
      setQuizResults(prev => {
        const newResults = [...prev];
        newResults[currentWordIndex] = true; // Placera i lärda = rätt
        return newResults;
      });
    }

    // Gå till nästa ord eller visa resultat
    if (currentWordIndex < currentWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  // Funktion som körs när användaren hoppar över en övning
  const handleSkip = () => {
    const currentWords = selectedExerciseType === ExerciseType.SPELLING ? spellingWords : 
                         selectedExerciseType === ExerciseType.QUIZ ? quizWords : 
                         selectedExerciseType === ExerciseType.SENTENCES ? sentencesWords : staticPracticeWords;
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
    // Gå tillbaka i history för att återställa till övningsval
    window.history.back();
  };

  // Funktion för att starta bokstavering-övning
  const startSpellingExercise = (minLen: number, maxLen: number) => {
    console.log(`[DEBUG] startSpellingExercise called with range: ${minLen}-${maxLen}`);
    
    // Pusha history state för bokstavering med valt intervall
    window.history.pushState(
      { 
        page: 0,
        showHelp: false, 
        showKorpus: false, 
        exerciseType: ExerciseType.SPELLING,
        spellingRange: { minLen, maxLen }
      },
      '',
      window.location.href
    );
    
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
    } else if ((selectedExerciseType as ExerciseType) === ExerciseType.SENTENCES) {
      return sentencesWords[currentWordIndex];
    } else {
      return staticPracticeWords[currentWordIndex];
    }
  }, [selectedExerciseType, currentWordIndex, spellingWords, quizWords, sentencesWords, staticPracticeWords]);

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
        suggestion: 'Överväg att köra start-guiden för att lägga till fler ord, eller lägg till ord från ordlistor.'
      };
    }
    
    return { isValid: true, showWarning: false };
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
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
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
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
      </Box>
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
      <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        
        {/* Modern rutnät-layout */}
        {/* Infotext för bokstavering */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Bokstavering
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
            Välj hastighet och ordlängd för att träna bokstavering.
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}>
          {/* Klickbart rutnät (3×5) - Hårdkodade rutor */}
          <Box sx={(theme) => ({ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(5, 1fr)',
            gap: { xs: 1, sm: 2 }, // Mindre gap på mobil, större på desktop
            p: { xs: 1, sm: 2 }, // Mindre padding på mobil
            border: '2px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'divider',
            borderRadius: 3,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme.palette.background.paper,
            maxWidth: '600px',
            width: '100%',
            minHeight: { xs: '400px', sm: '500px' } // Mindre höjd på mobil
          })}>
            {/* Rad 1: 2-3 bokstäver */}
            <Box sx={getSpellingBoxStyle(0.5, 2, 3)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.5x hastighet, 2-3 bokstäver'); savePlaybackSpeed(0.5); saveSelectedInterval(0); startSpellingExercise(2, 3); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>0.5x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>2-3</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 2 && word.ord.length <= 3).length} ord</Typography>
          </Box>
            <Box sx={getSpellingBoxStyle(0.75, 2, 3)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 0.75x hastighet, 2-3 bokstäver'); savePlaybackSpeed(0.75); saveSelectedInterval(0); startSpellingExercise(2, 3); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>0.75x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>2-3</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{getAllSpellingWords.filter((word: any) => word.ord.length >= 2 && word.ord.length <= 3).length} ord</Typography>
            </Box>
            <Box sx={getSpellingBoxStyle(1.0, 2, 3)} onClick={() => { console.log('[DEBUG] Bokstavering valt: 1.0x hastighet, 2-3 bokstäver'); savePlaybackSpeed(1.0); saveSelectedInterval(0); startSpellingExercise(2, 3); }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>1.0x</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>2-3</Typography>
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


        {/* Information om källa och licens */}
        <Box sx={{ mt: 4, p: 2, backgroundColor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
            Tack till Stockholms Universitet och {' '}
            <Link href="https://teckensprakslexikon.su.se/verktyg/bokstaveras" target="_blank" rel="noopener noreferrer">
              teckensprakslexikon.su.se
            </Link>
            {' '}som gör detta material tillgängligt. Utan det skulle TSP Skolan inte vara möjligt.
            <br />
            Materialet används under{' '}
            <Link href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.sv" target="_blank" rel="noopener noreferrer">
              Creative Commons-licens
            </Link>
            {' '}med stor tacksamhet.
          </Typography>
        </Box>
      </Container>
    </Box>
    );
  }

  // Visa övningstyp-val om ingen är vald
  if (!selectedExerciseType) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Header med meny-knapp */}
          <Box sx={{ position: 'relative', textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
              TSP Skolan
            </Typography>
            {/* Meny-knapp högst upp till höger */}
            {onOpenMenu && (
              <IconButton
                onClick={onOpenMenu}
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'primary.main'
                }}
              >
                <Menu />
              </IconButton>
            )}
          </Box>

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
              <Typography
                component="span"
                sx={{
                  display: 'inline-block',
                  fontSize: 48,
                  lineHeight: 1,
                  mb: 2
                }}
              >
                🙌
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Teckna själv
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
                  Se tecknet
                </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  Se tecknet och gissa ord från flera alternativ.
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
                  Se bokstavering och gissa vilket ord som bokstaveras.
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
                Se meningar baserat på dina lärda ord och se om du förstår.
                </Typography>
              </CardContent>
            </Card>

          {/* Korpus */}
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
            onClick={() => {
              if (onShowKorpus) {
                onShowKorpus();
              }
            }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography
                component="span"
                sx={{
                  display: 'inline-block',
                  fontSize: 40,
                  lineHeight: 1,
                  mb: 2
                }}
              >
                🎥
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Berättelser
                </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Titta på berättelser med annoteringar.
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
              // En lista är bara avklarad om den har ord OCH alla ord är lärda OCH den inte är av typen "fortsattning"
              const allLearned = allWordsInList.length > 0 && allWordsInList.every((wordId: string) => wordProgress[wordId]?.level === 2);
              const isNotFortsattning = wordLists.some((wordList: any) => wordList.difficulty !== 'fortsattning');
              // console.log(`[DEBUG] List ${listName}: ${allWordsInList.length} words, all learned: ${allLearned}, not fortsattning: ${isNotFortsattning}`);
              return allLearned && isNotFortsattning;
            }).length;
            
            // Räkna avklarade bokstavering-rutor
            const completedSpellingBoxesCount = completedSpellingBoxes.length;
             
            // Räkna totalt antal ordlistor (unika namn) - exkludera tomma listor och "fortsattning" nivån
            const totalLists = Object.entries(wordListGroups).filter(([listName, wordLists]: [string, any]) => {
              const allWordsInList = wordLists.flatMap((wordList: any) => wordList.wordIds || []);
              const isNotFortsattning = wordLists.some((wordList: any) => wordList.difficulty !== 'fortsattning');
              return allWordsInList.length > 0 && isNotFortsattning; // Bara räkna listor som har ord och inte är "fortsattning"
            }).length;
            
            console.log(`[DEBUG] Completed lists: ${completedLists}, Total lists: ${totalLists}`);
             
             return (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 3 }}>
                {/* Lärda */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'success.50',
                  border: '1px solid',
                  borderColor: 'success.200',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    backgroundColor: 'success.100'
                  }
                }}
                onClick={() => handleExerciseTypeSelect(ExerciseType.FLASHCARDS)}
                >
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
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    backgroundColor: 'info.100'
                  }
                }}
                onClick={() => {
                  // Navigera till ordlistor-sidan (index 1)
                  window.dispatchEvent(new CustomEvent('navigateToPage', { detail: 1 }));
                }}
                >
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
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    backgroundColor: 'warning.100'
                  }
                }}
                onClick={() => handleExerciseTypeSelect(ExerciseType.SPELLING)}
                >
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 1 }}>
                    {completedSpellingBoxesCount}/15
                  </Typography>
               <Typography variant="body2" color="text.secondary">
                    Bokstavering
               </Typography>
                 </Box>

                {/* Meningar */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'secondary.50',
                  border: '1px solid',
                  borderColor: 'secondary.200',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    backgroundColor: 'secondary.100'
                  }
                }}
                onClick={() => handleExerciseTypeSelect(ExerciseType.SENTENCES)}
                >
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 1 }}>
                    {Object.values(getSentencesProgress).reduce((sum, level) => sum + level.correct, 0)}/{Object.values(getSentencesProgress).reduce((sum, level) => sum + level.total, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                    Meningar
                    </Typography>
                </Box>
               </Box>
             );
           })()}
        </Paper>

         {/* Start-guide knapp */}
         <Paper sx={{ mt: 3, p: 3 }}>
           <Typography variant="h6" gutterBottom>
             Startguiden
                    </Typography>
           <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
             Använd startguiden för att komma igång.  
             <br></br>
             OBS Om du kör startgången en andra gång kommer mycket av din statistik att nollställas.
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

         {/* Information om källa och licens */}
         <Box sx={{ mt: 4, p: 2, backgroundColor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
           <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
             Tack till Stockholms Universitet och{' '}
             <Link href="https://teckensprakslexikon.su.se" target="_blank" rel="noopener noreferrer">
               teckensprakslexikon.su.se
             </Link>
             {' '}som gör detta material tillgängligt. Utan det skulle TSP Skolan inte vara möjligt.
             <br />
             Materialet används under{' '}
             <Link href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.sv" target="_blank" rel="noopener noreferrer">
               Creative Commons-licens
             </Link>
             {' '}med stor tacksamhet.
           </Typography>
         </Box>
       </Container>
       </Box>
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
            
            {selectedExerciseType !== ExerciseType.SPELLING && (
              <Box sx={{ mt: 3 }}>
                <List>
                  {results.map((result, index) => {
                    // För meningar-övning, visa meningen istället för ordet
                    if (result.exerciseType === ExerciseType.SENTENCES) {
                      // Hitta meningen från sentencesWords baserat på wordId (som är phraseId för meningar)
                      const phrase = sentencesWords.find(p => p.id === result.wordId);
                      console.log(`[DEBUG] Result ${index}: phraseId=${result.wordId}, phrase=${phrase?.fras}, isCorrect=${result.isCorrect}`);
                      return (
                        <ListItem key={`${result.wordId}-${index}`}>
                          <ListItemText
                              primary={phrase?.fras || `Okänd mening (ID: ${result.wordId})`}
                              secondary={phrase?.meningsnivå ? `Nivå ${phrase.meningsnivå}` : ""}
                          />
                          {result.isCorrect ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Cancel color="error" />
                          )}
                        </ListItem>
                      );
                    } else {
                      // För andra övningar, visa ordet som vanligt
                      const word = wordDatabase[result.wordId];
                      const isMovedToLearned = wordsMovedToLearned.has(result.wordId);
                      console.log(`[DEBUG] Result ${index}: wordId=${result.wordId}, word=${word?.ord}, isCorrect=${result.isCorrect}`);
                      console.log(`[DEBUG] - wordsMovedToLearned has ${result.wordId}: ${isMovedToLearned}`);
                      console.log(`[DEBUG] - wordsMovedToLearned contents:`, Array.from(wordsMovedToLearned));
                      return (
                        <ListItem key={`${result.wordId}-${index}`}>
                          <ListItemText
                            primary={word?.ord || `Okänt ord (ID: ${result.wordId})`}
                            secondary={isMovedToLearned ? "Flyttad till lärda ord!" : ""}
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
                    }
                  })}
                </List>
              </Box>
            )}
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
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header med progress */}
        <Box sx={{ mb: 0.3 }}>
          {/* Visa rubrik bara för andra övningstyper än flashcards, bokstavering, meningar och quiz */}
          {selectedExerciseType !== ExerciseType.FLASHCARDS && selectedExerciseType !== ExerciseType.SPELLING && selectedExerciseType !== ExerciseType.SENTENCES && selectedExerciseType !== ExerciseType.QUIZ && (
          <Typography variant="h4" gutterBottom align="center">
            Övning
          </Typography>
          )}
          
          {/* Visa progress bara för andra övningstyper än meningar */}
          {selectedExerciseType !== ExerciseType.SENTENCES && (
            <>
              
              {/* Progress-mätare */}
              {(selectedExerciseType === ExerciseType.FLASHCARDS || selectedExerciseType === ExerciseType.QUIZ) ? (
                // Uppdelad progress för flashcards och quiz (10 korta horisontella streck)
                <Box sx={{ mb: 0.1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1 }
                  }}>
                    {Array.from({ length: 10 }, (_, index) => {
                      const result = selectedExerciseType === ExerciseType.FLASHCARDS ? flashcardResults[index] : quizResults[index];
                      let backgroundColor = 'rgba(25, 118, 210, 0.1)';
                      if (result === true) backgroundColor = 'success.main';
                      else if (result === false) backgroundColor = 'error.main';
                      return (
                        <Box key={index} sx={{ width: { xs: 20, sm: 24 }, height: 4, backgroundColor, transition: 'background-color 0.3s ease', borderRadius: 2 }} />
                      );
                    })}
                  </Box>
                </Box>
              ) : (
                // Använd samma segmenterade stil även för Bokstavering och Meningar
                <Box sx={{ mb: 0.1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                    {(() => {
                      const isSpelling = (selectedExerciseType as any) === ExerciseType.SPELLING;
                      const items = isSpelling ? spellingWords : sentencesWords;
                      const currentIndex = currentWordIndex;
                      return items.map((item: any, i: number) => {
                        const result = results.find(r => r.wordId === item.id && r.exerciseType === (isSpelling ? ExerciseType.SPELLING : ExerciseType.SENTENCES));
                        let backgroundColor: any = 'rgba(25, 118, 210, 0.1)';
                        if (result) {
                          backgroundColor = result.isCorrect ? 'success.main' : 'error.main';
                        } else if (i < currentIndex) {
                          backgroundColor = 'primary.main';
                        }
                        return (
                          <Box key={item.id || i} sx={{ width: { xs: 12, sm: 14 }, height: 4, borderRadius: 2, backgroundColor }} />
                        );
                      });
                    })()}
                  </Box>
                </Box>
              )}
            </>
          )}

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
          onMoveToLearned={handleMoveToLearned}
          wordIndex={wordIndex}
          wordDatabase={wordDatabase}
        />
              
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
          <MultipleChoiceExercise
            key={currentWord.id} // Tvingar React att återställa komponenten när ordet ändras
            word={currentWord}
            allWords={quizWords}
            onResult={handleExerciseResult}
            onSkip={handleSkip}
            onMoveToLearned={handleMoveToLearned}
            wordIndex={wordIndex}
            wordDatabase={wordDatabase}
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
            {sentencesWords.length > 0 ? (
              <SentencesPracticeExercise
                learnedWords={learnedWords}
                phraseDatabase={phraseDatabase}
                wordDatabase={wordDatabase}
                onResult={handleExerciseResult}
                onSkip={handleSkip}
                selectedLevels={selectedSentenceLevels}
                sentencesWords={sentencesWords}
              />
            ) : learnedWords.length === 0 ? (
              <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h5" gutterBottom color="text.secondary">
                    Inga meningar att öva med
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Gör övningarna 'Teckna själv' eller 'Se tecknet' för att lära dig ord innan du går över till meningar.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Infotext för meningar */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Meningar
                  </Typography>
                </Box>


                {/* Rutnät för nivåval */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 4
                }}>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: { xs: 2, sm: 3 },
                    maxWidth: '400px',
                    width: '100%'
                  }}>
                    {/* Nivå 1 */}
                    <Box 
                      sx={{
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50',
                        color: 'primary.main',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: 80, sm: 100 },
                        p: { xs: 1, sm: 2 },
                        borderRadius: 2,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          transition: 'transform 0.2s',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          backgroundColor: 'primary.100'
                        }
                      }}
                      onClick={() => startSentencesExercise(['N1'])}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Nivå 1
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                        <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {getSentencesProgress.N1.correct}
                        </Box>
                        /{getAvailablePhrasesForLevel('N1').length} meningar
                      </Typography>
                    </Box>

                    {/* Nivå 2 */}
                    <Box 
                      sx={{
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50',
                        color: 'primary.main',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: 80, sm: 100 },
                        p: { xs: 1, sm: 2 },
                        borderRadius: 2,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          transition: 'transform 0.2s',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          backgroundColor: 'primary.100'
                        }
                      }}
                      onClick={() => startSentencesExercise(['N2'])}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Nivå 2
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                        <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {getSentencesProgress.N2.correct}
                        </Box>
                          /{getAvailablePhrasesForLevel('N2').length} meningar
                      </Typography>
                    </Box>

                    {/* Nivå 3 */}
                    <Box 
                      sx={{
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50',
                        color: 'primary.main',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: 80, sm: 100 },
                        p: { xs: 1, sm: 2 },
                        borderRadius: 2,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          transition: 'transform 0.2s',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          backgroundColor: 'primary.100'
                        }
                      }}
                      onClick={() => startSentencesExercise(['N3'])}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Nivå 3
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                        <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {getSentencesProgress.N3.correct}
                        </Box>
                          /{getAvailablePhrasesForLevel('N3').length} meningar
                      </Typography>
                    </Box>

                    {/* Nivå 4 */}
                    <Box 
                      sx={{
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50',
                        color: 'primary.main',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: 80, sm: 100 },
                        p: { xs: 1, sm: 2 },
                        borderRadius: 2,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          transition: 'transform 0.2s',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          backgroundColor: 'primary.100'
                        }
                      }}
                      onClick={() => startSentencesExercise(['N4'])}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Nivå 4
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                        <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {getSentencesProgress.N4.correct}
                        </Box>
                          /{getAvailablePhrasesForLevel('N4').length} meningar
                      </Typography>
                    </Box>

                      {/* Utan nivå */}
                      <Box 
                        sx={{
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.50',
                          color: 'primary.main',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: { xs: 80, sm: 100 },
                          p: { xs: 1, sm: 2 },
                          borderRadius: 2,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            transition: 'transform 0.2s',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            backgroundColor: 'primary.100'
                          }
                        }}
                        onClick={() => startSentencesExercise(['NONE'])}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                          Utan nivå
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                          <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                            {getNoLevelProgress().correct}
                          </Box>
                          /{getNoLevelProgress().total} meningar
                        </Typography>
                      </Box>
                  </Box>
                </Box>

                {/* Top 3 ord att lära sig */}
                  {top3Words.length > 0 && (
                  <Box sx={{ mb: 4, p: 3, backgroundColor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200', maxWidth: '600px', mx: 'auto' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {learnedWords.length === 0 
                        ? "Dessa ord finns i flest meningar och är bra att börja med:"
                        : "Dessa ord skulle lägga till flest nya meningar, klicka på ordet för att lägga det i listan över ord du vill lära dig:"
                      }
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {top3Words.map((wordData, index) => {
                        const isInLearningList = isWordInLearningList(wordData.wordId);
                        return (
                          <Chip 
                            key={wordData.wordId}
                              label={`${wordData.word} (+${buildPhraseDetailsForWord(wordData.wordId).filter(d => d.meningsnivå && ['N1','N2','N3','N4'].includes(d.meningsnivå)).length})`}
                              color="primary"
                              variant="filled"
                            sx={{ 
                              fontWeight: 600,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: isInLearningList ? 'warning.dark' : 'primary.dark',
                                transform: 'scale(1.05)',
                                transition: 'all 0.2s ease-in-out'
                              }
                            }}
                            onClick={() => addWordToLearningList(wordData.wordId)}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </>
        )}

        {/* Information om källa och licens */}
        <Box sx={{ mt: 4, p: 2, backgroundColor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
            Tack till Stockholms Universitet och{' '}
            <Link href="https://teckensprakslexikon.su.se/verktyg/meningsnivaer" target="_blank" rel="noopener noreferrer">
              teckensprakslexikon.su.se
            </Link>
            {' '}som gör detta material tillgängligt. Utan det skulle TSP Skolan inte vara möjligt.
            <br />
            Materialet används under{' '}
            <Link href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.sv" target="_blank" rel="noopener noreferrer">
              Creative Commons-licens
            </Link>
            {' '}med stor tacksamhet.
          </Typography>
        </Box>

      </Container>
    </Box>
  );
};

export default OvningPage;

