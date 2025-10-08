import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  List as ListIcon,
  MenuBook as LexikonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface MainMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: number) => void;
}

/**
 * Huvudmeny-komponent som visas som en drawer från höger sida.
 * Innehåller navigering till Listor, Lexikon och Inställningar.
 */
const MainMenu: React.FC<MainMenuProps> = ({ open, onClose, onNavigate }) => {
  
  // Hantera navigation och stäng menyn
  const handleNavigate = (pageIndex: number) => {
    onNavigate(pageIndex);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '80%', sm: 300 },
          maxWidth: 300
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header med stäng-knapp */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Meny
          </Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Meny-alternativ */}
        <List sx={{ flex: 1, pt: 2 }}>
          {/* Listor */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigate(1)}
              sx={{ 
                mx: 1, 
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemIcon>
                <ListIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Listor" 
                secondary="Hantera ordlistor"
              />
            </ListItemButton>
          </ListItem>

          {/* Lexikon */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigate(2)}
              sx={{ 
                mx: 1, 
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemIcon>
                <LexikonIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Lexikon" 
                secondary="Sök och bläddra"
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1, mx: 2 }} />

          {/* Inställningar */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigate(3)}
              sx={{ 
                mx: 1, 
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemIcon>
                <SettingsIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Inställningar" 
                secondary="Hjälp och inställningar"
              />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            TSP Skolan
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Lär dig svenskt teckenspråk
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MainMenu;

