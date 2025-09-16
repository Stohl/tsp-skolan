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

// Kunskapsnivåer för startguiden
export type KnowledgeLevel = 'nyborjare' | 'lite_erfaren' | 'erfaren' | 'avancerad';

// Interface för kunskapsnivå-fråga
interface KnowledgeLevelQuestion {
  id: string;
  level: KnowledgeLevel;
  title: string;
  description: string;
}

// Interface för kategori-baserade frågor
interface CategoryQuestion {
  id: string;
  category: string;
  categoryName: string;
  wordLists: WordList[];
  selectedAnswer: 'ja' | 'behover_repetera' | 'nej' | null;
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
  const [currentStep, setCurrentStep] = useState<'knowledge_level' | 'categories' | 'completed'>('knowledge_level');
  const [selectedKnowledgeLevel, setSelectedKnowledgeLevel] = useState<KnowledgeLevel | null>(null);
  const [categoryQuestions, setCategoryQuestions] = useState<CategoryQuestion[]>([]);
  
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
      id: 'avancerad',
      level: 'avancerad',
      title: 'Avancerad',
      description: 'Jag kan teckna flytande'
    }
  ];

  // Logik för automatisk placering baserat på kunskapsnivå
  const getDefaultPlacement = (knowledgeLevel: KnowledgeLevel, difficulty: string): 'ja' | 'behover_repetera' | 'nej' => {
    switch (knowledgeLevel) {
      case 'nyborjare':
        return 'nej'; // Alla ordlistor i "nej" (behöver lära mig)
      case 'lite_erfaren':
        return difficulty === 'handstart' ? 'nej' : 'behover_repetera';
      case 'erfaren':
        return difficulty === 'handstart' || difficulty === 'fingervana' ? 'behover_repetera' : 'ja';
      case 'avancerad':
        return 'ja'; // Alla ordlistor i "ja" (kan redan)
      default:
        return 'nej';
    }
  };

  // Generera kategori-frågor när kunskapsnivå är vald
  useEffect(() => {
    if (selectedKnowledgeLevel && Object.keys(wordDatabase).length > 0) {
      const allLists = getAllWordLists(wordDatabase);
      
      // Gruppera ordlistor efter kategori (difficulty)
      const categories = ['handstart', 'fingervana', 'tecknare', 'samspelare'];
      
      const generatedCategoryQuestions: CategoryQuestion[] = categories.map(category => {
        const categoryLists = allLists.filter(list => 
          list.difficulty === category && 
          list.showInStartGuide === true
        );
        
        return {
          id: category,
          category: category,
          categoryName: category.charAt(0).toUpperCase() + category.slice(1),
          wordLists: categoryLists,
          selectedAnswer: getDefaultPlacement(selectedKnowledgeLevel, category)
        };
      }).filter(category => category.wordLists.length > 0); // Bara kategorier som har ordlistor
      
      setCategoryQuestions(generatedCategoryQuestions);
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
    setCurrentStep('categories');
  };

  // Hantera svar på kategori-frågor
  const handleCategoryAnswer = (categoryId: string, answer: 'ja' | 'behover_repetera' | 'nej') => {
    setCategoryQuestions(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { ...category, selectedAnswer: answer }
          : category
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
    
    categoryQuestions.forEach(category => {
      if (category.selectedAnswer) {
        category.wordLists.forEach(wordList => {
          const wordsInList = getWordsFromList(wordList, wordDatabase);
          
          wordsInList.forEach(word => {
            let level = 0;
            let points = 0;

            switch (category.selectedAnswer) {
              case 'ja':
                level = 2; // Lärd
                points = 5;
                break;
              case 'behover_repetera':
                level = 1; // Att lära mig
                points = 0;
                break;
              case 'nej':
                level = 1; // Att lära mig
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
    setCategoryQuestions([]);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <School color="primary" />
          <Typography variant="h6">
            {currentStep === 'knowledge_level' && 'Välkommen till TSP Skolan'}
            {currentStep === 'categories' && 'Anpassa dina ordlistor'}
            {currentStep === 'completed' && 'Start-guide slutförd!'}
          </Typography>
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
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
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

        {currentStep === 'categories' && (
          <>
            {/* Kategori-baserade frågor */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Baserat på din kunskapsnivå har vi förslag på hur du kan placera ordlistorna. 
                Du kan ändra dessa om du vill.
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Ordlistor per kategori
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {categoryQuestions.map((category) => (
                <Card key={category.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Kan du {category.categoryName.toLowerCase()}-ordlistorna?
                    </Typography>
                    
                    {/* Visa ordlistor i kategorin */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Ordlistor i denna kategori:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {category.wordLists.map((wordList) => (
                          <Chip
                            key={wordList.id}
                            label={wordList.name}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Svarsalternativ */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      <Button
                        variant={category.selectedAnswer === 'ja' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleCategoryAnswer(category.id, 'ja')}
                        sx={{ flex: { xs: 1, sm: '0 1 auto' } }}
                      >
                        Ja - Jag kan alla dessa tecken
                      </Button>
                      <Button
                        variant={category.selectedAnswer === 'behover_repetera' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleCategoryAnswer(category.id, 'behover_repetera')}
                        sx={{ flex: { xs: 1, sm: '0 1 auto' } }}
                      >
                        Behöver repetera
                      </Button>
                      <Button
                        variant={category.selectedAnswer === 'nej' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleCategoryAnswer(category.id, 'nej')}
                        sx={{ flex: { xs: 1, sm: '0 1 auto' } }}
                      >
                        Nej - Jag behöver lära mig dessa
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Slutför-knapp */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleFinishNewGuide}
                startIcon={<CheckCircle />}
                sx={{ px: 4, py: 1.5 }}
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
        {currentStep === 'knowledge_level' && (
          <Button onClick={handleClose} startIcon={<Close />}>
            Stäng guiden
          </Button>
        )}
        
        {currentStep === 'categories' && (
          <Button onClick={handleClose} startIcon={<Close />}>
            Stäng guiden
          </Button>
        )}
        
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
