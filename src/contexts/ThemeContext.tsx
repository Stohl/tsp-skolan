import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Typ för tema-läge
type ThemeMode = 'light' | 'dark';

// Interface för Theme Context
interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

// Skapa Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook för att använda Theme Context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Props för Theme Provider
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme Provider komponent
export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Läs tema från localStorage eller använd 'light' som default
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as ThemeMode) || 'light';
  });

  // Spara tema till localStorage när det ändras
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Funktion för att växla tema
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Skapa Material UI tema baserat på läge
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1976d2',
        light: mode === 'dark' ? '#e3f2fd' : '#42a5f5',
        dark: mode === 'dark' ? '#1565c0' : '#0d47a1',
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#dc004e',
        light: mode === 'dark' ? '#fce4ec' : '#ff5983',
        dark: mode === 'dark' ? '#ad1457' : '#9a0036',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#ffffff',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#000000',
        secondary: mode === 'dark' ? '#b3b3b3' : '#666666',
      },
    },
    components: {
      // Anpassa Card komponenter för mörkt tema
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
            border: mode === 'dark' ? '1px solid #333' : 'none',
          },
        },
      },
      // Anpassa ListItem komponenter
      MuiListItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#333' : '#f5f5f5',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
