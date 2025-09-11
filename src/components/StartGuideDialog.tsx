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
  Close
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
  const { setWordLevel, setWordProgress } = useWordProgress();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<GuideQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: string]: 'ja' | 'delvis' | 'nej' }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalWordsAdded, setTotalWordsAdded] = useState(0);

  // Generera frågor baserat på ordlistor
  useEffect(() => {
    if (Object.keys(wordDatabase).length > 0) {
      const allLists = getAllWordLists(wordDatabase);
      
      // Välj ut representativa ordlistor för start-guiden
      const guideLists = allLists.filter(list => 
        list.type === 'predefined' && 
        (list.name.includes('handalfabet') || 
         list.name.includes('grundläggande') || 
         list.name.includes('vanligaste') ||
         list.name.includes('adjektiv') ||
         list.name.includes('verb'))
      ).slice(0, 8); // Max 8 frågor

      const generatedQuestions: GuideQuestion[] = guideLists.map((list, index) => ({
        id: `q${index + 1}`,
        question: `Kan du ${list.name.toLowerCase()}?`,
        wordListId: list.id,
        wordListName: list.name,
        difficulty: list.difficulty
      }));

      setQuestions(generatedQuestions);
    }
  }, [wordDatabase]);

  // Hantera svar på frågor
  const handleAnswer = (answer: 'ja' | 'delvis' | 'nej') => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    // Lägg till ord baserat på svar
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
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={currentQuestion?.wordListName} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={currentQuestion?.difficulty} 
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Välj det svar som bäst beskriver din kunskap:
                </Typography>
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
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Ja, jag kan det
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ordlistan läggs till som "lärd"
                  </Typography>
                </Box>
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => handleAnswer('delvis')}
                startIcon={<TrendingUp color="warning" />}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Delvis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ordlistan läggs till som "att lära mig" med 2/5 poäng
                  </Typography>
                </Box>
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => handleAnswer('nej')}
                startIcon={<Help color="error" />}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Nej, jag behöver lära mig det
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ordlistan läggs till som "att lära mig"
                  </Typography>
                </Box>
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
