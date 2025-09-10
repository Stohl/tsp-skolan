// Svårighetsnivåer för ordlistor
export type DifficultyLevel = 'grundläggande' | 'enkla' | 'medel' | 'svåra' | 'expert';

// Förgenererade ordlistor som är hårdkodade i källkoden
export interface PredefinedWordList {
  id: string;
  name: string;
  description: string;
  wordIds: string[]; // Array med ord-ID:n som ska vara i listan
  type: 'predefined'; // För att skilja från dynamiska listor
  difficulty: DifficultyLevel; // Svårighetsnivå för ordlistan
}

// Dynamiska ordlistor som genereras från databasen
export interface DynamicWordList {
  id: string;
  name: string;
  description: string;
  subject: string; // Ämne att filtrera på
  type: 'dynamic'; // För att skilja från förgenererade listor
  difficulty: DifficultyLevel; // Svårighetsnivå för ordlistan
}

// Union type för alla ordlistor
export type WordList = PredefinedWordList | DynamicWordList;

// Förgenererade ordlistor
export const predefinedWordLists: PredefinedWordList[] = [
  {
    id: 'handalfabetet',
    name: 'Handalfabetet',
    description: 'Alla ord med ämnet "Handalfabetet"',
    wordIds: ['handalfabetet'],
    type: 'predefined',
    difficulty: 'grundläggande'
  }
];

// Funktion för att hämta alla ordlistor (både förgenererade och dynamiska)
export const getAllWordLists = (database: any): WordList[] => {
  const dynamicLists: DynamicWordList[] = [
    {
      id: 'handalfabetet',
      name: 'Handalfabetet',
      description: 'Alla ord med ämnet "Handalfabetet"',
      subject: 'Handalfabetet',
      type: 'dynamic',
      difficulty: 'grundläggande'
    },
    {
      id: 'siffror',
      name: 'Siffror',
      description: 'Alla ord med ämnet "Siffror"',
      subject: 'Siffror',
      type: 'dynamic',
      difficulty: 'grundläggande'
    },
    {
      id: 'bildelar',
      name: 'Bildelar',
      description: 'Alla ord med ämnet "Bildelar"',
      subject: 'Bildelar',
      type: 'dynamic',
      difficulty: 'medel'
    },
    {
      id: 'kläder',
      name: 'Kläder',
      description: 'Alla ord med ämnet "Kläder"',
      subject: 'Kläder',
      type: 'dynamic',
      difficulty: 'enkla'
    },
    {
      id: 'mat',
      name: 'Mat',
      description: 'Alla ord med ämnet "Mat"',
      subject: 'Mat',
      type: 'dynamic',
      difficulty: 'svåra'
    }
  ];

  return [...predefinedWordLists, ...dynamicLists];
};

// Funktion för att hämta ord från en ordlista
export const getWordsFromList = (wordList: WordList, database: any): any[] => {
  if (wordList.type === 'predefined') {
    // För förgenererade listor, hämta ord baserat på ID:n
    return wordList.wordIds
      .map(id => database[id])
      .filter(word => word !== undefined); // Filtrera bort ord som inte finns
  } else {
    // För dynamiska listor, hämta ord baserat på ämne
    return Object.values(database).filter((word: any) => 
      word.ämne && word.ämne.includes(wordList.subject)
    );
  }
};

// Funktion för att hämta en specifik ordlista
export const getWordListById = (id: string, database: any): WordList | null => {
  const allLists = getAllWordLists(database);
  return allLists.find(list => list.id === id) || null;
};

// Funktion för att få svårighetsnivåns visuella representation
export const getDifficultyInfo = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case 'grundläggande':
      return {
        label: 'Grundläggande',
        icon: '🟢',
        color: 'success' as const,
        description: 'Allra vanligaste orden'
      };
    case 'enkla':
      return {
        label: 'Enkla',
        icon: '🔵',
        color: 'info' as const,
        description: 'Vardagsbegrepp'
      };
    case 'medel':
      return {
        label: 'Medel',
        icon: '🟡',
        color: 'warning' as const,
        description: 'Abstraktare ord och fler rörelsemoment'
      };
    case 'svåra':
      return {
        label: 'Svåra',
        icon: '🟠',
        color: 'error' as const,
        description: 'Komplexa handformer eller mindre vanliga ord'
      };
    case 'expert':
      return {
        label: 'Expert',
        icon: '🔴',
        color: 'error' as const,
        description: 'Mycket sällsynta eller facktermer'
      };
    default:
      return {
        label: 'Okänd',
        icon: '⚪',
        color: 'default' as const,
        description: 'Okänd svårighetsnivå'
      };
  }
};
