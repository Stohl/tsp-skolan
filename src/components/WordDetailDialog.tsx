import React, { useRef } from 'react';
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
import { OpenInNew, CheckCircle } from '@mui/icons-material';
import { Word, Phrase, getVideoUrl } from '../types/database';

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
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!word) return null;

  // Funktion som körs när användaren klickar på lexikonlänken
  const handleLexikonClick = () => {
    const anyWord: any = word as any;
    const LEX_BASE = 'https://teckensprakslexikon.su.se';
    // Öppna ordets externa URL om den finns (säkerställ absolut URL), annars fallback: video_url
    if (anyWord.url && typeof anyWord.url === 'string' && anyWord.url.trim().length > 0) {
      const raw = anyWord.url.trim();
      const absoluteUrl = raw.startsWith('http://') || raw.startsWith('https://')
        ? raw
        : `${LEX_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
      window.open(absoluteUrl, '_blank');
    } else if (word.video_url) {
      window.open(getVideoUrl(word.video_url), '_blank');
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
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleProgressClick}
            aria-label="Lärd"
            title="Lärd"
          >
            <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
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
      fullScreen={false}
      disableEscapeKeyDown={false}
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh',
          margin: 'auto',
          '@media (max-width: 600px)': {
            margin: '16px',
            maxHeight: 'calc(100vh - 32px)',
            width: 'calc(100% - 32px)',
            position: 'relative !important',
            transform: 'none !important',
            top: 'auto !important',
            left: 'auto !important',
            right: 'auto !important',
            bottom: 'auto !important'
          }
        }
      }}
      sx={{
        '@media (max-width: 600px)': {
          '& .MuiDialog-paper': {
            margin: '16px !important',
            maxHeight: 'calc(100vh - 32px) !important',
            width: 'calc(100% - 32px) !important',
            position: 'relative !important',
            transform: 'none !important',
            top: 'auto !important',
            left: 'auto !important',
            right: 'auto !important',
            bottom: 'auto !important'
          },
          '& .MuiDialog-container': {
            alignItems: 'flex-start !important',
            justifyContent: 'center !important',
            paddingTop: '20px !important'
          }
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            {word.ord}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Status:
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
              ref={videoRef}
              controls
              autoPlay
              muted
              playsInline
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                }
              }}
              style={{ 
                width: '100%', 
                height: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              <source src={getVideoUrl(word.video_url)} type="video/mp4" />
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


        {/* Förekomster */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Förekomster
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lexikonet: {word.förekomster.Lexikonet}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
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
