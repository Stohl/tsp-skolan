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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Link
} from '@mui/material';
import { 
  ExpandMore,
  CheckCircle,
  ArrowBack,
  School,
  Timer,
  Refresh
} from '@mui/icons-material';

// Props interface för HjalpPage
interface HjalpPageProps {
  onBack: () => void;
}

// Hjälpsida - förklarar hur appen fungerar
const HjalpPage: React.FC<HjalpPageProps> = ({ onBack }) => {
  return (
    <Box sx={{ minHeight: '100vh', py: 3 }}>
      <Container maxWidth="md">
        {/* Header med tillbaka-knapp */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Hjälp & Guide
          </Typography>
        </Box>

        {/* Välkomsttext */}
        <Card sx={{ mb: 3, bgcolor: 'primary.50', borderColor: 'primary.main', border: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              👋 Välkommen till TSP Skolan!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              TSP Skolan hjälper dig att lära dig svenskt teckenspråk genom varierade övningar, 
              meningar och riktiga berättelser. Materialet kommer från Teckenspråkslexikon vid 
              Stockholms Universitet.
            </Typography>
          </CardContent>
        </Card>

        {/* Snabbstart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🚀 Så här kommer du igång
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Typography variant="h6" color="primary.main">1</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Starta övningar" 
                  secondary="Första gången du öppnar appen läggs automatiskt ord till i 'Att lära mig'. Välj en övning (Teckna själv eller Se tecknet) för att börja."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Typography variant="h6" color="primary.main">2</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Öva regelbundet" 
                  secondary="Övningarna består av 10 ord. Svara rätt 5 gånger så flyttas ordet till 'Lärda ord'."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Typography variant="h6" color="primary.main">3</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Utforska mer" 
                  secondary="När du lärt dig tillräckligt många ord låses meningar och berättelser upp automatiskt!"
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
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  🙌 Teckna själv
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Du ser ordet (t.ex. "HUND"). Du har några sekunder på dig att teckna själv. 
                  Sedan visas videon automatiskt så du kan jämföra.
                  <br /><br />
                  <strong>Tips:</strong> Du kan ändra hur lång tid du har innan videon visas under Inställningar.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  👀 Se tecknet
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Du ser videon och väljer rätt ord från fyra alternativ. 
                  Perfekt för att träna ordförståelse och igenkänning.
                  <br /><br />
                  <strong>Kräver:</strong> Minst 10 ord i "Att lära mig" eller "Lärda".
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  ✍️ Bokstavering
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Många ord bokstaveras i teckenspråk. Träna på att känna igen bokstäver 
                  i olika hastigheter och längder (2-3 bokstäver → 6+ bokstäver).
                  <br /><br />
                  <strong>Mål:</strong> Klara alla 15 rutor för att bemästra bokstavering!
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  💬 Meningar
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  När du lärt dig tillräckligt många ord blir meningar tillgängliga. 
                  Meningarna är uppdelade i nivåer (N1-N4) baserat på svårighetsgrad.
                  <br /><br />
                  <strong>Smart funktion:</strong> Appen visar vilka 3 ord som skulle ge dig flest nya meningar att öva på!
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  🎥 Berättelser
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Titta på riktiga berättelser från STS-korpus med annoteringar (glosor och översättningar). 
                  Du kan välja vilka annoteringar du vill se och göra dem "sticky" för enklare läsning.
                  <br /><br />
                  <strong>Test-läge:</strong> Dölj översättningar och pausa automatiskt för att testa din förståelse!
                </Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Progress-system */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Hur ord-systemet fungerar
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Typography variant="h6" color="text.secondary">0</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Omarkerade ord (Level 0)" 
                  secondary="Ord som finns i databasen men som du inte har börjat öva på än."
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Typography variant="h6" color="primary.main">1</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Att lära mig (Level 1)" 
                  secondary="Ord som du aktivt övar på. Dessa visas i övningarna."
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Typography variant="h6" color="success.main">2</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Lärda ord (Level 2)" 
                  secondary="Ord du behärskar! De repeteras ibland för att du inte ska glömma dem."
                />
              </ListItem>
            </List>

            <Box sx={{ bgcolor: 'info.50', p: 2, borderRadius: 1, mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Poängsystem (Normal mode):</strong>
                <br />• Rätt svar = +1 poäng
                <br />• Fel svar = -1 poäng
                <br />• Vid 5 poäng → Ordet flyttas till "Lärda ord" 🎉
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Inställningar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⚙️ Viktiga inställningar
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  <Refresh sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                  Repetition av lärda ord
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Bestäm hur många lärda ord (0-5) som ska repeteras i varje övning. 
                  Detta hjälper dig att inte glömma ord du redan lärt dig.
                  <br /><br />
                  <strong>Rekommendation:</strong> 2 ord är en bra balans mellan nya och gamla ord.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  <Timer sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                  Tid innan video (Teckna själv)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Bestäm hur många sekunder (0-5) du har på dig att teckna innan videon visas.
                  <br /><br />
                  • 0 sekunder = videon visas direkt (som "Se tecknet")
                  <br />• 3 sekunder = standard, lagom tid att teckna
                  <br />• 5 sekunder = mer tid att fundera och teckna
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  🔥 Kör så det ryker! (Turbo mode)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Aktivera detta för <strong>snabbare inlärning</strong>:
                  <br /><br />
                  • ✅ Rätt svar = Direkt till "Lärda ord" (utan poängsystem)
                  <br />• ❌ Fel svar = Direkt till "Att lära mig" (om det inte redan är där)
                  <br /><br />
                  <strong>Varning:</strong> Detta är mer aggressivt än normalt läge. 
                  Använd om du känner dig säker på orden!
                </Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Knappar och funktioner */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔘 Knappar och funktioner
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Placera i lärda ord (grön knapp)" 
                  secondary="Flyttar ordet direkt till 'Lärda ord' om du redan kan det. Hoppar över poängsystemet."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Typography sx={{ fontSize: 24 }}>➕</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Lägg till ord från berättelser" 
                  secondary="I Berättelser-listan kan du klicka på gröna '+' för att lägga alla glosor från en video i 'Att lära mig'."
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Popup-rutan */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💡 Popup-rutan för nya ord
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              När du har färre än 20 ord i "Att lära mig" kan en popup-ruta dyka upp som föreslår 
              nya ordlistor att lägga till.
            </Typography>
            
            <Box sx={{ bgcolor: 'info.50', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Rubriken ändras:</strong>
                <br />• "Dags att komma igång!" (om du har 0 lärda ord)
                <br />• "Du har lärt dig X ord!" (om du har lärda ord)
                <br /><br />
                <strong>Tips:</strong> Du kan stänga av popup-rutan i Inställningar om du vill välja ordlistor själv.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Tips för bästa resultat */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💡 Tips för bästa resultat
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="🎯 Börja med grunderna" 
                  secondary="Följ ordlistornas prioritet - de första ordlistorna innehåller ord som bygger meningar."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="🔄 Öva regelbundet" 
                  secondary="Korta, dagliga övningar är effektivare än långa sessioner."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="🎨 Variera övningarna" 
                  secondary="Växla mellan 'Teckna själv', 'Se tecknet', och 'Meningar' för variation."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="📚 Använd Lexikonet" 
                  secondary="Sök efter ord du är nyfiken på och lägg dem till 'Att lära mig'."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="🎥 Titta på berättelser" 
                  secondary="När du lärt dig fler ord, utforska Berättelser för att se teckenspråk i verkliga sammanhang."
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Nollställning */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔄 Nollställ allt
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Hittar du under <strong>Inställningar → Nollställ allt</strong>
            </Typography>
            
            <Box sx={{ bgcolor: 'error.50', p: 2, borderRadius: 1, borderColor: 'error.main', border: 1 }}>
              <Typography variant="body2" sx={{ color: 'error.dark', fontWeight: 600 }}>
                ⚠️ Varning: Detta raderar ALL data permanent!
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                • Alla ord i "Att lära mig" och "Lärda"
                <br />• All övningshistorik och progress
                <br />• Alla inställningar
                <br />• Bokstavering-framsteg
                <br />• Korpus-visningshistorik
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Vanliga frågor */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ❓ Vanliga frågor
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Varför ser jag samma ord flera gånger?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Många ord har flera varianter (olika sätt att teckna samma ord). 
                  Appen visar alla varianter så du lär dig olika sätt att teckna.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Hur många ord behöver jag för meningar?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Det varierar! Vissa meningar kräver bara 2-3 ord, andra kräver fler. 
                  När du lärt dig tillräckligt många ord för en mening blir den automatiskt tillgänglig.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Vad är skillnaden mellan Turbo mode och Normal mode?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  <strong>Normal mode:</strong> Du behöver svara rätt 5 gånger (5 poäng) innan ett ord flyttas till "Lärda".
                  <br /><br />
                  <strong>Turbo mode:</strong> Ett rätt svar = direkt till "Lärda". Ett fel svar = direkt till "Att lära mig". 
                  Mycket snabbare men mer aggressivt!
                </Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Information om källa och licens */}
        <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
            Tack till Stockholms Universitet och{' '}
            <Link href="https://teckensprakslexikon.su.se" target="_blank" rel="noopener noreferrer">
              teckensprakslexikon.su.se
            </Link>
            {' '}samt{' '}
            <Link href="https://teckensprakskorpus.su.se" target="_blank" rel="noopener noreferrer">
              STS-korpus
            </Link>
            {' '}som gör detta material tillgängligt. Utan det skulle TSP Skolan inte vara möjligt.
            <br />
            Materialet används under{' '}
            <Link href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.sv" target="_blank" rel="noopener noreferrer">
              Creative Commons-licens
            </Link>
            {' '}med stor tacksamhet.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HjalpPage;
