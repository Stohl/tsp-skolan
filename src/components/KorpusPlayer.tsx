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
  
  // Settings för vilka tiers som ska visas
  const [showTiers, setShowTiers] = useState({
    dh: true,      // Dominant Hand
    nonDh: true,   // Non-Dominant Hand
    translation: true  // Översättning
  });
  
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

  // Auto-scroll till aktiv annotation när tiden ändras
  useEffect(() => {
    // Använd requestAnimationFrame för att säkerställa att DOM är uppdaterad
    const scrollToActive = () => {
      if (!annotationContainerRef.current) return;
      
      const activeElement = annotationContainerRef.current.querySelector('.annotation-active');
      
      if (activeElement && !isUserScrolling.current) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    
    // Vänta tills nästa frame för att säkerställa att DOM är uppdaterad
    requestAnimationFrame(scrollToActive);
  }, [currentTime, annotationGroups]);

  // Track om användaren scrollar manuellt
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Lyssna på scroll-events för att synka video med synlig annotation
  useEffect(() => {
    const container = annotationContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Markera att användaren scrollar
      isUserScrolling.current = true;

      // Rensa tidigare timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Efter 500ms utan scrolling, hitta synlig annotation och hoppa videon dit
      scrollTimeout.current = setTimeout(() => {
        isUserScrolling.current = false;
        
        // Hitta annotation i mitten av viewporten
        const containerRect = container.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;

        // Hitta alla annotation-element
        const annotationElements = Array.from(container.querySelectorAll('[data-start-time]'));
        
        // Hitta den annotation som är närmast centrum
        let closestElement: HTMLElement | null = null;
        let closestDistance = Infinity;

        annotationElements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          const rect = htmlElement.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const distance = Math.abs(elementCenter - centerY);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestElement = htmlElement;
          }
        });

        // Om vi hittat en annotation, hoppa videon dit
        if (closestElement) {
          const startTimeStr = (closestElement as HTMLElement).getAttribute('data-start-time');
          if (startTimeStr && videoRef.current) {
            const startTime = parseFloat(startTimeStr);
            if (!isNaN(startTime)) {
              videoRef.current.currentTime = startTime;
            }
          }
        }
      }, 500); // Vänta 500ms efter scroll innan vi synkar
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [annotationGroups]);

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
        />
      </Box>

      {/* Annotations */}
      <Box
        ref={annotationContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Annoteringar
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Aktuell tid: {formatTime(currentTime)}
          </Typography>
        </Box>
        
        {annotationGroups.map((group, groupIndex) => {
          const startTime = Math.min(...group.map(a => a.start_time));
          const endTime = Math.max(...group.map(a => a.end_time));
          const isActive = currentTime >= startTime && currentTime <= endTime;
          
          // Gruppera annoteringar per tier
          const dhAnnotations = group.filter(a => a.tier_name.includes('Glosa_DH'));
          const nonDhAnnotations = group.filter(a => a.tier_name.includes('Glosa_NonDH'));
          const translationAnnotations = group.filter(a => a.tier_name.includes('Översättning'));
          
          return (
            <Paper
              key={groupIndex}
              className={isActive ? 'annotation-active' : ''}
              data-start-time={startTime}
              sx={{
                p: 1.5,
                mb: 1,
                cursor: 'pointer',
                border: 1,
                borderColor: isActive ? 'primary.main' : 'divider',
                bgcolor: isActive ? 'action.selected' : 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'primary.light'
                }
              }}
              onClick={() => seekToTime(startTime)}
            >
              {/* Header: Tidsstämpel och AKTIV badge */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {formatTime(startTime)} - {formatTime(endTime)}
                </Typography>
                {isActive && (
                  <Chip
                    label="AKTIV"
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>

              {/* Två-kolumners layout */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: showTiers.translation ? '1fr 1fr' : '1fr',
                gap: 2
              }}>
                {/* Vänster kolumn: Glosor (DH och NonDH) */}
                <Box>
                  {/* DH Annotations */}
                  {showTiers.dh && dhAnnotations.length > 0 && (
                    <Box sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        DH:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {dhAnnotations.map(a => a.value).join(' · ')}
                      </Typography>
                    </Box>
                  )}

                  {/* NonDH Annotations */}
                  {showTiers.nonDh && nonDhAnnotations.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        NonDH:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {nonDhAnnotations.map(a => a.value).join(' · ')}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Höger kolumn: Översättning */}
                {showTiers.translation && translationAnnotations.length > 0 && (
                  <Box sx={{ 
                    borderLeft: showTiers.dh || showTiers.nonDh ? 1 : 0,
                    borderColor: 'divider',
                    pl: showTiers.dh || showTiers.nonDh ? 2 : 0
                  }}>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                      {translationAnnotations.map(a => a.value).join(' ')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default KorpusPlayer;
