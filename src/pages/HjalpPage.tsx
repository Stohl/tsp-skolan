import React from 'react';
import { 
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { 
  Help,
  Quiz,
  School,
  Gesture,
  Spellcheck,
  ExpandMore,
  CheckCircle,
  Info,
  Warning,
  ArrowBack,
  Refresh
} from '@mui/icons-material';

// Props interface för HjalpPage
interface HjalpPageProps {
  onBack: () => void;
}

// Hjälpsida - förklarar hur appen fungerar
const HjalpPage: React.FC<HjalpPageProps> = ({ onBack }) => {
  return (
    <>
      {/* Header med tillbaka-knapp */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hjälp & Guide
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', py: 3, pb: 10 }}>
        <Container maxWidth="md">
        {/* Huvudrubrik */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Help sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Hjälp & Guide
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lär dig hur du använder TSP Skolan för att lära dig teckenspråk
          </Typography>
        </Box>

      {/* Snabbguide */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Snabbstart
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="1. Gå till Listor" 
                secondary="Välj en ordlista som passar din nivå"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="2. Markera ord" 
                secondary="Klicka på progress-cirklarna för att markera ord som 'vill lära mig'"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="3. Öva" 
                secondary="Gå till Övning och välj en övningstyp som passar dig"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Svårighetsnivåer */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Svårighetsnivåer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ordlistorna är uppdelade i fyra svårighetsnivåer:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip icon={<span>✋</span>} label="Handstart" color="success" />
            <Chip icon={<span>🤟</span>} label="Fingervana" color="info" />
            <Chip icon={<span>🙌</span>} label="Tecknare" color="warning" />
            <Chip icon={<span>🤝</span>} label="Samspelare" color="error" />
          </Box>

          <List>
            <ListItem>
              <ListItemIcon>
                <span style={{ fontSize: '24px' }}>✋</span>
              </ListItemIcon>
              <ListItemText 
                primary="Handstart" 
                secondary="Allra vanligaste orden - perfekt för nybörjare"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <span style={{ fontSize: '24px' }}>🤟</span>
              </ListItemIcon>
              <ListItemText 
                primary="Fingervana" 
                secondary="Vardagsbegrepp - när du börjar känna dig bekväm"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <span style={{ fontSize: '24px' }}>🙌</span>
              </ListItemIcon>
              <ListItemText 
                primary="Tecknare" 
                secondary="Abstraktare ord och fler rörelsemoment"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <span style={{ fontSize: '24px' }}>🤝</span>
              </ListItemIcon>
              <ListItemText 
                primary="Samspelare" 
                secondary="Komplexa handformer eller mindre vanliga ord"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Övningstyper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Övningstyper
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Olika sätt att öva och lära dig teckenspråk:
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School color="primary" />
                <Typography variant="subtitle1">Kortövning</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Se videon och bedöm om du kunde teckna ordet. Perfekt för snabba repetitioner.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Quiz color="secondary" />
                <Typography variant="subtitle1">Flervalsquiz</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Se videon och välj rätt ord från fyra alternativ. Kräver minst 10 ord för att fungera optimalt.
                <br /><br />
                <strong>💡 Tips:</strong> Om du inte har tillräckligt många ord markerade som "vill lära mig", 
                så kommer quizet automatiskt att lägga till ord som du redan har lärt dig för att skapa variation.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Gesture color="success" />
                <Typography variant="subtitle1">Teckna</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Se ordet och teckna det själv. Sedan kan du kolla videon för att se om du tecknade rätt.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Spellcheck color="warning" />
                <Typography variant="subtitle1">Bokstavering</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Se videon och välj rätt bokstavssekvens. Olika längder för olika svårighetsnivåer.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Flervalsquiz förklaring */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🧠 Flervalsquiz - Så fungerar det
          </Typography>
          
          <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              <Info sx={{ verticalAlign: 'middle', mr: 1 }} />
              Viktigt att veta om flervalsquizet:
            </Typography>
          </Box>

          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Minst 10 ord krävs" 
                secondary="Quizet behöver minst 10 ord för att kunna skapa varierade frågor med fyra alternativ"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Smart ordval" 
                secondary="Om du har färre än 10 ord markerade som 'vill lära mig', så lägger quizet automatiskt till ord som du redan har lärt dig"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Prioritering" 
                secondary="Ord som du vill lära dig prioriteras över ord du redan kan"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Tydlig feedback" 
                secondary="Om du försöker starta quiz med för få ord får du ett meddelande som förklarar vad som behövs"
              />
            </ListItem>
          </List>

          <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1, mt: 2 }}>
            <Typography variant="body2">
              <strong>💡 Pro tip:</strong> Markera fler ord som "vill lära mig" eller "lärda" 
              för att få bättre variation i quizet!
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Progress system */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Progress & Poäng
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Så fungerar progress-systemet:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <span style={{ fontSize: '20px' }}>⚪</span>
              </ListItemIcon>
              <ListItemText 
                primary="⚪ Ej markerad" 
                secondary="Ordet har inte markerats än"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <span style={{ fontSize: '20px' }}>🟡</span>
              </ListItemIcon>
              <ListItemText 
                primary="🟡 Vill lära mig" 
                secondary="Du vill lära dig detta ord"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <span style={{ fontSize: '20px' }}>🟢</span>
              </ListItemIcon>
              <ListItemText 
                primary="🟢 Lärt mig" 
                secondary="Du har lärt dig ordet (5 poäng)"
              />
            </ListItem>
          </List>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Poängsystem:</strong> +1 för rätt svar, -1 för fel svar. När du når 5 poäng markeras ordet som "lärt mig".
          </Typography>
        </CardContent>
      </Card>

      {/* Nollställ funktion */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔄 Nollställ allt
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Om du vill börja om från början eller rensa all sparad data:
          </Typography>
          
          <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2">
              <Warning sx={{ verticalAlign: 'middle', mr: 1 }} />
              <strong>Viktigt:</strong> Denna funktion tar bort ALL sparad data permanent!
            </Typography>
          </Box>

          <List>
            <ListItem>
              <ListItemIcon>
                <Refresh color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Gå till Inställningar" 
                secondary="Klicka på 'Nollställ allt' längst ner i inställningslistan"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Bekräfta åtgärden" 
                secondary="Du får en varning om vad som kommer att hända"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Allt nollställs" 
                secondary="Alla ordlistor, progress och inställningar rensas"
              />
            </ListItem>
          </List>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Vad som nollställs:</strong>
            <br />• Alla ordlistor och progress (⚪🟡🟢)
            <br />• Alla inställningar (tema, notifikationer, etc.)
            <br />• All sparad data i appen
            <br />• Appen startar om från början
          </Typography>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💡 Tips för bästa resultat
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="🎯 Börja med Handstart" 
                secondary="Börja alltid med de enklaste orden för att bygga grunden"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="📚 Använd Lexikonet" 
                secondary="Sök efter ord du inte känner igen för att lära dig mer"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="🔄 Öva regelbundet" 
                secondary="Korta, regelbundna övningar är bättre än långa sessioner"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="🎨 Växla övningstyper" 
                secondary="Använd olika övningstyper för att hålla det intressant"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
        </Container>
      </Box>
    </>
  );
};

export default HjalpPage;
