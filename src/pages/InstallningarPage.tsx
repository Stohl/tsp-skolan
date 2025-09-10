import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  Container
} from '@mui/material';
import { 
  Settings,
  Notifications,
  VolumeUp,
  Brightness4,
  Language,
  Help,
  Info
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

// Inställningar-sidan - här kommer användare att kunna anpassa appen
const InstallningarPage: React.FC = () => {
  // Hämta tema-funktionalitet från Theme Context
  const { mode, toggleTheme } = useTheme();

  return (
    // Container som centrerar innehållet och ger padding
    <Container maxWidth="sm" sx={{ py: 3 }}>

      {/* Ikon för sidan */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Settings sx={{ fontSize: 60, color: 'primary.main' }} />
      </Box>

      {/* Lista med inställningsalternativ */}
      <Card>
        <List>
          {/* Notifikationer */}
          <ListItem>
            <ListItemIcon>
              <Notifications />
            </ListItemIcon>
            <ListItemText 
              primary="Notifikationer" 
              secondary="Få påminnelser om att öva"
            />
            <Switch edge="end" />
          </ListItem>
          
          <Divider />
          
          {/* Ljud */}
          <ListItem>
            <ListItemIcon>
              <VolumeUp />
            </ListItemIcon>
            <ListItemText 
              primary="Ljud" 
              secondary="Spela ljud vid rätt svar"
            />
            <Switch edge="end" defaultChecked />
          </ListItem>
          
          <Divider />
          
          {/* Mörkt tema */}
          <ListItem>
            <ListItemIcon>
              <Brightness4 />
            </ListItemIcon>
            <ListItemText 
              primary="Mörkt tema" 
              secondary={mode === 'dark' ? 'Mörkt tema aktiverat' : 'Använd mörk bakgrund'}
            />
            <Switch 
              edge="end" 
              checked={mode === 'dark'}
              onChange={toggleTheme}
            />
          </ListItem>
          
          <Divider />
          
          {/* Språk */}
          <ListItem>
            <ListItemIcon>
              <Language />
            </ListItemIcon>
            <ListItemText 
              primary="Språk" 
              secondary="Svenska"
            />
          </ListItem>
        </List>
      </Card>

      {/* Ytterligare inställningskategorier */}
      <Box sx={{ mt: 3 }}>
        <Card>
          <List>
            {/* Hjälp */}
            <ListItem button>
              <ListItemIcon>
                <Help />
              </ListItemIcon>
              <ListItemText 
                primary="Hjälp" 
                secondary="Få hjälp med att använda appen"
              />
            </ListItem>
            
            <Divider />
            
            {/* Om appen */}
            <ListItem button>
              <ListItemIcon>
                <Info />
              </ListItemIcon>
              <ListItemText 
                primary="Om TSP Skolan" 
                secondary="Version 1.0.0"
              />
            </ListItem>
          </List>
        </Card>
      </Box>

      {/* Platshållare för framtida inställningar */}
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kommande funktioner
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fler inställningsalternativ kommer att läggas till i framtida versioner.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default InstallningarPage;
