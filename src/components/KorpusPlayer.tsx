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
  
  // Settings för vilka tiers som ska visas i varje kolumn (med localStorage)
  const [leftTiers, setLeftTiers] = useState<string[]>(() => {
    const saved = localStorage.getItem('korpus_left_tiers');
    return saved ? JSON.parse(saved) : ['Glosa_DH S1', 'Glosa_NonDH S1'];
  });
  
  const [rightTiers, setRightTiers] = useState<string[]>(() => {
    const saved = localStorage.getItem('korpus_right_tiers');
    return saved ? JSON.parse(saved) : ['Översättning S1'];
  });
  
  const [leftSticky, setLeftSticky] = useState(() => {
    const saved = localStorage.getItem('korpus_left_sticky');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [rightSticky, setRightSticky] = useState(() => {
    const saved = localStorage.getItem('korpus_right_sticky');
    return saved ? JSON.parse(saved) : true;
  });

  // State för att dölja översättningar (test-läge)
  const [hideTranslations, setHideTranslations] = useState(() => {
    const saved = localStorage.getItem('korpus_hide_translations');
    return saved ? JSON.parse(saved) : false;
  });

  // State för att hålla koll på vilka översättningar som har visats
  const [revealedAnnotations, setRevealedAnnotations] = useState<Set<string>>(new Set());
  
  // Spara inställningar till localStorage när de ändras
  useEffect(() => {
    localStorage.setItem('korpus_left_tiers', JSON.stringify(leftTiers));
  }, [leftTiers]);
  
  useEffect(() => {
    localStorage.setItem('korpus_right_tiers', JSON.stringify(rightTiers));
  }, [rightTiers]);
  
  useEffect(() => {
    localStorage.setItem('korpus_left_sticky', JSON.stringify(leftSticky));
  }, [leftSticky]);
  
  useEffect(() => {
    localStorage.setItem('korpus_right_sticky', JSON.stringify(rightSticky));
  }, [rightSticky]);

  useEffect(() => {
    localStorage.setItem('korpus_hide_translations', JSON.stringify(hideTranslations));
  }, [hideTranslations]);
  
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

  // Pausa videon när översättning når end_time (om hideTranslations är aktivt)
  useEffect(() => {
    if (!hideTranslations || !videoRef.current || !korpusData) return;
    
    const video = videoRef.current;
    const allAnnotations = Object.values(korpusData.annotations).flat();
    
    // Hitta vilka översättningar som visas i kolumnerna
    const visibleTranslationTiers = [
      ...leftTiers.filter(t => t.includes('Översättning')),
      ...rightTiers.filter(t => t.includes('Översättning'))
    ];
    
    // Hitta översättning som just nått end_time
    const justEndedTranslation = allAnnotations.find(a =>
      visibleTranslationTiers.includes(a.tier_name) &&
      !revealedAnnotations.has(a.annotation_id) &&
      Math.abs(currentTime - a.end_time) < 0.15 // Litet tidsfönster
    );
    
    if (justEndedTranslation && isPlaying) {
      video.pause();
    }
  }, [currentTime, hideTranslations, korpusData, leftTiers, rightTiers, revealedAnnotations, isPlaying]);

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
    // Visa alltid alla annotations - vi filtrerar vid rendering istället
    return true;
  };

  // Visa en dold översättning
  const revealTranslation = (annotationId: string) => {
    setRevealedAnnotations(prev => new Set(prev).add(annotationId));
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

  // Memoize annotation groups och uppdatera när korpusData ändras
  const annotationGroups = useMemo(() => {
    if (!korpusData) return [];
    return getAllAnnotationsGrouped();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [korpusData]);

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
            </Box>
          </Box>
          <IconButton onClick={() => setShowSettings(!showSettings)}>
            <SettingsIcon />
          </IconButton>
        </Box>
        
        {/* Settings panel */}
        <Collapse in={showSettings}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              {/* Vänster kolumn inställning */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Vänster kolumn:
                </Typography>
                <FormGroup>
                  {korpusData?.tiers.map((tier) => (
                    <FormControlLabel
                      key={`left-${tier.tier_id}`}
                      control={
                        <Switch
                          checked={leftTiers.includes(tier.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLeftTiers([...leftTiers, tier.name]);
                            } else {
                              setLeftTiers(leftTiers.filter(t => t !== tier.name));
                            }
                          }}
                        />
                      }
                      label={tier.name}
                    />
                  ))}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={leftSticky}
                        onChange={(e) => setLeftSticky(e.target.checked)}
                      />
                    }
                    label="Sticky (häng kvar)"
                    sx={{ mt: 1, fontWeight: 'bold' }}
                  />
                </FormGroup>
              </Box>

              {/* Höger kolumn inställning */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Höger kolumn:
                </Typography>
                <FormGroup>
                  {korpusData?.tiers.map((tier) => (
                    <FormControlLabel
                      key={`right-${tier.tier_id}`}
                      control={
                        <Switch
                          checked={rightTiers.includes(tier.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRightTiers([...rightTiers, tier.name]);
                            } else {
                              setRightTiers(rightTiers.filter(t => t !== tier.name));
                            }
                          }}
                        />
                      }
                      label={tier.name}
                    />
                  ))}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={rightSticky}
                        onChange={(e) => setRightSticky(e.target.checked)}
                      />
                    }
                    label="Sticky (häng kvar)"
                    sx={{ mt: 1, fontWeight: 'bold' }}
                  />
                </FormGroup>
              </Box>
            </Box>

            {/* Test-läge för översättningar */}
            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={hideTranslations}
                    onChange={(e) => setHideTranslations(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2">
                      Dölj översättningar (test-läge)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Översättningar döljs och videon pausar. Klicka på "_____" för att visa texten.
                    </Typography>
                  </Box>
                }
              />
            </Box>
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
        {/* Två-kolumners layout för glosor och översättningar */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: 3,
          minHeight: videoDuration * 100 // Höjd proportionell till video-längd (100px per sekund)
        }}>
          {/* Vänster kolumn */}
          <Box sx={{ position: 'relative', borderRight: 1, borderColor: 'divider', pr: 2 }}>
            {annotationGroups.map((group, groupIndex) => {
              const startTime = Math.min(...group.map(a => a.start_time));
              const endTime = Math.max(...group.map(a => a.end_time));
              const duration = endTime - startTime;
              const isActive = currentTime >= startTime && currentTime <= endTime;
              
              // Filtrera annotations baserat på valda tiers för vänster kolumn
              const selectedAnnotations = group.filter(a => leftTiers.includes(a.tier_name));
              
              if (selectedAnnotations.length === 0) return null;
              
              const topPosition = (startTime / videoDuration) * videoDuration * 100;
              const height = duration * 100;
              
              // Kontrollera om någon av de valda tiers är översättning
              const isTranslation = selectedAnnotations.some(a => a.tier_name.includes('Översättning'));
              const isHidden = isTranslation && hideTranslations && selectedAnnotations.some(a => !revealedAnnotations.has(a.annotation_id));
              
              return (
                <Box
                  key={`left-${groupIndex}`}
                  className={isActive ? 'annotation-active' : ''}
                  data-start-time={startTime}
                  sx={{
                    position: 'absolute',
                    top: `${topPosition}px`,
                    height: (leftSticky && !isHidden) ? `${height}px` : 'auto',
                    left: 0,
                    right: 0,
                    borderLeft: 3,
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    bgcolor: isActive ? 'action.selected' : 'transparent'
                  }}
                >
                  <Box sx={{
                    position: (leftSticky && !isHidden) ? 'sticky' : 'static',
                    top: 0,
                    py: 0.5,
                    pl: 1
                  }}>
                    <Typography variant="body1" sx={{ 
                      fontSize: isTranslation ? { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' } : { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                      fontStyle: isTranslation ? 'italic' : 'normal',
                      fontWeight: isTranslation ? 'normal' : 500,
                      color: isTranslation ? 'text.secondary' : 'text.primary',
                      lineHeight: 1.5,
                      cursor: isTranslation && hideTranslations ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={(e) => {
                      if (isTranslation && hideTranslations) {
                        e.stopPropagation();
                        selectedAnnotations.forEach(a => revealTranslation(a.annotation_id));
                      }
                    }}
                    >
                      {isTranslation && hideTranslations && selectedAnnotations.some(a => !revealedAnnotations.has(a.annotation_id)) ? (
                        '_____________________'
                      ) : (
                        selectedAnnotations.map(a => a.value).join(' ').split('+').map((part, idx, arr) => (
                          <React.Fragment key={idx}>
                            {part}
                            {idx < arr.length - 1 && '+'}
                            {idx < arr.length - 1 && <br />}
                          </React.Fragment>
                        ))
                      )}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Höger kolumn */}
          <Box sx={{ position: 'relative' }}>
            {annotationGroups.map((group, groupIndex) => {
              const startTime = Math.min(...group.map(a => a.start_time));
              const endTime = Math.max(...group.map(a => a.end_time));
              const duration = endTime - startTime;
              const isActive = currentTime >= startTime && currentTime <= endTime;
              
              // Filtrera annotations baserat på valda tiers för höger kolumn
              const selectedAnnotations = group.filter(a => rightTiers.includes(a.tier_name));
              
              if (selectedAnnotations.length === 0) return null;
              
              const topPosition = (startTime / videoDuration) * videoDuration * 100;
              const height = duration * 100;
              
              // Kontrollera om någon av de valda tiers är översättning
              const isTranslation = selectedAnnotations.some(a => a.tier_name.includes('Översättning'));
              const isHidden = isTranslation && hideTranslations && selectedAnnotations.some(a => !revealedAnnotations.has(a.annotation_id));
              
              return (
                <Box
                  key={`right-${groupIndex}`}
                  className={isActive ? 'annotation-active' : ''}
                  data-start-time={startTime}
                  sx={{
                    position: 'absolute',
                    top: `${topPosition}px`,
                    height: (rightSticky && !isHidden) ? `${height}px` : 'auto',
                    left: 0,
                    right: 0,
                    borderLeft: 3,
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    bgcolor: isActive ? 'action.selected' : 'transparent'
                  }}
                >
                  <Box sx={{
                    position: (rightSticky && !isHidden) ? 'sticky' : 'static',
                    top: 0,
                    py: 0.5,
                    pl: 1
                  }}>
                    <Typography variant="body1" sx={{ 
                      fontSize: isTranslation ? { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' } : { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                      fontStyle: isTranslation ? 'italic' : 'normal',
                      fontWeight: isTranslation ? 'normal' : 500,
                      color: isTranslation ? 'text.secondary' : 'text.primary',
                      lineHeight: 1.5,
                      cursor: isTranslation && hideTranslations ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={(e) => {
                      if (isTranslation && hideTranslations) {
                        e.stopPropagation();
                        selectedAnnotations.forEach(a => revealTranslation(a.annotation_id));
                      }
                    }}
                    >
                      {isTranslation && hideTranslations && selectedAnnotations.some(a => !revealedAnnotations.has(a.annotation_id)) ? (
                        '_____________________'
                      ) : (
                        selectedAnnotations.map(a => a.value).join(' ').split('+').map((part, idx, arr) => (
                          <React.Fragment key={idx}>
                            {part}
                            {idx < arr.length - 1 && '+'}
                            {idx < arr.length - 1 && <br />}
                          </React.Fragment>
                        ))
                      )}
                    </Typography>
                  </Box>
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
