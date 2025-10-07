import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  Collapse,
  Button
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useWordProgress } from '../hooks/usePersistentState';

// Interface för korpus-fil metadata
interface KorpusFile {
  filename: string;
  title: string;
  source_url: string;
  video_url: string;
  json_file: string;
  gloss_count: number;
  gloss_ids: string[];
}

// Interface för annotation
interface Annotation {
  annotation_id: string;
  start_time: number;
  end_time: number;
  duration: number;
  value: string;
  tier_name: string;
}

// Interface för korpus-data
interface KorpusData {
  media_descriptors: {
    media_url: string;
    mime_type: string;
    relative_media_url: string;
    type: string;
  }[];
  tiers: {
    tier_id: string;
    name: string;
    linguistic_type_ref: string;
    participant: string;
    annotator: string;
    default_locale: string;
    parent_ref: string;
  }[];
  annotations: {
    [key: string]: Annotation[];
  };
}

interface KorpusPlayerProps {
  korpusFile: KorpusFile;
  onBack: () => void;
}

const KorpusPlayer: React.FC<KorpusPlayerProps> = ({ korpusFile, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const annotationContainerRef = useRef<HTMLDivElement>(null);
  
  const [korpusData, setKorpusData] = useState<KorpusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  
  // Settings för vilka tiers som ska visas
  const [showTiers, setShowTiers] = useState({
    dh: true,      // Dominant Hand
    nonDh: true,   // Non-Dominant Hand
    translation: true  // Översättning
  });
  
  // Track om användaren scrollar manuellt
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const wasPlayingBeforeScroll = useRef(false);
  const lastProgrammaticScrollTop = useRef(0);
  
  const { wordProgress } = useWordProgress();

  // Ladda korpus-data
  useEffect(() => {
    const loadKorpusData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/korpus/${korpusFile.json_file}`);
        if (!response.ok) {
          throw new Error('Kunde inte ladda korpus-data');
        }
        const data: KorpusData = await response.json();
        setKorpusData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Okänt fel');
      } finally {
        setLoading(false);
      }
    };

    loadKorpusData();
  }, [korpusFile]);

  // Lyssna på video-tid
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [korpusData]); // Lägg till korpusData så listeners sätts upp när videon är laddad

  // Hitta aktiva annoteringar för nuvarande tid
  const getActiveAnnotations = (time: number) => {
    if (!korpusData) return [];
    
    const activeAnnotations: Annotation[] = [];
    
    Object.values(korpusData.annotations).forEach(tierAnnotations => {
      tierAnnotations.forEach(annotation => {
        if (time >= annotation.start_time && time <= annotation.end_time) {
          activeAnnotations.push(annotation);
        }
      });
    });
    
    return activeAnnotations;
  };

  // Hitta alla annoteringar grupperade efter tid
  const getAllAnnotationsGrouped = () => {
    if (!korpusData) return [];
    
    // Samla alla annoteringar från alla tiers
    const allAnnotations: Annotation[] = [];
    Object.values(korpusData.annotations).forEach(tierAnnotations => {
      allAnnotations.push(...tierAnnotations);
    });
    
    // Sortera efter starttid
    allAnnotations.sort((a, b) => a.start_time - b.start_time);
    
    // Gruppera annoteringar som har exakt samma tidsstämpel (samtidiga annoteringar)
    const groups: Annotation[][] = [];
    let currentGroup: Annotation[] = [];
    let currentStartTime: number | null = null;
    
    allAnnotations.forEach(annotation => {
      // Filtrera baserat på tier-inställningar
      if (!shouldShowAnnotation(annotation)) return;
      
      // Om det är samma starttid, lägg till i gruppen
      if (currentStartTime !== null && Math.abs(annotation.start_time - currentStartTime) < 0.01) {
        currentGroup.push(annotation);
      } else {
        // Ny grupp
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [annotation];
        currentStartTime = annotation.start_time;
      }
    });
    
    // Lägg till sista gruppen
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };

  // Kolla om annotation ska visas baserat på tier-inställningar
  const shouldShowAnnotation = (annotation: Annotation): boolean => {
    if (annotation.tier_name.includes('Glosa_DH') && !showTiers.dh) return false;
    if (annotation.tier_name.includes('Glosa_NonDH') && !showTiers.nonDh) return false;
    if (annotation.tier_name.includes('Översättning') && !showTiers.translation) return false;
    return true;
  };

  // Kolla om en annotation är aktiv
  const isAnnotationActive = (annotation: Annotation): boolean => {
    return currentTime >= annotation.start_time && currentTime <= annotation.end_time;
  };

  // Kolla om någon annotation i gruppen är aktiv
  const isGroupActive = (group: Annotation[]): boolean => {
    return group.some(annotation => isAnnotationActive(annotation));
  };

  // Hoppa till specifik tid i videon
  const seekToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Formatera tid (sekunder -> mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Få färg för ord baserat på status
  const getWordColor = (glossValue: string): 'success' | 'warning' | 'default' => {
    // Försök hitta ordet i wordProgress
    // Notera: Detta är förenklat - korpus-glosor kanske inte matchar exakt med ord-id
    const matchingWordId = korpusFile.gloss_ids.find(id => {
      // Här skulle vi behöva en bättre matchning mellan gloss och word id
      return false; // Placeholder
    });
    
    if (matchingWordId && wordProgress[matchingWordId]) {
      const level = wordProgress[matchingWordId].level;
      if (level === 2) return 'success'; // Lärd
      if (level === 1) return 'warning'; // Lärande
    }
    return 'default'; // Omarkerad
  };

  // Memoize annotation groups och uppdatera när korpusData eller showTiers ändras
  const annotationGroups = useMemo(() => {
    if (!korpusData) return [];
    return getAllAnnotationsGrouped();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [korpusData, showTiers]);

  // Kontinuerlig, smooth auto-scroll som synkar med video (använder requestAnimationFrame för jämnhet)
  useEffect(() => {
    if (!videoRef.current || !annotationContainerRef.current || videoDuration === 0) return;

    let animationFrameId: number;
    let isRunning = true;
    let lastScrollTop = 0;

    const smoothScroll = () => {
      const container = annotationContainerRef.current;
      const video = videoRef.current;
      
      if (!container || !video || !isRunning) return;

      // Hoppa över scroll-uppdatering om användaren scrollar manuellt, men fortsätt loopen
      if (isUserScrolling.current) {
        animationFrameId = requestAnimationFrame(smoothScroll);
        return;
      }

      // Beräkna scroll-position baserat på video-tid (kontinuerligt)
      const scrollPercentage = video.currentTime / videoDuration;
      const targetScrollTop = scrollPercentage * (container.scrollHeight - container.clientHeight);

      // Sätt scroll-position endast om den har ändrats (för att undvika onödiga scroll-events)
      if (Math.abs(targetScrollTop - lastScrollTop) > 0.5) {
        container.scrollTop = targetScrollTop;
        lastScrollTop = targetScrollTop;
        lastProgrammaticScrollTop.current = targetScrollTop;
      }

      // Fortsätt loopen
      animationFrameId = requestAnimationFrame(smoothScroll);
    };

    // Starta loopen
    animationFrameId = requestAnimationFrame(smoothScroll);

    // Cleanup
    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [videoDuration, annotationGroups]); // Kör när video är laddad

  // Lyssna på video duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [korpusData]);

  // Sömlös scroll → video synk (endast från manuell scroll)
  useEffect(() => {
    const container = annotationContainerRef.current;
    const video = videoRef.current;
    if (!container || !video || videoDuration === 0) return;

    const handleScroll = () => {
      // Kolla om scrollen kommer från användaren eller från programmatisk uppdatering
      // Om scroll-positionen är nära den senaste programmatiska positionen, ignorera
      const scrollDifference = Math.abs(container.scrollTop - lastProgrammaticScrollTop.current);
      
      if (scrollDifference < 5) {
        // Detta är troligen från programmatisk scroll, ignorera
        return;
      }

      // Om det är första scroll-eventet från användaren, pausa videon om den spelar
      if (!isUserScrolling.current && !video.paused) {
        wasPlayingBeforeScroll.current = true;
        video.pause();
      }

      // Markera att användaren scrollar
      isUserScrolling.current = true;

      // Beräkna video-tid baserat på scroll-position
      const scrollPercentage = container.scrollTop / (container.scrollHeight - container.clientHeight);
      const videoTime = scrollPercentage * videoDuration;

      // Uppdatera video direkt (utan fördröjning)
      if (!isNaN(videoTime)) {
        video.currentTime = videoTime;
      }

      // Efter 500ms utan scrolling, återuppta video om den spelade innan
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        isUserScrolling.current = false;
        
        // Återuppta video om den spelade innan scroll
        if (wasPlayingBeforeScroll.current) {
          video.play();
          wasPlayingBeforeScroll.current = false;
        }
      }, 500);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [videoDuration]);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Laddar korpus...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>Tillbaka</Button>
      </Box>
    );
  }

  if (!korpusData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Ingen korpus-data hittades</Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>Tillbaka</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onBack}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h6">{korpusFile.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {korpusFile.gloss_count} glosor
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setShowSettings(!showSettings)}>
            <SettingsIcon />
          </IconButton>
        </Box>
        
        {/* Settings panel */}
        <Collapse in={showSettings}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Visa annoteringar:
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Switch
                    checked={showTiers.dh}
                    onChange={(e) => setShowTiers({ ...showTiers, dh: e.target.checked })}
                  />
                }
                label="Dominant hand"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showTiers.nonDh}
                    onChange={(e) => setShowTiers({ ...showTiers, nonDh: e.target.checked })}
                  />
                }
                label="Icke-dominant hand"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showTiers.translation}
                    onChange={(e) => setShowTiers({ ...showTiers, translation: e.target.checked })}
                  />
                }
                label="Översättning"
              />
            </FormGroup>
          </Box>
        </Collapse>
      </Paper>

      {/* Video player */}
      <Box sx={{ position: 'relative', bgcolor: 'black' }}>
        <video
          ref={videoRef}
          src={korpusFile.video_url}
          style={{ width: '100%', maxHeight: '50vh', display: 'block' }}
          controls
          playsInline
          webkit-playsinline="true"
        />
      </Box>

      {/* Annotations - Sömlöst textflöde */}
      <Box
        ref={annotationContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          bgcolor: 'background.paper'
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Annoteringar
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTime(currentTime)} / {formatTime(videoDuration)}
          </Typography>
        </Box>
        
        {/* Två-kolumners layout för glosor och översättningar */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: 3,
          minHeight: videoDuration * 100 // Höjd proportionell till video-längd (100px per sekund)
        }}>
          {/* Vänster kolumn: Glosor (DH och NonDH) */}
          <Box sx={{ position: 'relative', borderRight: 1, borderColor: 'divider', pr: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, position: 'sticky', top: 0, bgcolor: 'background.paper', pb: 1 }}>
              Glosor
            </Typography>
            {annotationGroups.map((group, groupIndex) => {
              const startTime = Math.min(...group.map(a => a.start_time));
              const isActive = currentTime >= startTime && currentTime <= startTime + 0.5;
              
              const dhAnnotations = group.filter(a => a.tier_name.includes('Glosa_DH'));
              const nonDhAnnotations = group.filter(a => a.tier_name.includes('Glosa_NonDH'));
              
              // Visa bara om det finns glosa-data
              if (!showTiers.dh && !showTiers.nonDh) return null;
              if (dhAnnotations.length === 0 && nonDhAnnotations.length === 0) return null;
              
              const topPosition = (startTime / videoDuration) * videoDuration * 100;
              
              return (
                <Box
                  key={`gloss-${groupIndex}`}
                  className={isActive ? 'annotation-active' : ''}
                  data-start-time={startTime}
                  sx={{
                    position: 'absolute',
                    top: `${topPosition}px`,
                    left: 0,
                    right: 0,
                    py: 0.5,
                    borderLeft: 3,
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    pl: 1
                  }}
                >
                  {showTiers.dh && dhAnnotations.length > 0 && (
                    <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                      {dhAnnotations.map(a => a.value).join(' ')}
                    </Typography>
                  )}
                  {showTiers.nonDh && nonDhAnnotations.length > 0 && (
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      {nonDhAnnotations.map(a => a.value).join(' ')}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Höger kolumn: Översättningar */}
          <Box sx={{ position: 'relative' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, position: 'sticky', top: 0, bgcolor: 'background.paper', pb: 1 }}>
              Översättning
            </Typography>
            {annotationGroups.map((group, groupIndex) => {
              const startTime = Math.min(...group.map(a => a.start_time));
              const isActive = currentTime >= startTime && currentTime <= startTime + 0.5;
              
              const translationAnnotations = group.filter(a => a.tier_name.includes('Översättning'));
              
              // Visa bara om översättning finns
              if (!showTiers.translation || translationAnnotations.length === 0) return null;
              
              const topPosition = (startTime / videoDuration) * videoDuration * 100;
              
              return (
                <Box
                  key={`trans-${groupIndex}`}
                  className={isActive ? 'annotation-active' : ''}
                  data-start-time={startTime}
                  sx={{
                    position: 'absolute',
                    top: `${topPosition}px`,
                    left: 0,
                    right: 0,
                    py: 0.5,
                    borderLeft: 3,
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    pl: 1
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'text.secondary' }}>
                    {translationAnnotations.map(a => a.value).join(' ')}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default KorpusPlayer;
