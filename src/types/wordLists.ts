// Förgenererade ordlistor som är hårdkodade i källkoden
export interface PredefinedWordList {
  id: string;
  name: string;
  description: string;
  wordIds: string[]; // Array med ord-ID:n som ska vara i listan
  type: 'predefined'; // För att skilja från dynamiska listor
}

// Dynamiska ordlistor som genereras från databasen
export interface DynamicWordList {
  id: string;
  name: string;
  description: string;
  subject: string; // Ämne att filtrera på
  type: 'dynamic'; // För att skilja från förgenererade listor
}

// Union type för alla ordlistor
export type WordList = PredefinedWordList | DynamicWordList;

// Förgenererade ordlistor
export const predefinedWordLists: PredefinedWordList[] = [
  {
    id: 'testlista',
    name: 'Testlista',
    description: 'En testlista med några grundläggande ord',
    wordIds: ['00001', '00002', '00003', '00004', '00005'],
    type: 'predefined'
  },
  {
    id: 'grundord',
    name: 'Grundord',
    description: 'Viktiga grundord för att komma igång',
    wordIds: ['00010', '00011', '00012', '00013', '00014', '00015'],
    type: 'predefined'
  },
  {
    id: 'familj',
    name: 'Familj',
    description: 'Ord relaterade till familj och relationer',
    wordIds: ['00100', '00101', '00102', '00103', '00104'],
    type: 'predefined'
  },
  {
    id: 'färger',
    name: 'Färger',
    description: 'Grundläggande färger',
    wordIds: ['00200', '00201', '00202', '00203', '00204', '00205'],
    type: 'predefined'
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
      type: 'dynamic'
    },
    {
      id: 'siffror',
      name: 'Siffror',
      description: 'Alla ord med ämnet "Siffror"',
      subject: 'Siffror',
      type: 'dynamic'
    },
    {
      id: 'bildelar',
      name: 'Bildelar',
      description: 'Alla ord med ämnet "Bildelar"',
      subject: 'Bildelar',
      type: 'dynamic'
    },
    {
      id: 'kläder',
      name: 'Kläder',
      description: 'Alla ord med ämnet "Kläder"',
      subject: 'Kläder',
      type: 'dynamic'
    },
    {
      id: 'mat',
      name: 'Mat',
      description: 'Alla ord med ämnet "Mat"',
      subject: 'Mat',
      type: 'dynamic'
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
