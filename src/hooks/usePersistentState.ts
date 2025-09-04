import { useState, useEffect } from 'react';

// Interface för ord-progress data
export interface WordProgressData {
  level: number; // 0 = Ej markerad, 1 = Att lära mig, 2 = Lärd
  stats: {
    correct: number;
    incorrect: number;
    lastPracticed: string; // ISO date string
    difficulty: number; // 0-100, beräknas baserat på performance
  };
}

// Interface för localStorage struktur
export interface WordProgressStorage {
  [wordId: string]: WordProgressData;
}

// Hook för att hantera persistent state med localStorage
export const usePersistentState = <T>(
  key: string, 
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  // Initiera state med värde från localStorage eller default
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn(`Kunde inte ladda data från localStorage för nyckel "${key}":`, error);
      return defaultValue;
    }
  });

  // Funktion för att sätta state och spara till localStorage
  const setPersistentState = (value: T | ((prev: T) => T)) => {
    setState(value);
    try {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(state) : value;
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Kunde inte spara data till localStorage för nyckel "${key}":`, error);
    }
  };

  return [state, setPersistentState];
};

// Hook specifikt för word progress
export const useWordProgress = () => {
  const [wordProgress, setWordProgress] = usePersistentState<WordProgressStorage>(
    'wordProgress', 
    {}
  );

  // Funktion för att uppdatera progress för ett specifikt ord
  const updateWordProgress = (wordId: string, updates: Partial<WordProgressData>) => {
    setWordProgress((prev: WordProgressStorage) => ({
      ...prev,
      [wordId]: {
        level: prev[wordId]?.level || 0,
        stats: {
          correct: prev[wordId]?.stats.correct || 0,
          incorrect: prev[wordId]?.stats.incorrect || 0,
          lastPracticed: prev[wordId]?.stats.lastPracticed || new Date().toISOString(),
          difficulty: prev[wordId]?.stats.difficulty || 50,
          ...updates.stats
        },
        ...updates
      }
    }));
  };

  // Funktion för att beräkna svårighetsgrad baserat på performance
  const calculateDifficulty = (correct: number, incorrect: number, lastPracticed: string): number => {
    const total = correct + incorrect;
    if (total === 0) return 50; // Default svårighetsgrad

    const errorRate = incorrect / total;
    const daysSinceLastPractice = (Date.now() - new Date(lastPracticed).getTime()) / (1000 * 60 * 60 * 24);
    
    // Högre svårighetsgrad = svårare ord
    const difficulty = Math.min(100, Math.max(0, 
      errorRate * 100 + // Felprocent (0-100)
      Math.min(50, daysSinceLastPractice * 5) // Glömska-faktor (max 50)
    ));
    
    return Math.round(difficulty);
  };

  // Funktion för att markera ett ord som korrekt/felaktigt
  const markWordResult = (wordId: string, isCorrect: boolean) => {
    const current = wordProgress[wordId] || {
      level: 0,
      stats: { correct: 0, incorrect: 0, lastPracticed: new Date().toISOString(), difficulty: 50 }
    };

    const newStats = {
      correct: current.stats.correct + (isCorrect ? 1 : 0),
      incorrect: current.stats.incorrect + (isCorrect ? 0 : 1),
      lastPracticed: new Date().toISOString(),
      difficulty: calculateDifficulty(
        current.stats.correct + (isCorrect ? 1 : 0),
        current.stats.incorrect + (isCorrect ? 0 : 1),
        new Date().toISOString()
      )
    };

    updateWordProgress(wordId, { stats: newStats });
  };

  // Funktion för att ändra nivå för ett ord
  const setWordLevel = (wordId: string, level: number) => {
    updateWordProgress(wordId, { level });
  };

  // Funktion för att hämta ord för övning (prioritera svåra ord)
  const getWordsForPractice = (wordDatabase: any, count: number = 10): any[] => {
    const wordsWithProgress = Object.entries(wordDatabase).map(([wordId, word]: [string, any]) => ({
      ...word,
      progress: wordProgress[wordId] || {
        level: 0,
        stats: { correct: 0, incorrect: 0, lastPracticed: new Date().toISOString(), difficulty: 50 }
      }
    }));

    // Sortera efter svårighetsgrad (högst först) och senast övade (längst tillbaka först)
    return wordsWithProgress
      .sort((a, b) => {
        const difficultyDiff = b.progress.stats.difficulty - a.progress.stats.difficulty;
        if (difficultyDiff !== 0) return difficultyDiff;
        
        const lastPracticedA = new Date(a.progress.stats.lastPracticed).getTime();
        const lastPracticedB = new Date(b.progress.stats.lastPracticed).getTime();
        return lastPracticedA - lastPracticedB;
      })
      .slice(0, count);
  };

  return {
    wordProgress,
    updateWordProgress,
    markWordResult,
    setWordLevel,
    getWordsForPractice
  };
};
