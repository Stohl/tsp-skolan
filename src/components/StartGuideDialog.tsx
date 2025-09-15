import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert
} from '@mui/material';
import {
  School,
  CheckCircle,
  Help,
  TrendingUp,
  PlayArrow,
  Close,
  SkipNext
} from '@mui/icons-material';
import { useDatabase } from '../contexts/DatabaseContext';
import { getAllWordLists, getWordsFromList, WordList } from '../types/wordLists';
import { useWordProgress } from '../hooks/usePersistentState';

// Interface för start-guide frågor
interface GuideQuestion {
  id: string;
  question: string;
  wordListId: string;
  wordListName: string;
  difficulty: string;
  words: any[];
  showWords: boolean;
}

// Props för StartGuideDialog
interface StartGuideDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// Start-guide dialog för nya användare
const StartGuideDialog: React.FC<StartGuideDialogProps> = ({ open, onClose, onComplete }) => {
  const { wordDatabase } = useDatabase();
  const { wordProgress, setWordLevel, setWordProgress } = useWordProgress();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<GuideQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: string]: 'ja' | 'delvis' | 'nej' | 'hoppa' }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalWordsAdded, setTotalWordsAdded] = useState(0);

  // Räkna antal ord i varje kategori
  const getWordCounts = () => {
    const counts = { attLaraMig: 0, larda: 0 };
    Object.values(wordProgress).forEach((progress: any) => {
      if (progress.level === 1) counts.attLaraMig++;
      else if (progress.level === 2) counts.larda++;
    });
    return counts;
  };

  const wordCounts = getWordCounts();

  // Generera frågor baserat på ordlistor
  useEffect(() => {
    if (Object.keys(wordDatabase).length > 0) {
      const allLists = getAllWordLists(wordDatabase);
      
      // Välj ut ordlistor som är markerade för start-guiden
      const guideLists = allLists
        .filter(list => list.showInStartGuide === true)
        .sort((a, b) => (a.startGuidePosition || 999) - (b.startGuidePosition || 999));

      const generatedQuestions: GuideQuestion[] = guideLists
        .filter(list => {
          // Hoppa över ordlistor där alla ord redan är markerade som "att lära mig" eller "lärda"
          const wordsInList = getWordsFromList(list, wordDatabase);
          const hasUnmarkedWords = wordsInList.some(word => {
            const progress = wordProgress[word.id];
            return !progress || progress.level === 0;
          });
          return hasUnmarkedWords;
        })
        .map((list, index) => {
          // Hämta orden från ordlistan
          const wordsInList = getWordsFromList(list, wordDatabase);
          
          return {
            id: `q${index + 1}`,
            question: `Vill du lära dig ${list.name.toLowerCase()}?`,
            wordListId: list.id,
            wordListName: list.name,
            difficulty: list.difficulty,
            words: wordsInList,
            showWords: list.showWordsInStartGuide || false
          };
        });

      setQuestions(generatedQuestions);
    }
  }, [wordDatabase]);

  // Hantera svar på frågor
  const handleAnswer = (answer: 'ja' | 'delvis' | 'nej' | 'hoppa') => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    // Lägg till ord baserat på svar (om inte hoppa över)
    if (answer !== 'hoppa') {
      const wordList = getAllWordLists(wordDatabase).find(list => list.id === currentQuestion.wordListId);
      if (wordList) {
        const wordsInList = getWordsFromList(wordList, wordDatabase);
        
        wordsInList.forEach((word, index) => {
          let level = 0;
          let points = 0;

          switch (answer) {
            case 'ja':
              level = 1; // Att lära mig
              points = 0;
              break;
            case 'nej':
              level = 2; // Lärd
              points = 5;
              break;
          }

          // Sätt lastPracticed till tom sträng så att orden hamnar sist i prioritetslistan
          // (de har ju inte övats ännu, bara lagts till från startguiden)
          const neverPracticedTime = '';

          setWordLevel(word.id, level);
          setWordProgress(prev => ({
            ...prev,
            [word.id]: {
              ...prev[word.id],
              level,
              points,
              stats: {
                correct: 0,
                incorrect: 0,
                lastPracticed: neverPracticedTime,
                difficulty: 50
              }
            }
          }));
        });

        setTotalWordsAdded(prev => prev + wordsInList.length);
      }
    }

    // Kontrollera om användaren har tillräckligt många ord i "att lära mig" (50-150)
    const currentWordCounts = getWordCounts();
    const attLaraMigCount = currentWordCounts.attLaraMig;
    
    // Gå till nästa fråga eller avsluta
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (attLaraMigCount >= 50) {
      // Avsluta om användaren har minst 50 ord i "att lära mig"
      setIsCompleted(true);
    } else {
      // Fortsätt med fler frågor om användaren inte har tillräckligt många ord
      // Generera fler frågor från ordlistor som inte redan har frågats om
      const allLists = getAllWordLists(wordDatabase);
      const guideLists = allLists
        .filter(list => list.showInStartGuide === true)
        .sort((a, b) => (a.startGuidePosition || 999) - (b.startGuidePosition || 999));
      
      const askedListIds = questions.map(q => q.wordListId);
      const remainingLists = guideLists.filter(list => !askedListIds.includes(list.id));
      
      if (remainingLists.length > 0) {
        // Lägg till fler frågor från återstående ordlistor
        const additionalQuestions: GuideQuestion[] = remainingLists
          .filter(list => {
            const wordsInList = getWordsFromList(list, wordDatabase);
            const hasUnmarkedWords = wordsInList.some(word => {
              const progress = wordProgress[word.id];
              return !progress || progress.level === 0;
            });
            return hasUnmarkedWords;
          })
          .slice(0, 5) // Lägg till max 5 fler frågor åt gången
          .map((list, index) => {
            const wordsInList = getWordsFromList(list, wordDatabase);
            return {
              id: `q${questions.length + index + 1}`,
              question: `Vill du lära dig ${list.name.toLowerCase()}?`,
              wordListId: list.id,
              wordListName: list.name,
              difficulty: list.difficulty,
              words: wordsInList,
              showWords: list.showWordsInStartGuide || false
            };
          });
        
        if (additionalQuestions.length > 0) {
          setQuestions(prev => [...prev, ...additionalQuestions]);
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          setIsCompleted(true);
        }
      } else {
        setIsCompleted(true);
      }
    }
  };

  // Återställ guide
  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsCompleted(false);
    setTotalWordsAdded(0);
  };

  // Stäng dialog
  const handleClose = () => {
    onClose();
    handleReset();
  };

  // Avsluta guide
  const handleFinish = () => {
    onComplete();
    handleReset();
    // Trigger storage event för att uppdatera progress i andra komponenter
    window.dispatchEvent(new Event('storage'));
    // Ladda om sidan för att säkerställa att all progress uppdateras
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (!currentQuestion && !isCompleted) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <School color="primary" />
          <Typography variant="h6">
            {isCompleted ? 'Start-guide slutförd!' : 'Välkommen till TSP Skolan'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!isCompleted ? (
          <>
            {/* Progress bar för antal ord i "att lära mig" */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Fråga {currentQuestionIndex + 1} av {questions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {wordCounts.attLaraMig} ord i "att lära mig"
                </Typography>
              </Box>
              
              {/* Progress bar med färgkodning baserat på antal ord */}
              {(() => {
                const targetMin = 50;
                const targetMax = 150;
                const currentCount = wordCounts.attLaraMig;
                
                // Beräkna progress som procent av 0-200 intervallet
                let progressPercent = (currentCount / 200) * 100;
                let progressColor;
                
                if (currentCount < targetMin) {
                  // Under 50: gult
                  progressColor = 'warning';
                } else if (currentCount <= targetMax) {
                  // 50-150: grönt
                  progressColor = 'success';
                } else {
                  // Över 150: rött
                  progressColor = 'error';
                }
                
                return (
                  <>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(progressPercent, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: progressColor === 'warning' ? '#ff9800' : 
                                         progressColor === 'success' ? '#4caf50' : '#f44336'
                        }
                      }}
                    />
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Rekommenderat: 50-150 ord i "att lära mig"
                      </Typography>
                    </Box>
                  </>
                );
              })()}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Att lära mig: {wordCounts.attLaraMig} ord
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lärda: {wordCounts.larda} ord
                </Typography>
              </Box>
            </Box>

            {/* Introduktion för första frågan */}
            {currentQuestionIndex === 0 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Vi kommer att ställa några enkla frågor för att anpassa appen efter din nivå. 
                  Baserat på dina svar kommer vi att lägga till ord i dina listor.
                </Typography>
              </Alert>
            )}

            {/* Aktuell fråga */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {currentQuestion?.question}
                </Typography>
                
                {/* Visa orden om showWords är true */}
                {currentQuestion?.showWords && currentQuestion?.words && currentQuestion.words.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {currentQuestion.words.slice(0, 20).map((word: any, index: number) => (
                        <Chip
                          key={word.id || index}
                          label={word.ord}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                      {currentQuestion.words.length > 20 && (
                        <Chip
                          label={`+${currentQuestion.words.length - 20} fler`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Svarsalternativ */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => handleAnswer('ja')}
                startIcon={<CheckCircle color="success" />}
                sx={{ 
                  flex: { xs: 1, sm: '0 1 auto' },
                  minWidth: { xs: '100%', sm: '140px' },
                  p: 2 
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Ja, vill lära mig
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => handleAnswer('nej')}
                startIcon={<TrendingUp color="warning" />}
                sx={{ 
                  flex: { xs: 1, sm: '0 1 auto' },
                  minWidth: { xs: '100%', sm: '140px' },
                  p: 2 
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Kan redan
                </Typography>
              </Button>


              <Button
                variant="outlined"
                size="large"
                onClick={() => handleAnswer('hoppa')}
                startIcon={<SkipNext color="action" />}
                sx={{ 
                  flex: { xs: 1, sm: '0 1 auto' },
                  minWidth: { xs: '100%', sm: '140px' },
                  p: 2 
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Avvakta
                </Typography>
              </Button>
            </Box>
          </>
        ) : (
          /* Slutskärm */
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Perfekt! Start-guiden är klar
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Vi har lagt till <strong>{totalWordsAdded} ord</strong> i dina listor baserat på dina svar.
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vad händer nu?
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PlayArrow color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Gå till Övning" 
                      secondary="Börja öva med dina ordlistor"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Kolla Ordlistor" 
                      secondary="Se dina ordlistor och progress"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {!isCompleted ? (
          <Button onClick={handleClose} startIcon={<Close />}>
            Stäng guiden
          </Button>
        ) : (
          <Button onClick={handleFinish} variant="contained" startIcon={<PlayArrow />}>
            Börja öva!
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StartGuideDialog;
