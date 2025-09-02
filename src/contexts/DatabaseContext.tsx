import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WordDatabase, 
  PhraseDatabase, 
  loadWordDatabase, 
  loadPhraseDatabase 
} from '../types/database';

// Interface för context-värdet
interface DatabaseContextType {
  wordDatabase: WordDatabase;
  phraseDatabase: PhraseDatabase;
  isLoading: boolean;
  error: string | null;
  refreshDatabases: () => Promise<void>;
}

// Skapar context med default-värden
const DatabaseContext = createContext<DatabaseContextType>({
  wordDatabase: {},
  phraseDatabase: {},
  isLoading: false,
  error: null,
  refreshDatabases: async () => {},
});

// Hook för att använda databasen context
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase måste användas inom en DatabaseProvider');
  }
  return context;
};

// Props för DatabaseProvider
interface DatabaseProviderProps {
  children: ReactNode;
}

// Provider-komponent som laddar och tillhandahåller databaserna
export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  // State för att hålla databaserna
  const [wordDatabase, setWordDatabase] = useState<WordDatabase>({});
  const [phraseDatabase, setPhraseDatabase] = useState<PhraseDatabase>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funktion för att ladda databaserna
  const loadDatabases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Laddar båda databaserna parallellt för bättre prestanda
      const [words, phrases] = await Promise.all([
        loadWordDatabase(),
        loadPhraseDatabase()
      ]);
      
      setWordDatabase(words);
      setPhraseDatabase(phrases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid laddning av databaserna');
      console.error('Fel vid laddning av databaserna:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion för att uppdatera databaserna
  const refreshDatabases = async () => {
    await loadDatabases();
  };

  // Laddar databaserna när komponenten mountas
  useEffect(() => {
    loadDatabases();
  }, []);

  // Context-värde som skickas till alla barn-komponenter
  const value: DatabaseContextType = {
    wordDatabase,
    phraseDatabase,
    isLoading,
    error,
    refreshDatabases,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
