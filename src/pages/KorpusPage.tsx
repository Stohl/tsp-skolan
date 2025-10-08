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
  IconButton
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          Berättelser
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Välj en video att titta på.
      </Typography>

      {/* Statistik */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Korpus-statistik
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Chip label={`${korpusData.total_files} filer`} color="primary" />
          <Chip label={`${korpusData.total_unique_glosses} unika glosor`} color="secondary" />
          <Chip label={`${korpusData.matched_glosses} matchade glosor`} color="info" />
          <Chip label={`Uppdaterad: ${korpusData.last_updated}`} variant="outlined" />
        </Box>
      </Box>

      {/* Tabell med korpus-filer */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Titel</strong></TableCell>
              <TableCell><strong>Filnamn</strong></TableCell>
              <TableCell align="center"><strong>Antal glosor</strong></TableCell>
              <TableCell align="center"><strong>Lärda ord</strong></TableCell>
              <TableCell align="center"><strong>Framsteg</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {korpusData.files.map((file) => {
              const learnedCount = getLearnedWordsCount(file.gloss_ids);
              const percentage = getLearnedPercentage(file.gloss_ids);
              
              return (
                <TableRow 
                  key={file.filename}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelectedKorpus(file)}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {file.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {file.filename}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={file.gloss_count} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {learnedCount} / {file.gloss_ids.length}
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
