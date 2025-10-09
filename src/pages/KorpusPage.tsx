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
  LinearProgress,
  IconButton,
  Link
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
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
  const { wordProgress } = useWordProgress();
  const [watchedVideos, setWatchedVideos] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<'title' | 'glossCount' | 'watched' | 'progress'>('title');
  const [sortAscending, setSortAscending] = useState(true);

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

  // Färg baserat på procent lärda ord
  const getProgressColor = (percentage: number): 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
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
      {/* Header med tillbaka-knapp */}
      <Box sx={{ mb: 4, textAlign: 'center', position: 'relative' }}>
        <IconButton 
          onClick={onBack} 
          sx={{ 
            position: 'absolute', 
            left: 0, 
            top: '50%', 
            transform: 'translateY(-50%)'
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
                onClick={() => handleSort('glossCount')}
              >
                <strong>Antal glosor {sortBy === 'glossCount' && (sortAscending ? '↑' : '↓')}</strong>
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
                <strong>Framsteg {sortBy === 'progress' && (sortAscending ? '↑' : '↓')}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSortedFiles().map((file) => {
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
                    <Chip label={file.gloss_count} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {getWatchedText(watchedVideos[file.filename])}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        color={getProgressColor(percentage)}
                      />
                      <Typography variant="body2" sx={{ minWidth: 40 }}>
                        {Math.round(percentage)}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default KorpusPage;
