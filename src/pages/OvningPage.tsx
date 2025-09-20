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
      <CardContent sx={{ textAlign: 'center', p: 1, border: 'none' }}>
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
        <Typography variant="body2" color="text.secondary">
          {word.ord} - Variant {currentVariantIndex + 1} av {variants.length}
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
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
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
            <Box sx={{ mb: 0.3 }}>
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
            {word.beskrivning && (
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.7em' }}>
                ({word.beskrivning})
          </Typography>
            )}
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

  // Beräkna vilka ord som skulle göra flest meningar kompletta
  const getMostCommonUnlearnedWords = () => {
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
          if (phraseData) {
            // Filtrera baserat på inställningen för meningsnivå
            if (sentencesOnlyWithLevel && !phraseData.meningsnivå) {
              return; // Hoppa över meningar utan meningsnivå
            }

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
  };

  const mostCommonUnlearnedWords = getMostCommonUnlearnedWords();

  // Uppdatera sortering när sortBy eller sortAscending ändras
  useEffect(() => {
    // Trigger re-render när sortering ändras
  }, [sortBy, sortAscending]);

  if (isLoadingPhrases) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
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
      <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
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

        {/* Vanligaste "andra" ord */}
        {mostCommonUnlearnedWords.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2, mt: 3, color: 'info.main', fontWeight: 600 }}>
              Bästa ord att lära sig härnäst
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Dessa ord skulle göra flest meningar kompletta om du lärde dig dem
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
              {mostCommonUnlearnedWords.map((item, index) => (
                <Box
                  key={item.wordId}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'info.main',
                    borderRadius: 2,
                    backgroundColor: 'info.50',
                    minWidth: 120
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                    #{index + 1}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {item.word}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.count} komplett{item.count !== 1 ? 'a' : ''} mening{item.count !== 1 ? 'ar' : ''}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
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
      console.log('[DEBUG] Current phrase video URL (processed):', getVideoUrl(currentPhrase.video_url));
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
      <Card sx={{ p: 3, textAlign: 'center' }}>
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
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Laddar meningar...
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      {/* Progress indikator */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Meningar-övning
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mening {currentPhraseIndex + 1} av {sentencesWords.length}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(currentPhraseIndex + 1) / sentencesWords.length * 100}
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Video */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
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
            Avslöja mening
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
            sx={{ minWidth: 120 }}
          >
            Hade rätt
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={handleIncorrect}
            sx={{ minWidth: 120 }}
          >
            Hade fel
          </Button>
        </Box>
      )}

    </Card>
  );
};

// Duplicerad komponent för Meningar-övning - samma som ursprungliga SentencesExercise
const SentencesExerciseDuplicate: React.FC<{
  learnedWords: any[];
  phraseDatabase: any;
  wordDatabase: any;
  onResult: (isCorrect: boolean) => void;
  onSkip: () => void;
}> = ({ learnedWords, phraseDatabase, wordDatabase, onResult, onSkip }) => {
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
              // Endast meningar med meningsnivå
              if (!phraseData.meningsnivå) {
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

  // Beräkna vilka ord som skulle göra flest meningar kompletta
  const getMostCommonUnlearnedWords = () => {
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
          if (phraseData) {
            // Endast meningar med meningsnivå
            if (!phraseData.meningsnivå) {
              return; // Hoppa över meningar utan meningsnivå
            }

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
  };

  const mostCommonUnlearnedWords = getMostCommonUnlearnedWords();

  // Uppdatera sortering när sortBy eller sortAscending ändras
  useEffect(() => {
    // Trigger re-render när sortering ändras
  }, [sortBy, sortAscending]);

  if (isLoadingPhrases) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
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
      <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="secondary">
            Meningar (Duplicerad)
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Inga meningar hittades för dina lärda ord.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lär dig fler ord för att se fler meningar.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const renderPhraseList = (phrases: any[], title: string, color: string) => {
    if (phrases.length === 0) return null;

    return (
      <>
        <Typography variant="h5" sx={{ mb: 2, mt: 3, color: color, fontWeight: 600 }}>
          {title} ({phrases.length})
        </Typography>
        <List>
          {phrases.map((phrase, index) => (
            <React.Fragment key={phrase.id}>
              <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}>
                {/* Rad 1: Fras-ID och meningsnivå */}
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
                      color={phrase.meningsnivå === 'N1' ? 'success' : phrase.meningsnivå === 'N2' ? 'warning' : 'error'}
                    />
                  )}
                  <Typography variant="body1" sx={{ fontWeight: 500, flex: 1, minWidth: 0 }}>
                    {phrase.fras}
                  </Typography>
                </Box>
                
                {/* Rad 2: Mina lärda ord som hänvisar till frasen */}
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Mina lärda ord:
                  </Typography>
                  {phrase.learnedWords.map((word: any) => (
                    <Chip 
                      key={word.id}
                      label={word.ord} 
                      size="small" 
                      variant="outlined"
                      color="success"
                    />
                  ))}
                </Box>
                
                {/* Rad 3: Ord som hänvisar till frasen som jag inte har i lärda */}
                {phrase.unlearnedWords.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Andra ord:
                    </Typography>
                    {phrase.unlearnedWords.map((word: any) => (
                      <Chip 
                        key={word.id}
                        label={word.ord} 
                        size="small" 
                        variant="outlined"
                        color="error"
                      />
                    ))}
                  </Box>
                )}
              </ListItem>
              {index < phrases.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </>
    );
  };

  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="secondary">
          Meningar (Duplicerad)
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          {completePhrases.length + almostCompletePhrases.length} meningar hittades för dina lärda ord
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
                setSortAscending(true);
              }
            }}
            sx={{ minWidth: 100 }}
          >
            Antal lärda {sortBy === 'learned' ? (sortAscending ? '↑' : '↓') : ''}
          </Button>
          <Button
            variant={sortBy === 'unlearned' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => {
              if (sortBy === 'unlearned') {
                setSortAscending(!sortAscending);
              } else {
                setSortBy('unlearned');
                setSortAscending(true);
              }
            }}
            sx={{ minWidth: 100 }}
          >
            Antal andra {sortBy === 'unlearned' ? (sortAscending ? '↑' : '↓') : ''}
          </Button>
        </Box>

        {/* Kompletta meningar */}
        {renderPhraseList(completePhrases, 'Kompletta meningar (0 andra ord)', 'success.main')}

        {/* Nästan kompletta meningar */}
        {renderPhraseList(almostCompletePhrases, 'Nästan kompletta meningar (1 annat ord)', 'warning.main')}
      </CardContent>
    </Card>
  );
};

// Huvudkomponent för övningssidan
const OvningPage: React.FC = () => {
  const { wordDatabase, phraseDatabase, wordIndex, isLoading, error } = useDatabase();
  const { getWordsForPractice, markWordResult, setWordLevel, wordProgress, createWordGroups, markWordGroupAsLearned } = useWordProgress();
  
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

    // Använd samma logik som getAvailablePhrasesForLevel - gå igenom lärda ord och hitta deras fraser
    learnedWords.forEach(learnedWord => {
      const phraseIds = phraseIndex?.word_to_phrases?.[learnedWord.id];
      if (phraseIds) {
        phraseIds.forEach((phraseId: string) => {
          const phraseData = phraseDatabase[phraseId];
          if (phraseData) {
            // Kontrollera att meningen har en meningsnivå (N1-N4)
            if ((phraseData as any).meningsnivå && ['N1', 'N2', 'N3', 'N4'].includes((phraseData as any).meningsnivå)) {
              // Kontrollera att alla ord som hänvisar till meningen är lärda
              const referringWordIds = phraseIndex?.phrase_to_words?.[phraseId];
              if (referringWordIds) {
                const allWordsLearned = referringWordIds.every((wordId: string) => learnedWordIds.has(wordId));
                
                if (allWordsLearned) {
                  const level = (phraseData as any).meningsnivå as keyof typeof progress;
                  progress[level].total++;
                  if (sentencesProgress[phraseId]) {
                    progress[level].correct++;
                  }
                }
              }
            }
          }
        });
      }
    });

    return progress;
  }, [phraseDatabase, learnedWords, phraseIndex]);

  // Hämta tillgängliga meningar för en specifik nivå
  const getAvailablePhrasesForLevel = (level: string) => {
    if (!phraseDatabase || learnedWords.length === 0) return [];
    
    const learnedWordIds = new Set(learnedWords.map(word => word.id));
    const phrases: any[] = [];
    
    // Gå igenom alla lärda ord och hitta deras fraser (samma logik som SentencesExerciseDuplicate)
    learnedWords.forEach(learnedWord => {
      const phraseIds = phraseIndex?.word_to_phrases?.[learnedWord.id];
      if (phraseIds) {
        phraseIds.forEach((phraseId: string) => {
          const phraseData = phraseDatabase[phraseId];
          if (phraseData) {
            // Kontrollera att meningen har den specifika nivån (N1-N4)
            if ((phraseData as any).meningsnivå === level) {
              // Kontrollera att alla ord som hänvisar till meningen är lärda
              const referringWordIds = phraseIndex?.phrase_to_words?.[phraseId];
              if (referringWordIds) {
                const allWordsLearned = referringWordIds.every((wordId: string) => learnedWordIds.has(wordId));
                
                if (allWordsLearned) {
                  // Undvik duplicerade meningar
                  if (!phrases.find(p => p.id === phraseId)) {
                    phrases.push(phraseData);
                  }
                }
              }
            }
          }
        });
      }
    });
    
    return phrases;
  };

  // Starta meningar-övning för valda nivåer
  const startSentencesExercise = (levels: string[]) => {
    console.log(`[DEBUG] startSentencesExercise called with levels: ${levels.join(', ')}`);
    
    // Samla alla tillgängliga meningar för de valda nivåerna
    let allPhrases: any[] = [];
    levels.forEach(level => {
      allPhrases = allPhrases.concat(getAvailablePhrasesForLevel(level));
    });
    
    console.log(`[DEBUG] Found ${allPhrases.length} phrases for levels: ${levels.join(', ')}`);
    
    if (allPhrases.length === 0) {
      alert(`Inga meningar tillgängliga för nivå ${levels.join(', ')}. Du behöver lära dig fler ord.`);
      return;
    }
    
    // Slumpa fram max 10 meningar
    const shuffledPhrases = shuffleArrayWithSeed(allPhrases, Date.now());
    const selectedPhrases = shuffledPhrases.slice(0, Math.min(10, shuffledPhrases.length));
    
    console.log(`[DEBUG] Selected ${selectedPhrases.length} phrases for exercise`);
    
    // Sätt valda nivåer och starta övningen
    setSelectedSentenceLevels(levels);
    setSentencesWords(selectedPhrases);
    setSelectedExerciseType(ExerciseType.SENTENCES);
    setCurrentWordIndex(0);
    setShowResults(false);
    setResults([]);
    
    // Scrolla till toppen
    window.scrollTo(0, 0);
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
              // En lista är bara avklarad om den har ord OCH alla ord är lärda
              const allLearned = allWordsInList.length > 0 && allWordsInList.every((wordId: string) => wordProgress[wordId]?.level === 2);
              console.log(`[DEBUG] List ${listName}: ${allWordsInList.length} words, all learned: ${allLearned}`);
              return allLearned;
            }).length;
            
            // Räkna avklarade bokstavering-rutor
            const completedSpellingBoxesCount = completedSpellingBoxes.length;
             
            // Räkna totalt antal ordlistor (unika namn) - exkludera tomma listor
            const totalLists = Object.entries(wordListGroups).filter(([listName, wordLists]: [string, any]) => {
              const allWordsInList = wordLists.flatMap((wordList: any) => wordList.wordIds || []);
              return allWordsInList.length > 0; // Bara räkna listor som har ord
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
      <Box sx={{ mb: 0.3 }}>
        {/* Visa rubrik bara för andra övningstyper än flashcards, bokstavering, meningar och quiz */}
        {selectedExerciseType !== ExerciseType.FLASHCARDS && selectedExerciseType !== ExerciseType.SPELLING && selectedExerciseType !== ExerciseType.SENTENCES && selectedExerciseType !== ExerciseType.QUIZ && (
        <Typography variant="h4" gutterBottom align="center">
          {selectedExerciseType === ExerciseType.SIGN && 'Övningstest'}
        </Typography>
        )}
        
        {/* Visa progress bara för andra övningstyper än meningar */}
        {selectedExerciseType !== ExerciseType.SENTENCES && (
          <>
            {/* Visa text bara för andra övningstyper än flashcards och quiz */}
            {selectedExerciseType !== ExerciseType.FLASHCARDS && selectedExerciseType !== ExerciseType.QUIZ && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Ord {currentWordIndex + 1} av {
                    (selectedExerciseType as any) === ExerciseType.SPELLING ? spellingWords.length :
                    (selectedExerciseType as any) === ExerciseType.QUIZ ? quizWords.length :
                    practiceWords.length
                  }
          </Typography>
        </Box>
            )}
            
            {/* Progress-mätare */}
            {(selectedExerciseType === ExerciseType.FLASHCARDS || selectedExerciseType === ExerciseType.QUIZ) ? (
              // Uppdelad progress för flashcards och quiz (10 korta horisontella streck)
              <Box sx={{ mb: 0.3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: { xs: 0.5, sm: 1 }
                }}>
                  {Array.from({ length: 10 }, (_, index) => {
                    const result = selectedExerciseType === ExerciseType.FLASHCARDS ? flashcardResults[index] : quizResults[index];
                    let backgroundColor = 'rgba(25, 118, 210, 0.1)'; // Standard blå (tom)
                    
                    if (result === true) {
                      backgroundColor = 'success.main'; // Grön för rätt svar
                    } else if (result === false) {
                      backgroundColor = 'error.main'; // Röd för fel svar
                    }
                    
                    return (
                      <Box
                        key={index}
                        sx={{
                          width: { xs: 20, sm: 24 },
                          height: 4,
                          backgroundColor,
                          transition: 'background-color 0.3s ease',
                          borderRadius: 2
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            ) : (
              // Kontinuerlig progress för andra övningar
        <LinearProgress 
          variant="determinate" 
                value={((currentWordIndex + 1) / (
                  (selectedExerciseType as any) === ExerciseType.SPELLING ? spellingWords.length :
                  practiceWords.length
                )) * 100}
                sx={{ mb: 0.3, height: 4 }}
              />
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
            <>
              {/* Infotext för meningar */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Meningar
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
                  Välj svårighetsnivå för att träna på meningar. Du kommer att se en video och gissa vad meningen betyder.
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
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
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
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
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
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
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
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                      <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                        {getSentencesProgress.N4.correct}
                      </Box>
                      /{getAvailablePhrasesForLevel('N4').length} meningar
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
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
