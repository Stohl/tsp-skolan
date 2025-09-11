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

      const generatedQuestions: GuideQuestion[] = guideLists.map((list, index) => {
        // Hämta orden från ordlistan
        const wordsInList = getWordsFromList(list, wordDatabase);
        
        return {
          id: `q${index + 1}`,
          question: `Kan du ${list.name.toLowerCase()}?`,
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
        
        wordsInList.forEach(word => {
          let level = 0;
          let points = 0;

          switch (answer) {
            case 'ja':
              level = 2; // Lärd
              points = 5;
              break;
            case 'delvis':
              level = 1; // Att lära mig
              points = 2; // 2 av 5 poäng
              break;
            case 'nej':
              level = 1; // Att lära mig
              points = 0;
              break;
          }

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
                lastPracticed: new Date().toISOString(),
                difficulty: 50
              }
            }
          }));
        });

        setTotalWordsAdded(prev => prev + wordsInList.length);
      }
    }

    // Gå till nästa fråga eller avsluta
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
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
            {/* Progress bar */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Fråga {currentQuestionIndex + 1} av {questions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} />
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => handleAnswer('ja')}
                startIcon={<CheckCircle color="success" />}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Ja
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => handleAnswer('delvis')}
                startIcon={<TrendingUp color="warning" />}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Delvis
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => handleAnswer('nej')}
                startIcon={<Help color="error" />}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Nej
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => handleAnswer('hoppa')}
                startIcon={<SkipNext color="action" />}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Hoppa över denna fråga
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
            Hoppa över guide
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
