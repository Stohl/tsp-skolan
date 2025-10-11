import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WordDatabase, 
  PhraseDatabase, 
  loadWordDatabase, 
  loadPhraseDatabase 
} from '../types/database';

// Interface för word index
export interface WordIndex {
  metadata: {
    created: string;
    totalWords: number;
    wordsWithVariants: number;
    wordsWithRelations: number;
    description: string;
  };
  variants: {
    [word: string]: {
      variants: string[];
      primary: string;
      count: number;
    };
  };
  relations: {
    [wordId: string]: {
      sameMeaning: string[];
      alternativeMeanings: string[];
    };
  };
}

// Interface för context-värdet
interface DatabaseContextType {
  wordDatabase: WordDatabase;
  phraseDatabase: PhraseDatabase;
  wordIndex: WordIndex | null;
  isLoading: boolean;
  error: string | null;
  refreshDatabases: () => Promise<void>;
}

// Skapar context med default-värden
const DatabaseContext = createContext<DatabaseContextType>({
  wordDatabase: {},
  phraseDatabase: {},
  wordIndex: null,
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

// Funktion för att ladda word index
const loadWordIndex = async (): Promise<WordIndex> => {
  const response = await fetch(`${process.env.PUBLIC_URL}/word_index.json`);
  if (!response.ok) {
    throw new Error(`Kunde inte ladda word_index.json: ${response.statusText}`);
  }
  return response.json();
};

// Provider-komponent som laddar och tillhandahåller databaserna
export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  // State för att hålla databaserna
  const [wordDatabase, setWordDatabase] = useState<WordDatabase>({});
  const [phraseDatabase, setPhraseDatabase] = useState<PhraseDatabase>({});
  const [wordIndex, setWordIndex] = useState<WordIndex | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funktion för att ladda databaserna
  const loadDatabases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Laddar alla databaserna parallellt för bättre prestanda
      const [words, phrases, index] = await Promise.all([
        loadWordDatabase(),
        loadPhraseDatabase(),
        loadWordIndex()
      ]);
      
      setWordDatabase(words);
      setPhraseDatabase(phrases);
      setWordIndex(index);
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
    wordIndex,
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
