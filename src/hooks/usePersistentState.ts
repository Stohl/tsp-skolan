import { useState, useEffect } from 'react';

// Interface för ord-progress data
export interface WordProgressData {
  level: number; // 0 = Ej markerad, 1 = Att lära mig, 2 = Lärd
  points: number; // Poäng för att markera som lärd (0-5)
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
    setState((prevState) => {
      const newState = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
      
      // Spara till localStorage
      try {
        localStorage.setItem(key, JSON.stringify(newState));
      } catch (error) {
        console.error(`Kunde inte spara data till localStorage för nyckel "${key}":`, error);
      }
      
      return newState;
    });
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
    console.log(`[DEBUG] updateWordProgress called: wordId=${wordId}, updates=`, updates);
    
    setWordProgress((prev: WordProgressStorage) => {
      const current = prev[wordId] || {
        level: 0,
        points: 0,
        stats: { correct: 0, incorrect: 0, lastPracticed: '', difficulty: 50 }
      };
      
      const newData = {
        level: updates.level !== undefined ? updates.level : current.level,
        points: updates.points !== undefined ? updates.points : current.points,
        stats: {
          ...current.stats,
          ...(updates.stats || {})
        }
      };
      
      console.log(`[DEBUG] updateWordProgress: wordId=${wordId}, oldPoints=${current.points}, newPoints=${newData.points}`);
      
      return {
        ...prev,
        [wordId]: newData
      };
    });
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
      points: 0,
      stats: { correct: 0, incorrect: 0, lastPracticed: '', difficulty: 50 }
    };

    console.log(`[DEBUG] markWordResult: wordId=${wordId}, isCorrect=${isCorrect}, currentPoints=${current.points}`);

    // Säkerställ att points är ett giltigt nummer (hantera null/undefined)
    const currentPoints = typeof current.points === 'number' ? current.points : 0;
    
    // Beräkna nya poäng: +1 för rätt, -1 för fel (men aldrig under 0)
    const newPoints = Math.max(0, currentPoints + (isCorrect ? 1 : -1));
    
    // Om poängen når 5, markera ordet som lärt (nivå 2)
    const newLevel = newPoints >= 5 ? 2 : current.level;

    console.log(`[DEBUG] New points: ${newPoints}, new level: ${newLevel}`);

    const newStats = {
      correct: current.stats.correct + (isCorrect ? 1 : 0),
      incorrect: current.stats.incorrect + (isCorrect ? 0 : 1),
      // Uppdatera lastPracticed vid varje övning
      lastPracticed: new Date().toISOString(),
      difficulty: calculateDifficulty(
        current.stats.correct + (isCorrect ? 1 : 0),
        current.stats.incorrect + (isCorrect ? 0 : 1),
        new Date().toISOString()
      )
    };

    updateWordProgress(wordId, { 
      level: newLevel,
      points: newPoints,
      stats: newStats 
    });

    console.log(`[DEBUG] markWordResult completed for wordId=${wordId}, newPoints=${newPoints}, newLevel=${newLevel}`);
  };

  // Funktion för att ändra nivå för ett ord
  const setWordLevel = (wordId: string, level: number) => {
    const current = wordProgress[wordId] || {
      level: 0,
      points: 0,
      stats: { correct: 0, incorrect: 0, lastPracticed: '', difficulty: 50 }
    };
    
    // Om ordet markeras som "lärd" (nivå 2), ge automatiskt 5 poäng
    const newPoints = level === 2 ? 5 : current.points;
    
    updateWordProgress(wordId, { 
      level,
      points: newPoints,
      stats: {
        ...current.stats,
        lastPracticed: new Date().toISOString() // Sätt nuvarande tid när nivå ändras
      }
    });
  };

  // Funktion för att hämta ord för övning (prioritera ord som användaren vill lära sig)
  const getWordsForPractice = (wordDatabase: any, count: number = 10): any[] => {
    const wordsWithProgress = Object.entries(wordDatabase).map(([wordId, word]: [string, any]) => ({
      ...word,
      progress: wordProgress[wordId] || {
        level: 0,
        points: 0,
        stats: { correct: 0, incorrect: 0, lastPracticed: '', difficulty: 50 }
      }
    }));

    // Sortera ord för övning:
    // 1. Ord markerade som "vill lära mig" (nivå 1) först
    // 2. Sedan efter svårighetsgrad (högst först)
    // 3. Sedan efter senast övade (längst tillbaka först)
    return wordsWithProgress
      .sort((a, b) => {
        // Prioritera ord som användaren vill lära sig (nivå 1)
        const levelA = a.progress.level;
        const levelB = b.progress.level;
        
        // Om ena är nivå 1 och andra inte, prioritera nivå 1
        if (levelA === 1 && levelB !== 1) return -1;
        if (levelA !== 1 && levelB === 1) return 1;
        
        // Om båda är nivå 1 eller båda inte är nivå 1, sortera efter svårighetsgrad
        const difficultyDiff = b.progress.stats.difficulty - a.progress.stats.difficulty;
        if (difficultyDiff !== 0) return difficultyDiff;
        
        // Om svårighetsgrad är samma, sortera efter senast övade
        const lastPracticedA = a.progress.stats.lastPracticed ? new Date(a.progress.stats.lastPracticed).getTime() : 0;
        const lastPracticedB = b.progress.stats.lastPracticed ? new Date(b.progress.stats.lastPracticed).getTime() : 0;
        return lastPracticedA - lastPracticedB;
      })
      .slice(0, count);
  };

  // Funktion för att få visuell representation av poäng
  const getPointsDisplay = (points: number): string => {
    const filled = '●';
    const empty = '○';
    const maxPoints = 5;
    
    return Array.from({ length: maxPoints }, (_, i) => 
      i < points ? filled : empty
    ).join('');
  };

  return {
    wordProgress,
    setWordProgress,
    updateWordProgress,
    markWordResult,
    setWordLevel,
    getWordsForPractice,
    getPointsDisplay
  };
};
