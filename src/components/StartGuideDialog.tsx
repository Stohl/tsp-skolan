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
  SkipNext,
  HourglassEmpty
} from '@mui/icons-material';
import { useDatabase } from '../contexts/DatabaseContext';
import { getAllWordLists, getWordsFromList, WordList } from '../types/wordLists';
import { useWordProgress } from '../hooks/usePersistentState';

// Kunskapsnivåer för startguiden
export type KnowledgeLevel = 'nyborjare' | 'lite_erfaren' | 'erfaren' | 'proffs';

// Interface för kunskapsnivå-fråga
interface KnowledgeLevelQuestion {
  id: string;
  level: KnowledgeLevel;
  title: string;
  description: string;
}

// Interface för individuella ordlistor-frågor
interface WordListQuestion {
  id: string;
  wordList: WordList;
  selectedAnswer: 'ja' | 'behover_repetera' | 'nej' | 'vanta' | null;
}

// Interface för start-guide frågor (bakåtkompatibilitet)
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
  
  // Ny struktur för startguiden
  const [currentStep, setCurrentStep] = useState<'knowledge_level' | 'wordlists' | 'completed'>('knowledge_level');
  const [selectedKnowledgeLevel, setSelectedKnowledgeLevel] = useState<KnowledgeLevel | null>(null);
  const [wordListQuestions, setWordListQuestions] = useState<WordListQuestion[]>([]);
  
  // Bakåtkompatibilitet - gamla state
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

  // Kunskapsnivå-frågor
  const knowledgeLevelQuestions: KnowledgeLevelQuestion[] = [
    {
      id: 'nyborjare',
      level: 'nyborjare',
      title: 'Nybörjare',
      description: 'Jag har aldrig tecknat förut'
    },
    {
      id: 'lite_erfaren',
      level: 'lite_erfaren',
      title: 'Lite erfaren',
      description: 'Jag kan några grundläggande tecken'
    },
    {
      id: 'erfaren',
      level: 'erfaren',
      title: 'Erfaren',
      description: 'Jag kan många tecken och några fraser'
    },
    {
      id: 'proffs',
      level: 'proffs',
      title: 'Proffs',
      description: 'Jag kan teckna flytande'
    }
  ];

  // Logik för automatisk placering baserat på kunskapsnivå och svårighetsgrad
  const getDefaultPlacement = (knowledgeLevel: KnowledgeLevel, difficulty: string): 'ja' | 'behover_repetera' | 'nej' => {
    const difficultyLevels = ['nyborjare', 'lite_erfaren', 'erfaren', 'proffs'];
    const userLevelIndex = difficultyLevels.indexOf(knowledgeLevel);
    const wordListLevelIndex = difficultyLevels.indexOf(difficulty as any);
    
    if (wordListLevelIndex === -1) return 'nej'; // Okänd svårighetsgrad
    
    const levelDifference = userLevelIndex - wordListLevelIndex;
    
    if (levelDifference === 0) {
      // Samma svårighetsgrad - behöver lära mig
      return 'nej';
    } else if (levelDifference === 1) {
      // En nivå lägre - behöver repetera
      return 'behover_repetera';
    } else if (levelDifference >= 2) {
      // Två eller fler nivåer lägre - kan redan
      return 'ja';
    } else {
      // Högre svårighetsgrad än användaren - behöver lära mig
      return 'nej';
    }
  };

  // Generera individuella ordlistor-frågor när kunskapsnivå är vald
  useEffect(() => {
    if (selectedKnowledgeLevel && Object.keys(wordDatabase).length > 0) {
      const allLists = getAllWordLists(wordDatabase);
      
      // Filtrera ordlistor baserat på svårighetsnivå (samma eller lägre än vald nivå)
      const difficultyLevels = ['nyborjare', 'lite_erfaren', 'erfaren', 'proffs'];
      const userLevelIndex = difficultyLevels.indexOf(selectedKnowledgeLevel);
      
      const guideLists = allLists
        .filter(list => {
          const listLevelIndex = difficultyLevels.indexOf(list.difficulty);
          return listLevelIndex <= userLevelIndex; // Samma eller lägre svårighetsgrad
        })
        .sort((a, b) => {
          const levelA = difficultyLevels.indexOf(a.difficulty);
          const levelB = difficultyLevels.indexOf(b.difficulty);
          return levelB - levelA; // Högre svårighetsgrad först
        });
      
      const generatedWordListQuestions: WordListQuestion[] = guideLists.map((wordList, index) => ({
        id: `wordlist_${index}`,
        wordList: wordList,
        selectedAnswer: getDefaultPlacement(selectedKnowledgeLevel, wordList.difficulty)
      }));
      
      setWordListQuestions(generatedWordListQuestions);
    }
  }, [selectedKnowledgeLevel, wordDatabase]);

  // Generera frågor baserat på ordlistor (bakåtkompatibilitet)
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

  // Hantera val av kunskapsnivå
  const handleKnowledgeLevelSelect = (level: KnowledgeLevel) => {
    setSelectedKnowledgeLevel(level);
    setCurrentStep('wordlists');
  };

  // Hantera svar på ordlistor-frågor
  const handleWordListAnswer = (questionId: string, answer: 'ja' | 'behover_repetera' | 'nej' | 'vanta') => {
    setWordListQuestions(prev => 
      prev.map(question => 
        question.id === questionId 
          ? { ...question, selectedAnswer: answer }
          : question
      )
    );
  };

  // Hantera svar på frågor (bakåtkompatibilitet)
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

  // Slutför startguiden med nya strukturen
  const handleFinishNewGuide = () => {
    let totalAdded = 0;
    
    wordListQuestions.forEach(question => {
      if (question.selectedAnswer) {
        const wordsInList = getWordsFromList(question.wordList, wordDatabase);
        
        wordsInList.forEach(word => {
          let level = 0;
          let points = 0;

          switch (question.selectedAnswer) {
            case 'ja':
              level = 2; // Lärd
              points = 5;
              break;
            case 'behover_repetera':
              level = 1; // Att lära mig
              points = 3;
              break;
            case 'nej':
              level = 1; // Att lära mig
              points = 0;
              break;
            case 'vanta':
              level = 0; // Ingen progress - väntar
              points = 0;
              break;
          }

          // Sätt lastPracticed till tom sträng så att orden hamnar sist i prioritetslistan
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
          
          totalAdded++;
        });
      }
    });
    
    setTotalWordsAdded(totalAdded);
    setCurrentStep('completed');
  };

  // Återställ guide
  const handleReset = () => {
    setCurrentStep('knowledge_level');
    setSelectedKnowledgeLevel(null);
    setWordListQuestions([]);
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

  // Bakåtkompatibilitet - gamla variabler
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School color="primary" />
            <Typography variant="h6">
              {currentStep === 'knowledge_level' && 'Välkommen till TSP Skolan'}
              {currentStep === 'wordlists' && 'Lämpliga ordlistor'}
              {currentStep === 'completed' && 'Start-guide slutförd!'}
            </Typography>
          </Box>
          <Button
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {currentStep === 'knowledge_level' && (
          <>
            {/* Kunskapsnivå-fråga */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Vi vill veta din nuvarande kunskapsnivå för att anpassa appen efter dig.
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Vilken kunskapsnivå har du i dagsläget?
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {knowledgeLevelQuestions.map((question) => (
                <Card 
                  key={question.id}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleKnowledgeLevelSelect(question.level)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {question.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {question.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}

        {currentStep === 'wordlists' && (
          <>
            {/* Beskrivning av vad alternativen betyder */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Baserat på din kunskapsnivå har vi förslag på hur du kan placera ordlistorna. 
                Du kan ändra dessa om du vill.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Ja</strong> = Ordlistan läggs till i "Lärda" (kan redan)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Behöver repetera</strong> = Ordlistan läggs till i "Att lära mig" (vill öva mer)
              </Typography>
              <Typography variant="body2">
                <strong>Nej</strong> = Ordlistan läggs till i "Att lära mig" (behöver lära sig)
              </Typography>
            </Alert>


            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {wordListQuestions.map((question) => (
                <Card 
                  key={question.id} 
                  sx={{ 
                    mb: 2,
                    border: question.selectedAnswer ? '2px solid' : '1px solid',
                    borderColor: question.selectedAnswer ? 'primary.main' : 'divider',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Kan du {question.wordList.name.toLowerCase()}?
                    </Typography>
                    
                    {/* Visa första orden i ordlistan */}
                    {(() => {
                      const wordsInList = getWordsFromList(question.wordList, wordDatabase);
                      
                      // Sortera orden - försök först numeriskt, sedan alfabetiskt
                      const sortedWords = wordsInList.sort((a, b) => {
                        const aNum = parseFloat(a.ord);
                        const bNum = parseFloat(b.ord);
                        
                        // Om båda är nummer, sortera numeriskt
                        if (!isNaN(aNum) && !isNaN(bNum)) {
                          return aNum - bNum;
                        }
                        
                        // Annars sortera alfabetiskt
                        return a.ord.localeCompare(b.ord, 'sv');
                      });
                      
                      // Visa så många ord som möjligt utan att göra rutan större
                      let wordsToShow = [];
                      let currentLength = 0;
                      const maxLength = 80; // Max längd för att hålla rutan kompakt
                      
                      for (let i = 0; i < sortedWords.length; i++) {
                        const word = sortedWords[i].ord;
                        const testLength = currentLength + (i > 0 ? 2 : 0) + word.length; // +2 för ', '
                        
                        if (testLength <= maxLength) {
                          wordsToShow.push(word);
                          currentLength = testLength;
                        } else {
                          break;
                        }
                      }
                      
                      const hasMoreWords = wordsToShow.length < sortedWords.length;
                      const displayText = wordsToShow.join(', ') + (hasMoreWords ? '...' : '');
                      
                      return (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {displayText}
                        </Typography>
                      );
                    })()}

                    {/* Svarsalternativ med modern design */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      gap: 1.5,
                      flexWrap: 'wrap'
                    }}>
                      <Button
                        variant={question.selectedAnswer === 'ja' ? 'contained' : 'outlined'}
                        size="medium"
                        onClick={() => handleWordListAnswer(question.id, 'ja')}
                        disableRipple
                        disableTouchRipple
                        disableElevation
                        sx={{ 
                          flex: { xs: 1, sm: '0 1 auto' },
                          minWidth: { xs: '100%', sm: '120px' },
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: question.selectedAnswer === 'ja' ? 'bold' : 'normal',
                          backgroundColor: question.selectedAnswer === 'ja' ? 'success.main' : 'transparent',
                          color: question.selectedAnswer === 'ja' ? 'white' : 'success.main',
                          borderColor: 'success.main',
                          '&:hover': {
                            backgroundColor: question.selectedAnswer === 'ja' ? 'success.main' : 'transparent',
                            color: question.selectedAnswer === 'ja' ? 'white' : 'success.main',
                            borderColor: 'success.main'
                          }
                        }}
                      >
                        Ja
                      </Button>
                      <Button
                        variant={question.selectedAnswer === 'behover_repetera' ? 'contained' : 'outlined'}
                        size="medium"
                        onClick={() => handleWordListAnswer(question.id, 'behover_repetera')}
                        disableRipple
                        disableTouchRipple
                        disableElevation
                        sx={{ 
                          flex: { xs: 1, sm: '0 1 auto' },
                          minWidth: { xs: '100%', sm: '120px' },
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: question.selectedAnswer === 'behover_repetera' ? 'bold' : 'normal',
                          backgroundColor: question.selectedAnswer === 'behover_repetera' ? 'warning.main' : 'transparent',
                          color: question.selectedAnswer === 'behover_repetera' ? 'white' : 'warning.main',
                          borderColor: 'warning.main',
                          '&:hover': {
                            backgroundColor: question.selectedAnswer === 'behover_repetera' ? 'warning.main' : 'transparent',
                            color: question.selectedAnswer === 'behover_repetera' ? 'white' : 'warning.main',
                            borderColor: 'warning.main'
                          }
                        }}
                      >
                        Behöver repetera
                      </Button>
                      <Button
                        variant={question.selectedAnswer === 'nej' ? 'contained' : 'outlined'}
                        size="medium"
                        onClick={() => handleWordListAnswer(question.id, 'nej')}
                        disableRipple
                        disableTouchRipple
                        disableElevation
                        sx={{ 
                          flex: { xs: 1, sm: '0 1 auto' },
                          minWidth: { xs: '100%', sm: '120px' },
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: question.selectedAnswer === 'nej' ? 'bold' : 'normal',
                          backgroundColor: question.selectedAnswer === 'nej' ? '#2196F3' : 'transparent',
                          color: question.selectedAnswer === 'nej' ? 'white' : '#2196F3',
                          borderColor: '#2196F3',
                          '&:hover': {
                            backgroundColor: question.selectedAnswer === 'nej' ? '#2196F3' : 'transparent',
                            color: question.selectedAnswer === 'nej' ? 'white' : '#2196F3',
                            borderColor: '#2196F3'
                          }
                        }}
                      >
                        Nej
                      </Button>
                      <Button
                        variant={question.selectedAnswer === 'vanta' ? 'contained' : 'outlined'}
                        size="medium"
                        onClick={() => handleWordListAnswer(question.id, 'vanta')}
                        disableRipple
                        disableTouchRipple
                        disableElevation
                        startIcon={<HourglassEmpty />}
                        sx={{ 
                          flex: { xs: 1, sm: '0 1 auto' },
                          minWidth: { xs: '100%', sm: '120px' },
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: question.selectedAnswer === 'vanta' ? 'bold' : 'normal',
                          backgroundColor: question.selectedAnswer === 'vanta' ? 'grey.500' : 'transparent',
                          color: question.selectedAnswer === 'vanta' ? 'white' : 'grey.600',
                          borderColor: 'grey.500',
                          '&:hover': {
                            backgroundColor: question.selectedAnswer === 'vanta' ? 'grey.500' : 'transparent',
                            color: question.selectedAnswer === 'vanta' ? 'white' : 'grey.600',
                            borderColor: 'grey.500'
                          }
                        }}
                      >
                        Vänta
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Slutför-knapp med modern design */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleFinishNewGuide}
                startIcon={<CheckCircle />}
                sx={{ 
                  px: 6, 
                  py: 2,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Slutför startguiden
              </Button>
            </Box>
          </>
        )}

        {currentStep === 'completed' && (
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
        {currentStep === 'completed' && (
          <Button onClick={handleFinish} variant="contained" startIcon={<PlayArrow />}>
            Börja öva!
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StartGuideDialog;
