import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { useWordProgress } from '../hooks/usePersistentState';
import KorpusPlayer from '../components/KorpusPlayer';

// Interface för korpus-fil
interface KorpusFile {
  filename: string;
  title: string;
  source_url: string;
  video_url: string;
  json_file: string;
  gloss_count: number;
  gloss_ids: string[];
}

// Interface för korpus-index
interface KorpusIndex {
  description: string;
  source: string;
  total_files: number;
  files_with_video: number;
  total_unique_glosses: number;
  matched_glosses: number;
  word_database_file: string;
  last_updated: string;
  files: KorpusFile[];
}

interface KorpusPageProps {
  onBack: () => void;
}

const KorpusPage: React.FC<KorpusPageProps> = ({ onBack }) => {
  const [korpusData, setKorpusData] = useState<KorpusIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKorpus, setSelectedKorpus] = useState<KorpusFile | null>(null);
  const { wordProgress, updateWordProgress } = useWordProgress();
  const [watchedVideos, setWatchedVideos] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<'title' | 'glossCount' | 'watched' | 'progress'>('title');
  const [sortAscending, setSortAscending] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; file: KorpusFile | null }>({ 
    open: false, 
    file: null 
  });

  // Ladda korpus-data
  useEffect(() => {
    const loadKorpusData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/korpus_index.json');
        if (!response.ok) {
          throw new Error('Kunde inte ladda korpus-data');
        }
        const data: KorpusIndex = await response.json();
        setKorpusData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Okänt fel');
      } finally {
        setLoading(false);
      }
    };

    loadKorpusData();
  }, []);

  // Ladda watched videos från localStorage
  useEffect(() => {
    const saved = localStorage.getItem('korpus-watched');
    if (saved) {
      setWatchedVideos(JSON.parse(saved));
    }
  }, []);

  // Formatera watched-datum till text
  const getWatchedText = (dateString: string | undefined): string => {
    if (!dateString) return '—';
    
    const watched = new Date(dateString);
    const today = new Date();
    
    // Nollställ tid för korrekt jämförelse av dagar
    today.setHours(0, 0, 0, 0);
    watched.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - watched.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Idag';
    if (diffDays === 1) return 'Igår';
    if (diffDays === 2) return 'Förrgår';
    return `För ${diffDays} dagar sedan`;
  };

  // Markera video som sedd
  const markAsWatched = (filename: string) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const updated = { ...watchedVideos, [filename]: today };
    setWatchedVideos(updated);
    localStorage.setItem('korpus-watched', JSON.stringify(updated));
  };

  // Räkna antal lärda ord för en fil
  const getLearnedWordsCount = (glossIds: string[]): number => {
    return glossIds.filter(id => {
      const progress = wordProgress[id];
      return progress && progress.level === 2; // Level 2 = lärda
    }).length;
  };

  // Beräkna procent lärda ord
  const getLearnedPercentage = (glossIds: string[]): number => {
    const learnedCount = getLearnedWordsCount(glossIds);
    return glossIds.length > 0 ? (learnedCount / glossIds.length) * 100 : 0;
  };

  // Få svårighetsfärg baserat på procent lärda ord
  const getDifficultyColor = (percentage: number): string => {
    if (percentage <= 15) return '#f44336'; // Röd - Svår
    if (percentage <= 30) return '#ff9800'; // Orange - Medel
    if (percentage <= 60) return '#fdd835'; // Gul - Lättare
    return '#4caf50'; // Grön - Lätt
  };

  // Sortera korpus-filer
  const getSortedFiles = () => {
    if (!korpusData) return [];
    
    const sorted = [...korpusData.files].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title, 'sv');
          break;
        case 'glossCount':
          comparison = a.gloss_count - b.gloss_count;
          break;
        case 'watched':
          const dateA = watchedVideos[a.filename] || '';
          const dateB = watchedVideos[b.filename] || '';
          comparison = dateB.localeCompare(dateA); // Nyaste först som default
          break;
        case 'progress':
          const percentA = getLearnedPercentage(a.gloss_ids);
          const percentB = getLearnedPercentage(b.gloss_ids);
          comparison = percentA - percentB;
          break;
      }
      
      return sortAscending ? comparison : -comparison;
    });
    
    return sorted;
  };

  // Hantera klick på kolumnrubrik för sortering
  const handleSort = (column: 'title' | 'glossCount' | 'watched' | 'progress') => {
    if (sortBy === column) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(column);
      setSortAscending(true);
    }
  };

  // Öppna bekräftelse-dialog
  const handleAddWordsClick = (file: KorpusFile, event: React.MouseEvent) => {
    event.stopPropagation(); // Förhindra att videon öppnas
    setConfirmDialog({ open: true, file });
  };

  // Lägg till alla ord från videon
  const handleConfirmAddWords = () => {
    if (!confirmDialog.file) return;
    
    const file = confirmDialog.file;
    let addedCount = 0;
    
    file.gloss_ids.forEach(wordId => {
      const currentProgress = wordProgress[wordId];
      
      // Skippa ord som redan är lärda (level 2)
      if (currentProgress?.level === 2) {
        return;
      }
      
      // Sätt ord till level 1 och uppdatera lastPracticed
      const now = new Date().toISOString();
      if (currentProgress) {
        // Uppdatera befintlig progress
        updateWordProgress(wordId, {
          ...currentProgress,
          level: 1,
          stats: {
            ...currentProgress.stats,
            lastPracticed: now
          }
        });
      } else {
        // Skapa ny progress
        updateWordProgress(wordId, {
          level: 1,
          points: 0,
          stats: {
            correct: 0,
            incorrect: 0,
            lastPracticed: now,
            difficulty: 50
          }
        });
      }
      
      addedCount++;
    });
    
    // Stäng dialog
    setConfirmDialog({ open: false, file: null });
    
    // Visa bekräftelse (optional - kan tas bort om för mycket)
    if (addedCount > 0) {
      alert(`La till ${addedCount} ord från "${file.title}" i "Att lära mig"!`);
    }
  };


  // Om en korpus är vald, visa spelaren
  if (selectedKorpus) {
    return (
      <KorpusPlayer
        korpusFile={selectedKorpus}
        onBack={() => setSelectedKorpus(null)}
      />
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!korpusData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Ingen korpus-data hittades</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header med tillbaka-knapp på samma höjd */}
      <Box sx={{ position: 'relative', mb: 4, textAlign: 'center' }}>
        <IconButton 
          onClick={onBack}
          sx={{ 
            position: 'absolute', 
            left: 0, 
            top: 0
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Berättelser
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto', lineHeight: 1.6 }}>
          <strong>Detta är en testversion av korpus-filmer.</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto', mt: 1, lineHeight: 1.6 }}>
          Filmerna är hämtade från{' '}
          <Link href="https://teckensprakskorpus.su.se" target="_blank" rel="noopener noreferrer">
            STS-korpus vid Stockholms Universitet
          </Link>
          {' '}och används under{' '}
          <Link href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.sv" target="_blank" rel="noopener noreferrer">
            Creative Commons-licens (CC BY-NC-SA 4.0)
          </Link>
          . Ett enormt tack till korpussidan och Stockholms Universitet för att göra detta material tillgängligt!
        </Typography>
      </Box>

      {/* Tabell med korpus-filer */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('title')}
              >
                <strong>Titel {sortBy === 'title' && (sortAscending ? '↑' : '↓')}</strong>
              </TableCell>
              <TableCell 
                align="center"
                sx={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('watched')}
              >
                <strong>Senast sedd {sortBy === 'watched' && (sortAscending ? '↑' : '↓')}</strong>
              </TableCell>
              <TableCell 
                align="center"
                sx={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('progress')}
              >
                <strong>Svårighet {sortBy === 'progress' && (sortAscending ? '↑' : '↓')}</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Lägg till</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSortedFiles().map((file) => {
              const learnedCount = getLearnedWordsCount(file.gloss_ids);
              const percentage = getLearnedPercentage(file.gloss_ids);
              
              return (
                <TableRow 
                  key={file.filename}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    markAsWatched(file.filename);
                    setSelectedKorpus(file);
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {file.title}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {getWatchedText(watchedVideos[file.filename])}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      {/* En avlång ruta med färg baserat på svårighet */}
                      <Box 
                        sx={{ 
                          width: 80, 
                          height: 24, 
                          borderRadius: 1,
                          bgcolor: getDifficultyColor(percentage),
                          transition: 'background-color 0.3s ease'
                        }} 
                      />
                      {/* Antal lärda / totalt */}
                      <Typography variant="caption" color="text.secondary">
                        {learnedCount}/{file.gloss_count}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="success" 
                      onClick={(e) => handleAddWordsClick(file, e)}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'success.50',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Add sx={{ fontSize: 28 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bekräftelse-dialog för att lägga till ord */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, file: null })}
      >
        <DialogTitle>Lägg till ord från korpus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vill du lägga alla funna glosor från <strong>"{confirmDialog.file?.title}"</strong> i listan över ord du vill lära dig?
          </DialogContentText>
          {confirmDialog.file && (() => {
            // Räkna hur många ord som faktiskt kommer att läggas till
            const wordsToAdd = confirmDialog.file.gloss_ids.filter(wordId => {
              const progress = wordProgress[wordId];
              return !progress || progress.level < 2; // Inte lärda
            }).length;
            
            return (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {wordsToAdd} glosor kommer att läggas till.
              </Typography>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, file: null })}>
            Nej
          </Button>
          <Button onClick={handleConfirmAddWords} variant="contained" color="success" autoFocus>
            Ja, lägg till
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KorpusPage;
