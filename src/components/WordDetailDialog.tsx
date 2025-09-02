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
}

// Komponent för att visa detaljerad information om ett ord
const WordDetailDialog: React.FC<WordDetailDialogProps> = ({
  word,
  phrases,
  open,
  onClose
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
        <Typography variant="h5" component="div">
          {word.ord}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
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
