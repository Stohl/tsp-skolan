import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Container
} from '@mui/material';
import { FitnessCenter } from '@mui/icons-material';

// Övning-sidan - här kommer användare att kunna öva teckenspråk
const OvningPage: React.FC = () => {
  return (
    // Container som centrerar innehållet och ger padding
    <Container maxWidth="sm" sx={{ py: 3 }}>
      
      {/* Huvudrubrik för sidan */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          mb: 4,
          color: 'primary.main',
          fontWeight: 'bold'
        }}
      >
        Övning
      </Typography>

      {/* Ikon för sidan */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <FitnessCenter sx={{ fontSize: 60, color: 'primary.main' }} />
      </Box>

      {/* Kort som förklarar vad sidan är för */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Välkommen till övningssidan!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Här kommer du att kunna öva dina teckenspråkskunskaper genom olika 
            interaktiva övningar och spel. Funktioner kommer att läggas till snart.
          </Typography>
        </CardContent>
      </Card>

      {/* Grid med platshållare för framtida övningar */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ordövning
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Öva enskilda ord och tecken
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meningar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Öva att teckna hela meningar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quiz
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Testa dina kunskaper med quiz
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lär dig genom spel och utmaningar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OvningPage;
