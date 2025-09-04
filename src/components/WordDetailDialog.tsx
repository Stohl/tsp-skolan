import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Link
} from '@mui/material';
import { PlayArrow, OpenInNew } from '@mui/icons-material';
import { Word, Phrase } from '../types/database';

// Interface för props
interface WordDetailDialogProps {
  word: Word | null;
  phrases: Phrase[];
  open: boolean;
  onClose: () => void;
  wordProgress?: number;
  onProgressChange?: (wordId: string, newLevel: number) => void;
}

// Komponent för att visa detaljerad information om ett ord
const WordDetailDialog: React.FC<WordDetailDialogProps> = ({
  word,
  phrases,
  open,
  onClose,
  wordProgress = 0,
  onProgressChange
}) => {
  if (!word) return null;

  // Funktion som körs när användaren klickar på videolänken
  const handleVideoClick = () => {
    if (word.video_url) {
      window.open(word.video_url, '_blank');
    }
  };

  // Funktion som körs när användaren klickar på lexikonlänken
  const handleLexikonClick = () => {
    if (word.url) {
      window.open(word.url, '_blank');
    }
  };

  // Funktion som körs när användaren klickar på progress-cirkeln
  const handleProgressClick = () => {
    if (onProgressChange) {
      const newLevel = (wordProgress + 1) % 3; // Cyklar mellan 0, 1, 2
      onProgressChange(word.id, newLevel);
    }
  };

  // Funktion som renderar progress-cirkel
  const renderProgressCircle = () => {
    const circleStyle = {
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: '2px solid',
      transition: 'all 0.2s ease',
      fontSize: '18px',
      '&:hover': {
        transform: 'scale(1.1)'
      }
    };

    switch (wordProgress) {
      case 0: // Ej markerad
        return (
          <Box
            sx={{
              ...circleStyle,
              backgroundColor: 'transparent',
              borderColor: 'grey.400',
              color: 'grey.400'
            }}
            onClick={handleProgressClick}
          >
            ⚪
          </Box>
        );
      case 1: // Vill lära sig
        return (
          <Box
            sx={{
              ...circleStyle,
              backgroundColor: 'yellow.200',
              borderColor: 'yellow.600',
              color: 'yellow.800'
            }}
            onClick={handleProgressClick}
          >
            🟡
          </Box>
        );
      case 2: // Lärt sig
        return (
          <Box
            sx={{
              ...circleStyle,
              backgroundColor: 'green.200',
              borderColor: 'green.600',
              color: 'green.800'
            }}
            onClick={handleProgressClick}
          >
            🟢
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            {word.ord}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress:
            </Typography>
            {renderProgressCircle()}
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Video högst upp */}
        {word.video_url && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <video
              controls
              autoPlay
              muted
              style={{ 
                width: '100%', 
                maxWidth: '400px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              <source src={word.video_url} type="video/mp4" />
              Din webbläsare stöder inte video-elementet.
            </video>
          </Box>
        )}

        {/* Beskrivning */}
        {word.beskrivning && word.beskrivning.trim() && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Beskrivning
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {word.beskrivning}
            </Typography>
          </Box>
        )}

        {/* Formbeskrivning */}
        {word.formbeskrivning && word.formbeskrivning.trim() && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hur man tecknar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {word.formbeskrivning}
            </Typography>
          </Box>
        )}

        {/* Ämnen */}
        {word.ämne && word.ämne.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kategorier
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {word.ämne.map((ämne) => (
                <Chip key={ämne} label={ämne} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* Exempel */}
        {((word.exempel && word.exempel.primära && word.exempel.primära.length > 0) || 
          (word.exempel && word.exempel.sekundära && word.exempel.sekundära.length > 0)) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Exempel
            </Typography>
            {word.exempel && word.exempel.primära && word.exempel.primära.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Primära exempel:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {word.exempel.primära.join(', ')}
                </Typography>
              </Box>
            )}
            {word.exempel && word.exempel.sekundära && word.exempel.sekundära.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Sekundära exempel:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {word.exempel.sekundära.join(', ')}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Fras-exempel */}
        {phrases.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Fras-exempel ({phrases.length})
            </Typography>
            {phrases.slice(0, 3).map((phrase, index) => (
              <Box key={phrase.id} sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {phrase.fras}
                </Typography>
                <Link
                  href={phrase.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                >
                  <PlayArrow fontSize="small" />
                  Se video
                </Link>
                {index < Math.min(phrases.length, 3) - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))}
          </Box>
        )}

        {/* Förekomster */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Förekomster
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lexikonet: {word.förekomster.Lexikonet} | Enkäter: {word.förekomster.Enkäter}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleVideoClick}
          startIcon={<PlayArrow />}
          variant="contained"
          color="primary"
        >
          Se video
        </Button>
        <Button 
          onClick={handleLexikonClick}
          startIcon={<OpenInNew />}
          variant="outlined"
        >
          Öppna i lexikon
        </Button>
        <Button onClick={onClose} color="inherit">
          Stäng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WordDetailDialog;
