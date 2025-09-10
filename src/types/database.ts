// Konstanter för databasen
const BASE_URL = 'https://teckensprakslexikon.su.se';

// Hjälpfunktion för att hantera video-URLs
export const getVideoUrl = (videoUrl: string): string => {
  // Om URL:en redan är komplett, returnera den som den är
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl;
  }
  // Annars lägg till bas-URL:en
  return `${BASE_URL}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`;
};

// TypeScript interfaces för databasstrukturen
export interface Word {
  id: string;
  ord: string;
  beskrivning?: string; // Valfritt fält
  lexikon_id: string;
  formbeskrivning?: string; // Valfritt fält
  förekomster: {
    Lexikonet: string;
    Enkäter: string;
  };
  exempel: {
    primära: string[];
    sekundära: string[];
  };
  video_url: string;
  url: string;
  last_updated: string;
  ämne?: string[]; // Valfritt fält
}

export interface Phrase {
  id: string;
  fras: string;
  ord_id: string;
  video_url: string;
  url: string;
  last_updated: string;
}

export interface WordDatabase {
  [key: string]: Word;
}

export interface PhraseDatabase {
  [key: string]: Phrase;
}

// Funktion för att ladda orddatabasen
export const loadWordDatabase = async (): Promise<WordDatabase> => {
  try {
    const response = await fetch('/ord_database.json');
    if (!response.ok) {
      throw new Error('Kunde inte ladda orddatabasen');
    }
    return await response.json();
  } catch (error) {
    console.error('Fel vid laddning av orddatabasen:', error);
    return {};
  }
};

// Funktion för att ladda frasdatabasen
export const loadPhraseDatabase = async (): Promise<PhraseDatabase> => {
  try {
    const response = await fetch('/fras_database.json');
    if (!response.ok) {
      throw new Error('Kunde inte ladda frasdatabasen');
    }
    return await response.json();
  } catch (error) {
    console.error('Fel vid laddning av frasdatabasen:', error);
    return {};
  }
};

// Funktion för att söka efter ord
export const searchWords = (database: WordDatabase, searchTerm: string): Word[] => {
  const term = searchTerm.toLowerCase().trim();
  if (!term || term.length < 2) return [];
  
  return Object.values(database).filter(word => 
    word.ord.toLowerCase().includes(term)
  );
};

// Funktion för att hämta ord efter ämne
export const getWordsBySubject = (database: WordDatabase, subject: string): Word[] => {
  return Object.values(database).filter(word => 
    word.ämne && word.ämne.includes(subject)
  );
};

// Funktion för att hämta alla unika ämnen
export const getAllSubjects = (database: WordDatabase): string[] => {
  const subjects = new Set<string>();
  Object.values(database).forEach(word => {
    if (word.ämne && Array.isArray(word.ämne)) {
      word.ämne.forEach(ämne => subjects.add(ämne));
    }
  });
  return Array.from(subjects).sort();
};

// Funktion för att hämta fraser för ett specifikt ord
export const getPhrasesForWord = (phraseDatabase: PhraseDatabase, wordId: string): Phrase[] => {
  return Object.values(phraseDatabase).filter(phrase => 
    phrase.ord_id === wordId
  );
};
