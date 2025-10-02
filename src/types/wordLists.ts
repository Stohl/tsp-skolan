// Svårighetsnivåer för ordlistor
export type DifficultyLevel = 'nyborjare' | 'lite_erfaren' | 'erfaren' | 'proffs' | 'fortsattning';

// Förgenererade ordlistor som är hårdkodade i källkoden
export interface PredefinedWordList {
  id: string;
  name: string;
  description: string;
  wordIds: string[]; // Array med ord-ID:n som ska vara i listan
  type: 'predefined'; // För att skilja från dynamiska listor
  difficulty: DifficultyLevel; // Svårighetsnivå för ordlistan
  priority: number; // Prioritering för lärande (0 och uppåt, decimaler tillåtna)
  lexikon?: number;
  Receptive?: number;
  Productive?: number;
  receptivetot?: number;
  productivetot?: number;
  // Start-guide parametrar
  showInStartGuide?: boolean; // Om ordlistan ska visas i start-guiden
  startGuidePosition?: number; // Position i start-guiden (1, 2, 3, etc.)
  showWordsInStartGuide?: boolean; // Om orden ska visas eller bara beskrivning
}

// Dynamiska ordlistor som genereras från databasen
export interface DynamicWordList {
  id: string;
  name: string;
  description: string;
  subject: string; // Ämne att filtrera på
  type: 'dynamic'; // För att skilja från förgenererade listor
  difficulty: DifficultyLevel; // Svårighetsnivå för ordlistan
  priority: number; // Prioritering för lärande (0 och uppåt, decimaler tillåtna)
  // Start-guide parametrar
  showInStartGuide?: boolean; // Om ordlistan ska visas i start-guiden
  startGuidePosition?: number; // Position i start-guiden (1, 2, 3, etc.)
  showWordsInStartGuide?: boolean; // Om orden ska visas eller bara beskrivning
}

// Union type för alla ordlistor
export type WordList = PredefinedWordList | DynamicWordList;

// Map för snabb lookup av svårighetsgrad från ord-ID
let wordDifficultyMap: Map<string, DifficultyLevel> | null = null;

// Funktion för att skapa wordDifficultyMap från predefinedWordLists
export const createWordDifficultyMap = (): Map<string, DifficultyLevel> => {
  if (wordDifficultyMap) return wordDifficultyMap;
  
  wordDifficultyMap = new Map<string, DifficultyLevel>();
  
  // Fyll map:en från predefinedWordLists
  predefinedWordLists.forEach(list => {
    list.wordIds.forEach(wordId => {
      wordDifficultyMap!.set(wordId, list.difficulty);
    });
  });
  
  return wordDifficultyMap;
};

// Funktion för att hämta svårighetsgrad för ett ord
export const getWordListDifficulty = (wordId: string): DifficultyLevel => {
  if (!wordDifficultyMap) {
    createWordDifficultyMap();
  }
  
  return wordDifficultyMap?.get(wordId) || 'proffs'; // Default till högsta svårighetsgrad
};

// Förgenererade ordlistor
export const predefinedWordLists: PredefinedWordList[] = [
  {
    id: 'n1_handalfabetet:',
    name: 'Handalfabetet:',
    description: 'Handalfabetet: - 5 träffar i lexikonet',
    wordIds: ['09531', '09532', '09011', '09533', '11925', '11926', '11927', '11928', '11929', '11930', '11931', '11932', '11933', '11934', '11935', '11936', '11937', '11938', '11939', '11940', '11941', '11942', '11943', '24685', '11945', '11946', '17309', '11948', '20135'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 1,
    lexikon: 5,
    Receptive: 7.28,
    Productive: 2.8,
    receptivetot: 182.0,
    productivetot: 70.0
  },
  {
    id: 'n1_veckodagar',
    name: 'Veckodagar',
    description: 'Veckodagar - 87 träffar i lexikonet',
    wordIds: ['04457', '03455', '07357', '20529', '04567', '02839', '01416'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 2,
    lexikon: 87,
    Receptive: 4.57,
    Productive: 0.57,
    receptivetot: 32.0,
    productivetot: 4.0
  },
  {
    id: 'n1_månader',
    name: 'Månader',
    description: 'Månader - 64 träffar i lexikonet',
    wordIds: ['10697', '19158', '00774', '00815', '09098', '08253', '08252', '08814', '09196', '09131', '09121', '08853'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 3,
    lexikon: 64,
    Receptive: 4.08,
    Productive: 0.25,
    receptivetot: 49.0,
    productivetot: 3.0
  },
  {
    id: 'n1_färger',
    name: 'Färger',
    description: 'Färger - 76 träffar i lexikonet',
    wordIds: ['20373', '07660', '20372', '03390', '00017', '02773', '05139', '01098', '03478', '07996', '00451'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 4,
    lexikon: 76,
    Receptive: 3.55,
    Productive: 0.18,
    receptivetot: 39.0,
    productivetot: 2.0
  },
  {
    id: 'n1_kroppsdelar',
    name: 'Kroppsdelar',
    description: 'Kroppsdelar - 30 träffar i lexikonet',
    wordIds: ['07883', '10866', '04778', '08415', '04657', '00209', '02352', '07952', '02636', '02753', '02659', '24595'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5,
    lexikon: 30,
    Receptive: 26.0,
    Productive: 2.58,
    receptivetot: 312.0,
    productivetot: 31.0
  },
  {
    id: 'n1_familj',
    name: 'Familj',
    description: 'Familj - 271 träffar i lexikonet',
    wordIds: ['00188', '02557', '00257', '03513', '03462', '01937', '07541', '01939', '07412'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 6,
    lexikon: 271,
    Receptive: 47.67,
    Productive: 4.33,
    receptivetot: 429.0,
    productivetot: 39.0
  },
  {
    id: 'n1_djur',
    name: 'Djur',
    description: 'Djur - 79 träffar i lexikonet',
    wordIds: ['00222', '00344', '03275', '00234', '04399', '03058', '01918', '19790', '03347', '04080'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 7,
    lexikon: 79,
    Receptive: 5.4,
    Productive: 0.0,
    receptivetot: 54.0,
    productivetot: 0.0
  },
  {
    id: 'n1_känslor',
    name: 'Känslor',
    description: 'Känslor - 50 träffar i lexikonet',
    wordIds: ['00165', '15383', '07317', '03515', '00966', '24871', '01655', '03514', '03679', '02644'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 8,
    lexikon: 50,
    Receptive: 12.78,
    Productive: 2.0,
    receptivetot: 115.0,
    productivetot: 18.0
  },
  {
    id: 'n1_yrken',
    name: 'Yrken',
    description: 'Yrken - 78 träffar i lexikonet',
    wordIds: ['01353', '06723', '11889', '05635', '03586', '03770', '16418', '02191', '00503', '02159'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 9,
    lexikon: 78,
    Receptive: 9.5,
    Productive: 2.12,
    receptivetot: 76.0,
    productivetot: 17.0
  },
  {
    id: 'n1_substantiv_001',
    name: 'Saker och ting, namn på ting (1)',
    description: 'Substantiv - 991 träffar i lexikonet',
    wordIds: ['00644', '02158', '00257', '01266', '02557', '00696', '01377', '03700', '04250', '00632', '01384', '02042', '00416', '16261', '04567'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 10,
    lexikon: 991,
    Receptive: 26.29,
    Productive: 5.14,
    receptivetot: 368.0,
    productivetot: 72.0
  },
  {
    id: 'n1_substantiv_002',
    name: 'Saker och ting, namn på ting (2)',
    description: 'Substantiv - 117 träffar i lexikonet',
    wordIds: ['02861', '07219', '00496', '16268', '00815', '04121', '15453', '05903', '03455', '19187', '17733', '06179', '01728', '03544', '00148'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 11,
    lexikon: 117,
    Receptive: 4.5,
    Productive: 0.75,
    receptivetot: 54.0,
    productivetot: 9.0
  },
  {
    id: 'n1_substantiv_003',
    name: 'Saker och ting, namn på ting (3)',
    description: 'Substantiv - 2 träffar i lexikonet',
    wordIds: ['17335', '03304', '06556', '08829', '03462', '13376', '01921', '19109', '19924', '09944', '02970', '04337', '09226', '20529', '00844'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 12,
    lexikon: 2,
    Receptive: 6.42,
    Productive: 1.58,
    receptivetot: 77.0,
    productivetot: 19.0
  },
  {
    id: 'n1_verb_004',
    name: 'Något man gör (4)',
    description: 'Verb - 1815 träffar i lexikonet',
    wordIds: ['02238', '16234', '00022', '00204', '05173', '04104', '00563', '04238', '03854', '01547', '00281', '00179', '00360', '04036', '02064'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 13,
    lexikon: 1815,
    Receptive: 35.62,
    Productive: 4.75,
    receptivetot: 285.0,
    productivetot: 38.0
  },
  {
    id: 'n1_verb_005',
    name: 'Något man gör (5)',
    description: 'Verb - 80 träffar i lexikonet',
    wordIds: ['01784', '04009', '00044', '01495', '04950', '04240', '02244', '05574', '19004', '00102', '00491', '20312', '12741', '18174', '26162', '01288', '18168', '03449'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 14,
    lexikon: 80,
    Receptive: 14.25,
    Productive: 5.42,
    receptivetot: 171.0,
    productivetot: 65.0
  },
  {
    id: 'n1_adjektiv_006',
    name: 'Hur något är (6)',
    description: 'Adjektiv - 417 träffar i lexikonet',
    wordIds: ['00086', '02375', '05158', '00469', '07101', '00966', '00017', '04771', '00248', '05668', '00107', '00004', '17578', '19384', '05358'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 15,
    lexikon: 417,
    Receptive: 4.1,
    Productive: 6.2,
    receptivetot: 41.0,
    productivetot: 62.0
  },
  {
    id: 'n1_adjektiv_007',
    name: 'Hur något är (7)',
    description: 'Adjektiv - 17 träffar i lexikonet',
    wordIds: ['05246', '06045', '12124', '01121', '00688', '01122', '13524', '02632', '17021', '03514', '01090', '04922'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 16,
    lexikon: 17,
    Receptive: 6.56,
    Productive: 1.56,
    receptivetot: 59.0,
    productivetot: 14.0
  },
  {
    id: 'n1_adverb_008',
    name: 'Hur, var, när (8)',
    description: 'Adverb - 2081 träffar i lexikonet',
    wordIds: ['05133', '02711', '00167', '00646', '11274', '02381', '04569', '00561', '02866', '00432', '00683', '03279', '05459', '12274', '19467', '08535', '01454', '16650', '12317', '09167'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 17,
    lexikon: 2081,
    Receptive: 26.68,
    Productive: 10.0,
    receptivetot: 507.0,
    productivetot: 190.0
  },
  {
    id: 'n1_pronomen_009',
    name: 'Istället för namn (9)',
    description: 'Pronomen - 5871 träffar i lexikonet',
    wordIds: ['02798', '00187', '02817', '00275', '07844', '03622', '03639', '00124', '00123', '15855', '09027', '18259', '20131', '24957', '05248', '17376'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 18,
    lexikon: 5871,
    Receptive: 47.44,
    Productive: 3.33,
    receptivetot: 427.0,
    productivetot: 30.0
  },
  {
    id: 'n1_blandad_010',
    name: 'Blandade ord (10)',
    description: 'Blandad - 840 träffar i lexikonet',
    wordIds: ['00321', '00178', '19108', '03960', '00320', '15485', '00335', '07849', '11929', '00787', '03954', '05748', '08286', '08812', '15805', '02852', '11879'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 19,
    lexikon: 840,
    Receptive: 7.12,
    Productive: 19.47,
    receptivetot: 121.0,
    productivetot: 331.0
  },
  {
    id: 'n1_blandad_011',
    name: 'Blandade ord (11)',
    description: 'Blandad - 48 träffar i lexikonet',
    wordIds: ['08597', '06432', '06397', '03071', '00470'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 20,
    lexikon: 48,
    Receptive: 6.0,
    Productive: 0.0,
    receptivetot: 18.0,
    productivetot: 0.0
  },
  {
    id: 'n2_substantiv_001',
    name: 'Saker och ting, namn på ting (1)',
    description: 'Substantiv - 737 träffar i lexikonet',
    wordIds: ['02237', '01366', '02831', '07824', '09044', '00498', '17327', '00188', '08133', '03019', '04408', '02775', '18191', '05036', '01913'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 21,
    lexikon: 737,
    Receptive: 18.54,
    Productive: 7.77,
    receptivetot: 241.0,
    productivetot: 101.0
  },
  {
    id: 'n2_substantiv_002',
    name: 'Saker och ting, namn på ting (2)',
    description: 'Substantiv - 119 träffar i lexikonet',
    wordIds: ['03828', '07605', '01939', '01168', '03555', '02208', '04457', '12268', '06035', '01207', '04501', '00390', '07357', '04424', '02251'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 22,
    lexikon: 119,
    Receptive: 4.07,
    Productive: 0.47,
    receptivetot: 61.0,
    productivetot: 7.0
  },
  {
    id: 'n2_substantiv_003',
    name: 'Saker och ting, namn på ting (3)',
    description: 'Substantiv - 40 träffar i lexikonet',
    wordIds: ['04007', '00649', '02908', '20348', '10697', '00108', '00554', '05529', '19113', '04663', '19158', '05417', '00774', '00008', '03772'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 23,
    lexikon: 40,
    Receptive: 9.55,
    Productive: 1.0,
    receptivetot: 105.0,
    productivetot: 11.0
  },
  {
    id: 'n2_substantiv_004',
    name: 'Saker och ting, namn på ting (4)',
    description: 'Substantiv - 6 träffar i lexikonet',
    wordIds: ['00867', '00941', '17528', '00636', '10553', '11546', '24741', '19790', '00218', '03863', '06761', '04920', '02643', '17712', '04976', '06095', '07366', '24765'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 24,
    lexikon: 6,
    Receptive: 4.17,
    Productive: 1.17,
    receptivetot: 50.0,
    productivetot: 14.0
  },
  {
    id: 'n2_verb_005',
    name: 'Något man gör (5)',
    description: 'Verb - 546 träffar i lexikonet',
    wordIds: ['02063', '02584', '02749', '00625', '00935', '03181', '00446', '02694', '00277', '03919', '00173', '00666', '04101', '07714', '04489'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 25,
    lexikon: 546,
    Receptive: 4.15,
    Productive: 2.92,
    receptivetot: 54.0,
    productivetot: 38.0
  },
  {
    id: 'n2_verb_006',
    name: 'Något man gör (6)',
    description: 'Verb - 34 träffar i lexikonet',
    wordIds: ['01723', '01343', '04161', '09672', '07613', '09060', '00082', '01148', '08140', '11465', '05279', '23343', '18848', '00077'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 26,
    lexikon: 34,
    Receptive: 6.09,
    Productive: 2.0,
    receptivetot: 67.0,
    productivetot: 22.0
  },
  {
    id: 'n2_adjektiv_007',
    name: 'Hur något är (7)',
    description: 'Adjektiv - 570 träffar i lexikonet',
    wordIds: ['02801', '02365', '00256', '02645', '04866', '04602', '00172', '01058', '00322', '02569', '07278', '04803', '12377', '04636', '03375'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 27,
    lexikon: 570,
    Receptive: 7.18,
    Productive: 1.0,
    receptivetot: 79.0,
    productivetot: 11.0
  },
  {
    id: 'n2_adjektiv_008',
    name: 'Hur något är (8)',
    description: 'Adjektiv - 60 träffar i lexikonet',
    wordIds: ['00340', '07317', '04808', '13484', '01945', '17295', '03609', '07321', '10800', '03617', '01934', '05179', '01752', '00386', '09941', '20500', '04743', '04464', '20332', '15309'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 28,
    lexikon: 60,
    Receptive: 17.92,
    Productive: 3.92,
    receptivetot: 233.0,
    productivetot: 51.0
  },
  {
    id: 'n2_adverb_009',
    name: 'Hur, var, när (9)',
    description: 'Adverb - 298 träffar i lexikonet',
    wordIds: ['04724', '02914', '05500', '00061', '08984', '03211', '00317', '00090', '03169', '10693', '17981', '12746', '03172', '01283', '05515'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 29,
    lexikon: 298,
    Receptive: 9.11,
    Productive: 3.44,
    receptivetot: 82.0,
    productivetot: 31.0
  },
  {
    id: 'n2_blandad_010',
    name: 'Blandade ord (10)',
    description: 'Blandad - 456 träffar i lexikonet',
    wordIds: ['15856', '00483', '00812', '01789', '10029', '02855', '16253', '14007', '20418', '11880', '11884', '11911', '18854', '11951', '25111'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 30,
    lexikon: 456,
    Receptive: 10.23,
    Productive: 3.62,
    receptivetot: 133.0,
    productivetot: 47.0
  },
  {
    id: 'n2_blandad_011',
    name: 'Blandade ord (11)',
    description: 'Blandad - 130 träffar i lexikonet',
    wordIds: ['00152', '10437', '06640', '16388', '19083', '26234', '16551', '15606'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 31,
    lexikon: 130,
    Receptive: 0.25,
    Productive: 1.25,
    receptivetot: 1.0,
    productivetot: 5.0
  },
  {
    id: 'n3_substantiv_001',
    name: 'Saker och ting, namn på ting (1)',
    description: 'Substantiv - 646 träffar i lexikonet',
    wordIds: ['02531', '08135', '00304', '00773', '08116', '00623', '05382', '04510', '06912', '00589', '01353', '00472', '04540', '04545', '04008'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 32,
    lexikon: 646,
    Receptive: 20.47,
    Productive: 7.8,
    receptivetot: 307.0,
    productivetot: 117.0
  },
  {
    id: 'n3_substantiv_002',
    name: 'Saker och ting, namn på ting (2)',
    description: 'Substantiv - 182 träffar i lexikonet',
    wordIds: ['01038', '05072', '05777', '02890', '05214', '07405', '02203', '14976', '02544', '04748', '15858', '08188', '08853', '13831', '00105'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 33,
    lexikon: 182,
    Receptive: 13.23,
    Productive: 4.31,
    receptivetot: 172.0,
    productivetot: 56.0
  },
  {
    id: 'n3_substantiv_003',
    name: 'Saker och ting, namn på ting (3)',
    description: 'Substantiv - 74 träffar i lexikonet',
    wordIds: ['15521', '08100', '04816', '07232', '03074', '00677', '18404', '07756', '17727', '08501', '17734', '03665', '05593', '16317', '19821'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 34,
    lexikon: 74,
    Receptive: 5.0,
    Productive: 0.1,
    receptivetot: 50.0,
    productivetot: 1.0
  },
  {
    id: 'n3_substantiv_004',
    name: 'Saker och ting, namn på ting (4)',
    description: 'Substantiv - 33 träffar i lexikonet',
    wordIds: ['16316', '04872', '12318', '08252', '03008', '00176', '08632', '10522', '01894', '15906', '01858', '05854', '00197', '06539', '11059'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 35,
    lexikon: 33,
    Receptive: 10.0,
    Productive: 3.38,
    receptivetot: 80.0,
    productivetot: 27.0
  },
  {
    id: 'n3_substantiv_005',
    name: 'Saker och ting, namn på ting (5)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['23019', '26106', '07132', '15888', '14174', '10873', '14292', '12545', '16414', '07663', '16308', '08880', '15942', '17009', '17557'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 36,
    lexikon: 0,
    Receptive: 3.67,
    Productive: 1.11,
    receptivetot: 33.0,
    productivetot: 10.0
  },
  {
    id: 'n3_substantiv_006',
    name: 'Saker och ting, namn på ting (6)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['08398', '00214', '07412', '24990', '05637', '17340', '12280', '00343', '15946', '05403', '17510', '13654', '14945', '01215'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 37,
    lexikon: 0,
    Receptive: 5.12,
    Productive: 1.88,
    receptivetot: 41.0,
    productivetot: 15.0
  },
  {
    id: 'n3_verb_007',
    name: 'Något man gör (7)',
    description: 'Verb - 352 träffar i lexikonet',
    wordIds: ['01267', '02273', '08319', '01571', '02945', '04848', '01092', '09249', '01716', '00207', '00529', '00721', '04350', '10534', '07697'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 38,
    lexikon: 352,
    Receptive: 8.08,
    Productive: 1.23,
    receptivetot: 105.0,
    productivetot: 16.0
  },
  {
    id: 'n3_verb_008',
    name: 'Något man gör (8)',
    description: 'Verb - 31 träffar i lexikonet',
    wordIds: ['10877', '00578', '08282', '08129', '01815', '15754', '00511', '02417', '17034', '19444', '03726', '00534', '03101'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 39,
    lexikon: 31,
    Receptive: 9.7,
    Productive: 3.7,
    receptivetot: 97.0,
    productivetot: 37.0
  },
  {
    id: 'n3_adjektiv_009',
    name: 'Hur något är (9)',
    description: 'Adjektiv - 205 träffar i lexikonet',
    wordIds: ['01885', '12125', '05218', '00233', '08001', '07525', '01869', '02465', '01432', '07687', '01098', '00389', '01079', '16303', '11776'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 40,
    lexikon: 205,
    Receptive: 4.4,
    Productive: 2.5,
    receptivetot: 44.0,
    productivetot: 25.0
  },
  {
    id: 'n3_adjektiv_010',
    name: 'Hur något är (10)',
    description: 'Adjektiv - 22 träffar i lexikonet',
    wordIds: ['00326', '00994', '07660', '17596', '03515', '02644', '12331', '07912', '09695', '04338', '05201', '11157', '17763', '20578', '05502'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 41,
    lexikon: 22,
    Receptive: 5.14,
    Productive: 1.71,
    receptivetot: 36.0,
    productivetot: 12.0
  },
  {
    id: 'n3_adverb_011',
    name: 'Hur, var, när (11)',
    description: 'Adverb - 111 träffar i lexikonet',
    wordIds: ['00582', '01464', '07538', '09561', '04624', '01814', '03957', '00643', '10944', '02229', '17582', '19495', '03139', '00641', '08970', '07645', '05819', '00367', '18180', '24925'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 42,
    lexikon: 111,
    Receptive: 20.44,
    Productive: 9.88,
    receptivetot: 327.0,
    productivetot: 158.0
  },
  {
    id: 'n3_blandad_012',
    name: 'Blandade ord (12)',
    description: 'Blandad - 103 träffar i lexikonet',
    wordIds: ['19710', '23029', '04274', '05496', '11941', '05389', '20542', '00464', '00299', '04481', '00374', '04171', '12330', '11940', '15961', '20598', '03024', '08300'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 43,
    lexikon: 103,
    Receptive: 12.64,
    Productive: 4.0,
    receptivetot: 177.0,
    productivetot: 56.0
  },
  {
    id: 'n3_blandad_013',
    name: 'Blandade ord (13)',
    description: 'Blandad - 133 träffar i lexikonet',
    wordIds: ['11882', '15266', '07809', '16568', '05489', '08869', '08937', '06495', '06549', '17584', '16643', '14206', '05483', '11228', '11518'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 44,
    lexikon: 133,
    Receptive: 15.14,
    Productive: 4.29,
    receptivetot: 106.0,
    productivetot: 30.0
  },
  {
    id: 'n4_substantiv_001',
    name: 'Saker och ting, namn på ting (1)',
    description: 'Substantiv - 375 träffar i lexikonet',
    wordIds: ['08045', '00770', '04582', '02839', '04593', '04024', '00319', '06723', '12312', '00945', '10521', '04907', '03156', '00664', '01786'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 45,
    lexikon: 375,
    Receptive: 11.85,
    Productive: 2.77,
    receptivetot: 154.0,
    productivetot: 36.0
  },
  {
    id: 'n4_substantiv_002',
    name: 'Saker och ting, namn på ting (2)',
    description: 'Substantiv - 114 träffar i lexikonet',
    wordIds: ['02924', '00573', '01176', '03637', '00111', '11970', '00425', '02992', '01937', '01733', '02402', '07773', '02474', '09050', '11323'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 46,
    lexikon: 114,
    Receptive: 5.42,
    Productive: 1.0,
    receptivetot: 65.0,
    productivetot: 12.0
  },
  {
    id: 'n4_substantiv_003',
    name: 'Saker och ting, namn på ting (3)',
    description: 'Substantiv - 45 träffar i lexikonet',
    wordIds: ['04459', '02184', '07272', '14824', '02800', '08423', '00899', '00306', '01295', '05356', '10064', '08511', '08925', '09196', '01742'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 47,
    lexikon: 45,
    Receptive: 3.73,
    Productive: 0.64,
    receptivetot: 41.0,
    productivetot: 7.0
  },
  {
    id: 'n4_substantiv_004',
    name: 'Saker och ting, namn på ting (4)',
    description: 'Substantiv - 8 träffar i lexikonet',
    wordIds: ['11109', '03443', '00691', '00931', '11927', '10245', '07936', '13212', '09547', '04187', '24516', '22739', '17960', '25453', '15587'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 48,
    lexikon: 8,
    Receptive: 3.55,
    Productive: 1.64,
    receptivetot: 39.0,
    productivetot: 18.0
  },
  {
    id: 'n4_substantiv_005',
    name: 'Saker och ting, namn på ting (5)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['14136', '24214', '24566', '00259', '00435', '24568', '05663', '24253', '14448', '10082', '02753', '07265', '03820', '24240', '04578'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 49,
    lexikon: 0,
    Receptive: 44.0,
    Productive: 2.17,
    receptivetot: 528.0,
    productivetot: 26.0
  },
  {
    id: 'n4_substantiv_006',
    name: 'Saker och ting, namn på ting (6)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['10756', '11014', '09402', '08648', '08048', '03302', '10451', '09209', '01050', '19450', '05404', '23217', '20512', '07197', '08268', '16382', '05534'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 50,
    lexikon: 0,
    Receptive: 10.4,
    Productive: 1.27,
    receptivetot: 156.0,
    productivetot: 19.0
  },
  {
    id: 'n4_verb_007',
    name: 'Något man gör (7)',
    description: 'Verb - 117 träffar i lexikonet',
    wordIds: ['03115', '04209', '02663', '13561', '00996', '03819', '00521', '01607', '04225', '02605', '02260', '00793', '07332', '04358', '19591'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 51,
    lexikon: 117,
    Receptive: 10.07,
    Productive: 1.43,
    receptivetot: 141.0,
    productivetot: 20.0
  },
  {
    id: 'n4_verb_008',
    name: 'Något man gör (8)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['06703', '04895', '02657', '04087', '08178', '07922', '10518', '05045', '05599', '01916', '05725', '03099'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 52,
    lexikon: 0,
    Receptive: 8.44,
    Productive: 0.78,
    receptivetot: 76.0,
    productivetot: 7.0
  },
  {
    id: 'n4_adjektiv_009',
    name: 'Hur något är (9)',
    description: 'Adjektiv - 171 träffar i lexikonet',
    wordIds: ['09120', '05431', '20373', '01655', '12302', '07761', '00441', '07572', '01855', '12310', '11176', '03134', '02360', '09766', '07975'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 53,
    lexikon: 171,
    Receptive: 7.5,
    Productive: 2.83,
    receptivetot: 90.0,
    productivetot: 34.0
  },
  {
    id: 'n4_adjektiv_010',
    name: 'Hur något är (10)',
    description: 'Adjektiv - 8 träffar i lexikonet',
    wordIds: ['10694', '02147', '10536', '07981', '19047', '18849', '02653', '05634', '01065', '14600', '04178', '09115', '05526'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 54,
    lexikon: 8,
    Receptive: 4.4,
    Productive: 0.2,
    receptivetot: 44.0,
    productivetot: 2.0
  },
  {
    id: 'n4_blandad_011',
    name: 'Blandade ord (11)',
    description: 'Blandad - 313 träffar i lexikonet',
    wordIds: ['00767', '04850', '09235', '02837', '02929', '24307', '22971', '01807', '04864', '02828', '17306', '11469', '07851', '00290', '09042', '08850', '00192', '12376'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 55,
    lexikon: 313,
    Receptive: 6.69,
    Productive: 1.92,
    receptivetot: 87.0,
    productivetot: 25.0
  },
  {
    id: 'n4_blandad_012',
    name: 'Blandade ord (12)',
    description: 'Blandad - 101 träffar i lexikonet',
    wordIds: ['03451', '11950', '11885', '01129', '05392', '17798', '14128', '26328', '08264', '17716', '17358', '19386'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 56,
    lexikon: 101,
    Receptive: 4.57,
    Productive: 1.43,
    receptivetot: 32.0,
    productivetot: 10.0
  },
  {
    id: 'n5_substantiv_001',
    name: 'Saker och ting, namn på ting (1)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['10069', '11826', '11192', '09245', '02528', '03874', '08764', '24561', '08316', '02157', '12249', '09659', '05730', '02709', '08055'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 57,
    lexikon: 0,
    Receptive: 6.86,
    Productive: 0.57,
    receptivetot: 96.0,
    productivetot: 8.0
  },
  {
    id: 'n5_substantiv_002',
    name: 'Saker och ting, namn på ting (2)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['04583', '04554', '02061', '03681', '08117', '12048', '04642', '13889', '07930', '16648', '00391', '04646', '04647', '10508', '01550'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 58,
    lexikon: 0,
    Receptive: 3.07,
    Productive: 0.2,
    receptivetot: 46.0,
    productivetot: 3.0
  },
  {
    id: 'n5_substantiv_003',
    name: 'Saker och ting, namn på ting (3)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['15312', '02395', '02089', '10717', '18834', '09321', '04669', '00041', '02404', '05732', '05034', '01803', '19093', '01767', '00610'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 59,
    lexikon: 0,
    Receptive: 4.73,
    Productive: 0.6,
    receptivetot: 71.0,
    productivetot: 9.0
  },
  {
    id: 'n5_substantiv_004',
    name: 'Saker och ting, namn på ting (4)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['05611', '03401', '01205', '08775', '01251', '02378', '00449', '11916', '08047', '00611', '03646', '02504', '24114', '02459', '18632'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 60,
    lexikon: 0,
    Receptive: 8.0,
    Productive: 1.08,
    receptivetot: 104.0,
    productivetot: 14.0
  },
  {
    id: 'n5_substantiv_005',
    name: 'Saker och ting, namn på ting (5)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['01470', '07384', '07958', '01415', '04694', '04696', '24055', '03044', '02383', '04122', '20136', '13982', '16740', '05240', '00556'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 61,
    lexikon: 0,
    Receptive: 3.29,
    Productive: 1.57,
    receptivetot: 46.0,
    productivetot: 22.0
  },
  {
    id: 'n5_substantiv_006',
    name: 'Saker och ting, namn på ting (6)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['11443', '11459', '10062', '11489', '11510', '01055', '08295', '13256', '03906', '08861', '04299', '05547', '08476', '11620', '12251'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 62,
    lexikon: 0,
    Receptive: 4.2,
    Productive: 0.4,
    receptivetot: 63.0,
    productivetot: 6.0
  },
  {
    id: 'n5_substantiv_007',
    name: 'Saker och ting, namn på ting (7)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['01750', '08770', '11671', '11721', '20021', '03623', '19090', '03875', '02412', '09989', '04326', '09418', '04588', '00975', '00798'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 63,
    lexikon: 0,
    Receptive: 2.93,
    Productive: 1.13,
    receptivetot: 44.0,
    productivetot: 17.0
  },
  {
    id: 'n5_substantiv_008',
    name: 'Saker och ting, namn på ting (8)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['08686', '05631', '03041', '00708', '05325', '08899', '04534', '09318', '09319', '00678', '11310', '07273', '17265', '15848', '03527'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 64,
    lexikon: 0,
    Receptive: 1.5,
    Productive: 0.5,
    receptivetot: 21.0,
    productivetot: 7.0
  },
  {
    id: 'n5_substantiv_009',
    name: 'Saker och ting, namn på ting (9)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['03528', '00059', '05712', '01726', '05085', '07528', '04112', '03353', '01923', '03521', '03604', '08071', '05779', '10692', '02207'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 65,
    lexikon: 0,
    Receptive: 4.53,
    Productive: 0.73,
    receptivetot: 68.0,
    productivetot: 11.0
  },
  {
    id: 'n5_substantiv_010',
    name: 'Saker och ting, namn på ting (10)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['00737', '07629', '03660', '12289', '18530', '14145', '08166', '17093', '05275', '01567', '00901', '02740', '12253', '11347', '10704'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 66,
    lexikon: 0,
    Receptive: 9.0,
    Productive: 0.4,
    receptivetot: 135.0,
    productivetot: 6.0
  },
  {
    id: 'n5_substantiv_011',
    name: 'Saker och ting, namn på ting (11)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['04285', '01462', '06793', '00731', '12087', '00162', '01935', '01936', '04837', '12226', '00200', '03951', '07828', '03829', '10610'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 67,
    lexikon: 0,
    Receptive: 3.0,
    Productive: 0.8,
    receptivetot: 45.0,
    productivetot: 12.0
  },
  {
    id: 'n5_substantiv_012',
    name: 'Saker och ting, namn på ting (12)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['00609', '10678', '04853', '01579', '00869', '05064', '10346', '00962', '16409', '24739', '00076', '04876', '13735', '04527', '16304'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 68,
    lexikon: 0,
    Receptive: 5.67,
    Productive: 1.87,
    receptivetot: 85.0,
    productivetot: 28.0
  },
  {
    id: 'n5_substantiv_013',
    name: 'Saker och ting, namn på ting (13)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['05658', '00583', '02270', '02519', '11888', '00845', '07858', '04904', '05612', '04906', '01928', '07459', '10956', '02284', '26315'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 69,
    lexikon: 0,
    Receptive: 4.27,
    Productive: 0.53,
    receptivetot: 64.0,
    productivetot: 8.0
  },
  {
    id: 'n5_substantiv_014',
    name: 'Saker och ting, namn på ting (14)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['02130', '15391', '03356', '12288', '12101', '02210', '02111', '01601', '04932', '03777', '03672', '19003', '14312', '06930', '05600'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 70,
    lexikon: 0,
    Receptive: 3.53,
    Productive: 0.53,
    receptivetot: 53.0,
    productivetot: 8.0
  },
  {
    id: 'n5_substantiv_015',
    name: 'Saker och ting, namn på ting (15)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['12873', '01233', '07287', '01549', '01688', '16840', '04938', '05831', '02215', '01491', '00553', '04942', '07288', '13888', '00286'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 71,
    lexikon: 0,
    Receptive: 6.21,
    Productive: 0.43,
    receptivetot: 87.0,
    productivetot: 6.0
  },
  {
    id: 'n5_substantiv_016',
    name: 'Saker och ting, namn på ting (16)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['03749', '04945', '02925', '14710', '04519', '00864', '07290', '11421', '03967', '03982', '16638', '03310', '07594', '15474', '04668'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 72,
    lexikon: 0,
    Receptive: 4.0,
    Productive: 1.71,
    receptivetot: 56.0,
    productivetot: 24.0
  },
  {
    id: 'n5_substantiv_017',
    name: 'Saker och ting, namn på ting (17)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['04001', '01480', '05846', '10930', '00128', '02606', '03047', '04483', '00272', '01106', '12446', '17915', '05330', '06973', '07826'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 73,
    lexikon: 0,
    Receptive: 13.0,
    Productive: 3.33,
    receptivetot: 195.0,
    productivetot: 50.0
  },
  {
    id: 'n5_substantiv_018',
    name: 'Saker och ting, namn på ting (18)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['03809', '17458', '03741', '10933', '25033', '00418', '08471', '09069', '05641', '03018', '09061', '04999', '01167', '01217', '15923'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 74,
    lexikon: 0,
    Receptive: 7.71,
    Productive: 0.14,
    receptivetot: 108.0,
    productivetot: 2.0
  },
  {
    id: 'n5_substantiv_019',
    name: 'Saker och ting, namn på ting (19)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['17949', '06388', '01553', '15973', '01260', '01831', '08033', '12212', '01520', '05756', '17410', '08636', '02209', '01909', '18603'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 75,
    lexikon: 0,
    Receptive: 5.46,
    Productive: 2.15,
    receptivetot: 71.0,
    productivetot: 28.0
  },
  {
    id: 'n5_substantiv_020',
    name: 'Saker och ting, namn på ting (20)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['00979', '07246', '03847', '20020', '05118', '02889', '15283', '03219', '02392', '18321', '17293', '05083', '19354', '08299', '07299'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 76,
    lexikon: 0,
    Receptive: 2.53,
    Productive: 0.47,
    receptivetot: 38.0,
    productivetot: 7.0
  },
  {
    id: 'n5_substantiv_021',
    name: 'Saker och ting, namn på ting (21)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['09064', '08792', '03635', '05096', '02786', '02969', '07606', '15865', '05241', '00283', '01737', '03826', '00957', '11498', '02164'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 77,
    lexikon: 0,
    Receptive: 6.2,
    Productive: 3.13,
    receptivetot: 93.0,
    productivetot: 47.0
  },
  {
    id: 'n5_substantiv_022',
    name: 'Saker och ting, namn på ting (22)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['08580', '00262', '19168', '11508', '19584', '24931', '01816', '18960', '01709', '19629', '05268', '02445', '18906', '07450', '00263'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 78,
    lexikon: 0,
    Receptive: 4.07,
    Productive: 0.64,
    receptivetot: 57.0,
    productivetot: 9.0
  },
  {
    id: 'n5_substantiv_023',
    name: 'Saker och ting, namn på ting (23)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['05898', '11019', '02458', '08121', '03378', '03629', '03630', '18736', '01729', '04057', '02825', '09125', '05609', '11523', '12997'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 79,
    lexikon: 0,
    Receptive: 4.13,
    Productive: 2.33,
    receptivetot: 62.0,
    productivetot: 35.0
  },
  {
    id: 'n5_substantiv_024',
    name: 'Saker och ting, namn på ting (24)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['12482', '03370', '09371', '20504', '03792', '11533', '02077', '02029', '11538', '08308', '07368', '25137', '10067', '01018', '07095'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 80,
    lexikon: 0,
    Receptive: 7.87,
    Productive: 0.53,
    receptivetot: 118.0,
    productivetot: 8.0
  },
  {
    id: 'n5_substantiv_025',
    name: 'Saker och ting, namn på ting (25)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['02572', '05910', '09156', '11032', '04239', '07379', '01154', '24987', '01498', '04899', '03779', '07584', '15915', '17359', '01720'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 81,
    lexikon: 0,
    Receptive: 2.4,
    Productive: 0.2,
    receptivetot: 36.0,
    productivetot: 3.0
  },
  {
    id: 'n5_substantiv_026',
    name: 'Saker och ting, namn på ting (26)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['04184', '01465', '26289', '08205', '12309', '03669', '07354', '11568', '14683', '02477', '16291', '00106', '00704', '17996', '09337'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 82,
    lexikon: 0,
    Receptive: 6.07,
    Productive: 1.5,
    receptivetot: 85.0,
    productivetot: 21.0
  },
  {
    id: 'n5_substantiv_027',
    name: 'Saker och ting, namn på ting (27)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['04254', '03552', '00058', '03070', '18038', '04152', '07990', '07261', '08542', '03986', '03970', '01268', '01739', '02896', '11595'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 83,
    lexikon: 0,
    Receptive: 5.27,
    Productive: 3.73,
    receptivetot: 79.0,
    productivetot: 56.0
  },
  {
    id: 'n5_substantiv_028',
    name: 'Saker och ting, namn på ting (28)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['08411', '07592', '10765', '03791', '01659', '02472', '02224', '03191', '00617', '17901', '01780', '04019', '07977', '05281', '03722'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 84,
    lexikon: 0,
    Receptive: 6.2,
    Productive: 1.07,
    receptivetot: 93.0,
    productivetot: 16.0
  },
  {
    id: 'n5_substantiv_029',
    name: 'Saker och ting, namn på ting (29)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['08917', '04397', '03673', '00480', '00481', '15815', '10682', '07637', '01189', '01944', '19609', '12245', '00282', '01875', '03918'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 85,
    lexikon: 0,
    Receptive: 3.07,
    Productive: 0.4,
    receptivetot: 46.0,
    productivetot: 6.0
  },
  {
    id: 'n5_substantiv_030',
    name: 'Saker och ting, namn på ting (30)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['02521', '03914', '00878', '03648', '17390', '14854', '04115', '12763', '02090', '05644', '11732', '03997', '00993', '00846', '17384'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 86,
    lexikon: 0,
    Receptive: 6.2,
    Productive: 6.8,
    receptivetot: 93.0,
    productivetot: 102.0
  },
  {
    id: 'n5_substantiv_031',
    name: 'Saker och ting, namn på ting (31)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['07924', '08077', '04603', '01978', '02024', '05121', '11625', '11628', '03859', '24503', '15317', '05352', '02622', '07580', '04357'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 87,
    lexikon: 0,
    Receptive: 9.71,
    Productive: 1.14,
    receptivetot: 136.0,
    productivetot: 16.0
  },
  {
    id: 'n5_substantiv_032',
    name: 'Saker och ting, namn på ting (32)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['19774', '11131', '23279', '12599', '09206', '23399', '17726', '05369', '10775', '09041', '15259', '03043', '02746', '01759', '02648'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 88,
    lexikon: 0,
    Receptive: 7.38,
    Productive: 0.23,
    receptivetot: 96.0,
    productivetot: 3.0
  },
  {
    id: 'n5_substantiv_033',
    name: 'Saker och ting, namn på ting (33)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['03152', '17670', '05377', '00303', '04490', '01642', '19398', '05494', '01997', '03411', '09744', '17346', '19872', '05203', '05395'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 89,
    lexikon: 0,
    Receptive: 27.0,
    Productive: 1.29,
    receptivetot: 378.0,
    productivetot: 18.0
  },
  {
    id: 'n5_substantiv_034',
    name: 'Saker och ting, namn på ting (34)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['05988', '06362', '11214', '16528', '12304', '12043', '12811', '01769', '25710', '13030', '13038', '03098', '03349', '03456', '00959'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 90,
    lexikon: 0,
    Receptive: 3.47,
    Productive: 0.73,
    receptivetot: 52.0,
    productivetot: 11.0
  },
  {
    id: 'n5_substantiv_035',
    name: 'Saker och ting, namn på ting (35)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['11316', '07644', '05428', '19214', '16225', '09719', '02300', '08810', '18327', '09701', '08758', '12286', '03611', '04373', '24313'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 91,
    lexikon: 0,
    Receptive: 12.2,
    Productive: 1.33,
    receptivetot: 183.0,
    productivetot: 20.0
  },
  {
    id: 'n5_substantiv_036',
    name: 'Saker och ting, namn på ting (36)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['18500', '03338', '07814', '11961', '05476', '00138', '11729', '08204', '00986', '11448', '05498', '11702', '08550', '08635', '05513'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 92,
    lexikon: 0,
    Receptive: 8.47,
    Productive: 0.47,
    receptivetot: 127.0,
    productivetot: 7.0
  },
  {
    id: 'n5_substantiv_037',
    name: 'Saker och ting, namn på ting (37)',
    description: 'Substantiv - 0 träffar i lexikonet',
    wordIds: ['00588', '25842', '01477', '00236', '01210', '02037', '13623', '03753', '16401', '04655', '25687', '04858', '03653', '01924', '09166', '06609', '05584', '03475', '00995', '14371', '07953', '12989'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 93,
    lexikon: 0,
    Receptive: 12.32,
    Productive: 3.55,
    receptivetot: 271.0,
    productivetot: 78.0
  },
  {
    id: 'n5_verb_001',
    name: 'Något man gör (1)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['00332', '24498', '04949', '08062', '04635', '04769', '00333', '14794', '07372', '00365', '09956', '01828', '05664', '00648', '00050'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 94,
    lexikon: 0,
    Receptive: 28.36,
    Productive: 11.71,
    receptivetot: 397.0,
    productivetot: 164.0
  },
  {
    id: 'n5_verb_002',
    name: 'Något man gör (2)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['01710', '04433', '02712', '02227', '00580', '02036', '15964', '03581', '03905', '05953', '00372', '02702', '02113', '15816', '01261'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 95,
    lexikon: 0,
    Receptive: 13.67,
    Productive: 1.53,
    receptivetot: 205.0,
    productivetot: 23.0
  },
  {
    id: 'n5_verb_003',
    name: 'Något man gör (3)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['12069', '10520', '04201', '05282', '02501', '03760', '08153', '04496', '17145', '08431', '00331', '03671', '12313', '05419', '03184'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 96,
    lexikon: 0,
    Receptive: 6.36,
    Productive: 1.79,
    receptivetot: 89.0,
    productivetot: 25.0
  },
  {
    id: 'n5_verb_004',
    name: 'Något man gör (4)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['02616', '01820', '10068', '02590', '02631', '09954', '03065', '03033', '05683', '02892', '00354', '03023', '01218', '18542', '03751'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 97,
    lexikon: 0,
    Receptive: 16.33,
    Productive: 2.33,
    receptivetot: 196.0,
    productivetot: 28.0
  },
  {
    id: 'n5_verb_005',
    name: 'Något man gör (5)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['08360', '17838', '24652', '07846', '11794', '01338', '04952', '00889', '03551', '01300', '05844', '04004', '00849', '04191', '00541'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 98,
    lexikon: 0,
    Receptive: 14.77,
    Productive: 2.54,
    receptivetot: 192.0,
    productivetot: 33.0
  },
  {
    id: 'n5_verb_006',
    name: 'Något man gör (6)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['01901', '10715', '14679', '01143', '02993', '01822', '05093', '03808', '00585', '02213', '02199', '02820', '01870', '17187', '00835'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 99,
    lexikon: 0,
    Receptive: 11.64,
    Productive: 3.07,
    receptivetot: 163.0,
    productivetot: 43.0
  },
  {
    id: 'n5_verb_007',
    name: 'Något man gör (7)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['00726', '01348', '00780', '01721', '05097', '07983', '02555', '04423', '05396', '01614', '04123', '00089', '05540', '07982', '05271'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 100,
    lexikon: 0,
    Receptive: 8.8,
    Productive: 0.47,
    receptivetot: 132.0,
    productivetot: 7.0
  },
  {
    id: 'n5_verb_008',
    name: 'Något man gör (8)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['14762', '01745', '06481', '01887', '02747', '17318', '24072', '01226', '01886', '00049', '01503', '01882', '19453', '06302', '18529'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 101,
    lexikon: 0,
    Receptive: 3.57,
    Productive: 1.29,
    receptivetot: 50.0,
    productivetot: 18.0
  },
  {
    id: 'n5_verb_009',
    name: 'Något man gör (9)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['01722', '10248', '01147', '05343', '05673', '07976', '02153', '10979', '17620', '02696', '01299', '02506', '02220', '01578', '05247'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 102,
    lexikon: 0,
    Receptive: 11.9,
    Productive: 3.9,
    receptivetot: 119.0,
    productivetot: 39.0
  },
  {
    id: 'n5_verb_010',
    name: 'Något man gör (10)',
    description: 'Verb - 0 träffar i lexikonet',
    wordIds: ['09032', '18384', '00182', '00163', '00694', '03387', '02522', '22697', '07638', '00794', '07877', '01497', '00056', '07945', '13852', '12239', '03291', '23079', '05408', '00249', '06012', '02222', '02438', '16369'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 103,
    lexikon: 0,
    Receptive: 6.58,
    Productive: 1.68,
    receptivetot: 125.0,
    productivetot: 32.0
  },
  {
    id: 'n5_adjektiv_001',
    name: 'Hur något är (1)',
    description: 'Adjektiv - 0 träffar i lexikonet',
    wordIds: ['17302', '02150', '01007', '03295', '10149', '09401', '00568', '01475', '04339', '03377', '10826', '19803', '10905', '01982', '03036'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 104,
    lexikon: 0,
    Receptive: 3.33,
    Productive: 5.6,
    receptivetot: 50.0,
    productivetot: 84.0
  },
  {
    id: 'n5_adjektiv_002',
    name: 'Hur något är (2)',
    description: 'Adjektiv - 0 träffar i lexikonet',
    wordIds: ['05714', '00535', '03034', '05592', '00659', '04295', '01949', '19994', '02927', '01401', '16026', '04181', '18273', '17361', '04764'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 105,
    lexikon: 0,
    Receptive: 3.21,
    Productive: 1.21,
    receptivetot: 45.0,
    productivetot: 17.0
  },
  {
    id: 'n5_adjektiv_003',
    name: 'Hur något är (3)',
    description: 'Adjektiv - 0 träffar i lexikonet',
    wordIds: ['04768', '01234', '04308', '17621', '01747', '01034', '00581', '08136', '04232', '04800', '00298', '03260', '01777', '12498', '00379'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 106,
    lexikon: 0,
    Receptive: 11.86,
    Productive: 1.79,
    receptivetot: 166.0,
    productivetot: 25.0
  },
  {
    id: 'n5_adjektiv_004',
    name: 'Hur något är (4)',
    description: 'Adjektiv - 0 träffar i lexikonet',
    wordIds: ['00071', '04960', '02902', '00231', '10773', '04026', '17918', '02058', '01702', '01505', '17230', '03471', '07847', '04262', '14406'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 107,
    lexikon: 0,
    Receptive: 2.13,
    Productive: 0.93,
    receptivetot: 32.0,
    productivetot: 14.0
  },
  {
    id: 'n5_adjektiv_005',
    name: 'Hur något är (5)',
    description: 'Adjektiv - 0 träffar i lexikonet',
    wordIds: ['00085', '00512', '00095', '00631', '02842', '13628', '12252', '00777', '05076', '07560', '02363', '03025', '05239', '04596', '06059'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 108,
    lexikon: 0,
    Receptive: 6.53,
    Productive: 0.87,
    receptivetot: 98.0,
    productivetot: 13.0
  },
  {
    id: 'n5_adjektiv_006',
    name: 'Hur något är (6)',
    description: 'Adjektiv - 0 träffar i lexikonet',
    wordIds: ['23220', '03145', '18190', '08484', '15037', '00079', '00597', '08407', '12900', '02913', '11526', '07482', '00443', '04267', '25726'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 109,
    lexikon: 0,
    Receptive: 5.0,
    Productive: 1.92,
    receptivetot: 65.0,
    productivetot: 25.0
  },
  {
    id: 'n5_adjektiv_007',
    name: 'Hur något är (7)',
    description: 'Adjektiv - 0 träffar i lexikonet',
    wordIds: ['00890', '16380', '00368', '02354', '00893', '17339', '06108', '03990', '06115', '14743', '00174', '10789', '00596', '01919', '07410'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 110,
    lexikon: 0,
    Receptive: 3.62,
    Productive: 0.85,
    receptivetot: 47.0,
    productivetot: 11.0
  },
  {
    id: 'n5_adjektiv_008',
    name: 'Hur något är (8)',
    description: 'Adjektiv - 0 träffar i lexikonet',
    wordIds: ['00598', '05642', '05305', '02989', '02219', '14109', '02278', '01794', '05705', '00970', '01741', '02293', '11635', '01211', '07578'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 111,
    lexikon: 0,
    Receptive: 5.23,
    Productive: 0.15,
    receptivetot: 68.0,
    productivetot: 2.0
  },
  {
    id: 'n5_adjektiv_009',
    name: 'Hur något är (9)',
    description: 'Adjektiv - 0 träffar i lexikonet',
    wordIds: ['07499', '02257', '00453', '05406', '01609', '02355', '04179', '02214', '02991', '17779', '00139', '02001', '03208', '01099', '05464', '00755', '11320', '07440', '01677', '09181', '01078'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 112,
    lexikon: 0,
    Receptive: 5.6,
    Productive: 1.05,
    receptivetot: 112.0,
    productivetot: 21.0
  },
  {
    id: 'n5_adverb_001',
    name: 'Hur, var, när (1)',
    description: 'Adverb - 0 träffar i lexikonet',
    wordIds: ['03143', '00487', '04731', '01764', '04485', '02688', '10033', '02690', '04892', '12521', '08979', '02658', '05708', '03187', '03108'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 113,
    lexikon: 0,
    Receptive: 5.25,
    Productive: 2.38,
    receptivetot: 42.0,
    productivetot: 19.0
  },
  {
    id: 'n5_adverb_002',
    name: 'Hur, var, när (2)',
    description: 'Adverb - 0 träffar i lexikonet',
    wordIds: ['11085', '04480', '00873', '18671', '03171', '03280', '08728', '09229', '02466', '09987', '00291', '11492', '09190'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 114,
    lexikon: 0,
    Receptive: 6.9,
    Productive: 2.2,
    receptivetot: 69.0,
    productivetot: 22.0
  },
  {
    id: 'n5_pronomen_001',
    name: 'Istället för namn (1)',
    description: 'Pronomen - 0 träffar i lexikonet',
    wordIds: ['04153', '02370', '00186'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 115,
    lexikon: 0,
    Receptive: 8.67,
    Productive: 0.67,
    receptivetot: 26.0,
    productivetot: 2.0
  },
  {
    id: 'n5_preposition_001',
    name: 'Små ord som visar plats eller riktning (1)',
    description: 'Preposition - 0 träffar i lexikonet',
    wordIds: ['00297', '00732'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 116,
    lexikon: 0,
    Receptive: 11.0,
    Productive: 3.5,
    receptivetot: 22.0,
    productivetot: 7.0
  },
  {
    id: 'n5_konjunktion_001',
    name: 'Ord som binder ihop (1)',
    description: 'Konjunktion - 0 träffar i lexikonet',
    wordIds: ['08042'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 117,
    lexikon: 0,
    Receptive: 0.0,
    Productive: 0.0,
    receptivetot: 0.0,
    productivetot: 0.0
  },
  {
    id: 'n5_interjektion_001',
    name: 'Utrop! (1)',
    description: 'Interjektion - 0 träffar i lexikonet',
    wordIds: ['10083', '20523', '14156', '22765', '04077', '00005', '04324', '02662', '12745', '00528', '24596', '00278'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 118,
    lexikon: 0,
    Receptive: 4.73,
    Productive: 0.45,
    receptivetot: 52.0,
    productivetot: 5.0
  },
  {
    id: 'n5_räkneord_001',
    name: 'Hur många, vilken ordning (1)',
    description: 'Räkneord - 0 träffar i lexikonet',
    wordIds: ['06782', '11910', '11893', '20277', '11909', '23123', '11955', '06959', '24273', '11912', '11895', '11903', '11902', '11907', '11904', '11901', '11900', '11906', '08933', '11908', '11891', '11913'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 119,
    lexikon: 0,
    Receptive: 2.64,
    Productive: 0.27,
    receptivetot: 58.0,
    productivetot: 6.0
  },
  {
    id: 'n6_substantiv_001',
    name: 'Saker och ting, namn på ting (1)',
    description: 'Substantiv - 130 träffar i lexikonet',
    wordIds: ['17911', '00121', '10720', '07316', '03744', '06741', '03509', '04834', '01501', '02297', '17322', '02859', '03838', '00251', '00463'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 120,
    lexikon: 130,
    Receptive: 5.9,
    Productive: 1.2,
    receptivetot: 59.0,
    productivetot: 12.0
  },
  {
    id: 'n6_verb_001',
    name: 'Något man gör (1)',
    description: 'Verb - 129 träffar i lexikonet',
    wordIds: ['00799', '03699', '01666', '15511', '00961', '03591', '02589', '02009', '03282', '00376', '04488', '01049', '04797', '08052', '00682'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 121,
    lexikon: 129,
    Receptive: 5.2,
    Productive: 0.6,
    receptivetot: 26.0,
    productivetot: 3.0
  },
  {
    id: 'n6_adjektiv_001',
    name: 'Hur något är (1)',
    description: 'Adjektiv - 59 träffar i lexikonet',
    wordIds: ['03089', '08337', '12520', '00171', '05138', '01907', '02988'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 122,
    lexikon: 59,
    Receptive: 4.4,
    Productive: 0.8,
    receptivetot: 22.0,
    productivetot: 4.0
  },
  {
    id: 'n6_adverb_001',
    name: 'Hur, var, när (1)',
    description: 'Adverb - 17 träffar i lexikonet',
    wordIds: ['02351', '03056'],
    type: 'predefined',
    difficulty: 'fortsattning',
    priority: 123,
    lexikon: 17,
    Receptive: 1.0,
    Productive: 0.0,
    receptivetot: 1.0,
    productivetot: 0.0
  }
  /*{
    id: 'siffror_0_10',
    name: 'Siffror 0-10',
    description: 'Siffrorna 0 - 10',
    wordIds: ['24273', '02852', '11879', '11880', '11881', '11882', '11950', '11884', '11885', '11886', '04475'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 1.0,
    showInStartGuide: true,
    startGuidePosition: 5,
    showWordsInStartGuide: true
  },
  {
    id: 'adjektiv_001',
    name: 'adjektiv (1-10)',
    description: '1-10 vanligaste adjektiv - 1106 träffar i lexikonet',
    wordIds: ['02801', '01061', '06767', '00086', '00310', '00074', '02375', '09120', '02850', '00789'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 2.0
  },
  {
    id: 'adjektiv_002',
    name: 'adjektiv (11-20)',
    description: '11-20 vanligaste adjektiv - 578 träffar i lexikonet',
    wordIds: ['02365', '00193', '02354', '02847', '04606', '08479', '05158', '00469', '02293', '00256'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 2.1
  },
  {
    id: 'adjektiv_003',
    name: 'adjektiv (21-30)',
    description: '21-30 vanligaste adjektiv - 414 träffar i lexikonet',
    wordIds: ['00289', '01609', '05076', '02645', '00720', '05705', '01885', '00298', '08776', '05642'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 3.0
  },
  {
    id: 'adjektiv_004',
    name: 'adjektiv (31-40)',
    description: '31-40 vanligaste adjektiv - 299 träffar i lexikonet',
    wordIds: ['11866', '04866', '00387', '12125', '03145', '05131', '00631', '00607', '11320', '05218'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 3.1
  },
  {
    id: 'adjektiv_005',
    name: 'adjektiv (41-50)',
    description: '41-50 vanligaste adjektiv - 238 träffar i lexikonet',
    wordIds: ['03377', '07101', '02902', '00456', '00174', '00233', '03856', '00966', '00604', '00172'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 3.2
  },
  {
    id: 'adjektiv_006',
    name: 'adjektiv (51-60)',
    description: '51-60 vanligaste adjektiv - 215 träffar i lexikonet',
    wordIds: ['01505', '01117', '04602', '01741', '01234', '01058', '00659', '04308', '05431', '00755'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 3.3
  },
  {
    id: 'adjektiv_007',
    name: 'adjektiv (61-70)',
    description: '61-70 vanligaste adjektiv - 191 träffar i lexikonet',
    wordIds: ['00515', '00202', '02751', '02355', '09401', '00322', '02899', '02569', '00311', '13464'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 4.0
  },
  {
    id: 'adjektiv_008',
    name: 'adjektiv (71-80)',
    description: '71-80 vanligaste adjektiv - 165 träffar i lexikonet',
    wordIds: ['00647', '05259', '01401', '07440', '00532', '07278', '00379', '00866', '20372', '05079'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 4.1
  },
  {
    id: 'adjektiv_009',
    name: 'adjektiv (81-90)',
    description: '81-90 vanligaste adjektiv - 143 träffar i lexikonet',
    wordIds: ['17195', '02647', '07367', '00443', '02989', '00597', '00017', '03447', '05061', '05086'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 4.2
  },
  {
    id: 'adjektiv_010',
    name: 'adjektiv (91-100)',
    description: '91-100 vanligaste adjektiv - 128 träffar i lexikonet',
    wordIds: ['04803', '12377', '02204', '10773', '03990', '07499', '04771', '07410', '00535', '01702'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 4.3
  },
  {
    id: 'adjektiv_011',
    name: 'adjektiv (101-110)',
    description: '101-110 vanligaste adjektiv - 116 träffar i lexikonet',
    wordIds: ['00085', '04095', '04596', '10789', '04339', '02363', '07525', '01869', '08001', '00079'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 4.4
  },
  {
    id: 'adjektiv_012',
    name: 'adjektiv (111-120)',
    description: '111-120 vanligaste adjektiv - 106 träffar i lexikonet',
    wordIds: ['02058', '01078', '05136', '20373', '00248', '02214', '02465', '05668', '02150', '20017'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 4.5
  },
  {
    id: 'adjektiv_013',
    name: 'adjektiv (121-126)',
    description: '121-126 vanligaste adjektiv - 60 träffar i lexikonet',
    wordIds: ['12900', '05680', '00603', '00512', '00069', '02991'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 4.6
  },
  {
    id: 'adverb_001',
    name: 'adverb (1-10)',
    description: '1-10 vanligaste adverb - 2930 träffar i lexikonet',
    wordIds: ['03955', '05133', '02711', '00060', '00167', '00646', '08979', '04485', '11274', '03965'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'adverb_002',
    name: 'adverb (11-20)',
    description: '11-20 vanligaste adverb - 1101 träffar i lexikonet',
    wordIds: ['02381', '04569', '02966', '04724', '02688', '02690', '02845', '05114', '00561', '02866'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'adverb_003',
    name: 'adverb (21-30)',
    description: '21-30 vanligaste adverb - 483 träffar i lexikonet',
    wordIds: ['03171', '00432', '00375', '00582', '06773', '00452', '02914', '05708', '00683', '03279'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'adverb_004',
    name: 'adverb (31-40)',
    description: '31-40 vanligaste adverb - 335 träffar i lexikonet',
    wordIds: ['04892', '05459', '07700', '12274', '04287', '05500', '15519', '00061', '03187', '01701'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'adverb_005',
    name: 'adverb (41-50)',
    description: '41-50 vanligaste adverb - 225 träffar i lexikonet',
    wordIds: ['08984', '01764', '03211', '09229', '04480', '10593', '01464', '17210', '19467', '01420'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'adverb_006',
    name: 'adverb (51-60)',
    description: '51-60 vanligaste adverb - 142 träffar i lexikonet',
    wordIds: ['04877', '02950', '00767', '00294', '02658', '01180', '08535', '10033', '08728', '00487'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'adverb_007',
    name: 'adverb (61-67)',
    description: '61-67 vanligaste adverb - 79 träffar i lexikonet',
    wordIds: ['00873', '17211', '15960', '04261', '00062', '00519', '18671'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'konjunktion_001',
    name: 'konjunktion (1-7)',
    description: '1-7 vanligaste konjunktion - 514 träffar i lexikonet. Wiktionary: ord som binder samman två satsdelar eller satser och samtidigt anger ett förhållande mellan dessa, såsom att båda är sanna eller att den ena satsens sanning leder till den andra satsens sanning; vanliga exempel är och, eller, om, eftersom, medan, att etc.',
    wordIds: ['02173', '04151', '03954', '01456', '08042', '05748', '04289'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'preposition_001',
    name: 'preposition (1-9)',
    description: '1-9 vanligaste preposition - 515 träffar i lexikonet. Wiktionary: ord som ställs framför ett substantiv eller substantivfras och anger dess förhållande till resten av meningen, ofta positioner i rum och tid; ord såsom på, runt, före, efter, till, med etcetera',
    wordIds: ['00328', '05055', '00320', '00464', '04473', '00299', '15485', '16274', '00335'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'pronomen_001',
    name: 'pronomen (1-10)',
    description: '1-10 vanligaste pronomen - 6605 träffar i lexikonet',
    wordIds: ['02798', '00187', '02817', '00479', '00275', '15856', '01807', '00483', '07844', '03622'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'pronomen_002',
    name: 'pronomen (11-20)',
    description: '11-20 vanligaste pronomen - 450 träffar i lexikonet',
    wordIds: ['00124', '03639', '04864', '02828', '04333', '04153', '00123', '15855', '04264', '02370'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'pronomen_003',
    name: 'pronomen (21-25)',
    description: '21-25 vanligaste pronomen - 68 träffar i lexikonet',
    wordIds: ['00186', '00812', '11810', '01789', '02329'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'räkneord_001',
    name: 'räkneord (1-10)',
    description: '1-10 vanligaste räkneord - 988 träffar i lexikonet',
    wordIds: ['02852', '11879', '11880', '11882', '04475', '11881', '11898', '12054', '03451', '11910'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'räkneord_002',
    name: 'räkneord (11-20)',
    description: '11-20 vanligaste räkneord - 180 träffar i lexikonet',
    wordIds: ['11884', '11908', '11950', '11885', '11890', '11886', '04620', '11912', '11909', '11911'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'räkneord_003',
    name: 'räkneord (21-23)',
    description: '21-23 vanligaste räkneord - 31 träffar i lexikonet',
    wordIds: ['11892', '11891', '11894'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 8.0
  },
  {
    id: 'substantiv_001',
    name: 'substantiv (1-10)',
    description: '1-10 vanligaste substantiv - 1728 träffar i lexikonet',
    wordIds: ['01816', '02237', '00644', '02158', '02531', '00257', '04357', '09291', '01366', '01266'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'substantiv_002',
    name: 'substantiv (11-20)',
    description: '11-20 vanligaste substantiv - 627 träffar i lexikonet',
    wordIds: ['03640', '04919', '01944', '03194', '02557', '08045', '05428', '02831', '08135', '00696'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'substantiv_003',
    name: 'substantiv (21-30)',
    description: '21-30 vanligaste substantiv - 483 träffar i lexikonet',
    wordIds: ['00954', '00609', '03563', '00773', '00617', '00304', '05870', '01909', '00912', '01302'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'substantiv_004',
    name: 'substantiv (31-40)',
    description: '31-40 vanligaste substantiv - 390 träffar i lexikonet',
    wordIds: ['00222', '00770', '01377', '03700', '02117', '08116', '00708', '05382', '00623', '03552'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'substantiv_005',
    name: 'substantiv (41-50)',
    description: '41-50 vanligaste substantiv - 323 träffar i lexikonet',
    wordIds: ['05434', '04250', '04510', '07824', '06912', '09044', '03513', '00589', '02284', '04582'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'substantiv_006',
    name: 'substantiv (51-60)',
    description: '51-60 vanligaste substantiv - 289 träffar i lexikonet',
    wordIds: ['02839', '01210', '00610', '07603', '00632', '00498', '04593', '07549', '07668', '05697'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'substantiv_007',
    name: 'substantiv (61-70)',
    description: '61-70 vanligaste substantiv - 258 träffar i lexikonet',
    wordIds: ['05374', '00188', '02877', '08133', '01477', '01353', '17327', '11721', '08730', '01384'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'substantiv_008',
    name: 'substantiv (71-80)',
    description: '71-80 vanligaste substantiv - 246 träffar i lexikonet',
    wordIds: ['01943', '05150', '04603', '00344', '00472', '01553', '04024', '00286', '04540', '00058'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'substantiv_009',
    name: 'substantiv (81-90)',
    description: '81-90 vanligaste substantiv - 233 träffar i lexikonet',
    wordIds: ['02042', '02521', '03660', '03019', '05369', '02740', '05513', '02412', '01018', '00416'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'substantiv_010',
    name: 'substantiv (91-100)',
    description: '91-100 vanligaste substantiv - 225 träffar i lexikonet',
    wordIds: ['01581', '04408', '03839', '02224', '00979', '12048', '04568', '02875', '16261', '04567'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'substantiv_011',
    name: 'substantiv (101-110)',
    description: '101-110 vanligaste substantiv - 210 träffar i lexikonet',
    wordIds: ['03826', '03750', '09156', '00319', '07696', '01938', '01720', '01767', '04545', '12312'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'substantiv_012',
    name: 'substantiv (111-120)',
    description: '111-120 vanligaste substantiv - 193 träffar i lexikonet',
    wordIds: ['02378', '06723', '04560', '02861', '00059', '04008', '02775', '05395', '00945', '10692'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_013',
    name: 'substantiv (121-130)',
    description: '121-130 vanligaste substantiv - 182 träffar i lexikonet',
    wordIds: ['04853', '00106', '08386', '05072', '00339', '07219', '10521', '03456', '01106', '02574'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_014',
    name: 'substantiv (131-140)',
    description: '131-140 vanligaste substantiv - 172 träffar i lexikonet',
    wordIds: ['05831', '01038', '07961', '05777', '02890', '00391', '03156', '00516', '01550', '01282'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_015',
    name: 'substantiv (141-150)',
    description: '141-150 vanligaste substantiv - 161 träffar i lexikonet',
    wordIds: ['02037', '04907', '04299', '11733', '13821', '18191', '00496', '01259', '04397', '02538'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_016',
    name: 'substantiv (151-160)',
    description: '151-160 vanligaste substantiv - 150 träffar i lexikonet',
    wordIds: ['09318', '04718', '09701', '01416', '07822', '17265', '00664', '14854', '01786', '02924'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_017',
    name: 'substantiv (161-170)',
    description: '161-170 vanligaste substantiv - 141 träffar i lexikonet',
    wordIds: ['02445', '05214', '08870', '00588', '05635', '07405', '05036', '01522', '00995', '04527'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_018',
    name: 'substantiv (171-180)',
    description: '171-180 vanligaste substantiv - 134 träffar i lexikonet',
    wordIds: ['03152', '00864', '01217', '01875', '00303', '02504', '01913', '09098', '12226', '00262'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_019',
    name: 'substantiv (181-190)',
    description: '181-190 vanligaste substantiv - 129 träffar i lexikonet',
    wordIds: ['02773', '10930', '00669', '03638', '02203', '07858', '07958', '08205', '00678', '14976'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_020',
    name: 'substantiv (191-200)',
    description: '191-200 vanligaste substantiv - 120 träffar i lexikonet',
    wordIds: ['02215', '05539', '01978', '00838', '02089', '01251', '08580', '12779', '00439', '03411'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_021',
    name: 'substantiv (201-210)',
    description: '201-210 vanligaste substantiv - 120 träffar i lexikonet',
    wordIds: ['01462', '05134', '05846', '00555', '07606', '03741', '05499', '13038', '17726', '03809'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_022',
    name: 'substantiv (211-220)',
    description: '211-220 vanligaste substantiv - 112 träffar i lexikonet',
    wordIds: ['04025', '00573', '08316', '03356', '03828', '05056', '07605', '04184', '01403', '03629'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_023',
    name: 'substantiv (221-230)',
    description: '221-230 vanligaste substantiv - 110 träffar i lexikonet',
    wordIds: ['08476', '02622', '00449', '02395', '02061', '02130', '05787', '03018', '05240', '00418'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_024',
    name: 'substantiv (231-240)',
    description: '231-240 vanligaste substantiv - 104 träffar i lexikonet',
    wordIds: ['01759', '11658', '00247', '02519', '01939', '16268', '05564', '11459', '09659', '01260'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_025',
    name: 'substantiv (241-250)',
    description: '241-250 vanligaste substantiv - 100 träffar i lexikonet',
    wordIds: ['01613', '03555', '00993', '05660', '02472', '00088', '00223', '02352', '04491', '00490'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_026',
    name: 'substantiv (251-260)',
    description: '251-260 vanligaste substantiv - 100 träffar i lexikonet',
    wordIds: ['00488', '01168', '02208', '00676', '00200', '01737', '05988', '15259', '03191', '07749'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'substantiv_027',
    name: 'substantiv (261-263)',
    description: '261-263 vanligaste substantiv - 30 träffar i lexikonet',
    wordIds: ['03010', '02383', '04373'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 8.0
  },
  {
    id: 'verb_001',
    name: 'verb (1-10)',
    description: '1-10 vanligaste verb - 2297 träffar i lexikonet',
    wordIds: ['02238', '16234', '00022', '02712', '00204', '00958', '05173', '06832', '04104', '00563'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'verb_002',
    name: 'verb (11-20)',
    description: '11-20 vanligaste verb - 877 träffar i lexikonet',
    wordIds: ['02063', '01267', '09956', '00182', '00239', '04004', '00050', '02584', '02749', '02273'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'verb_003',
    name: 'verb (21-30)',
    description: '21-30 vanligaste verb - 473 träffar i lexikonet',
    wordIds: ['02433', '00625', '01862', '07173', '00935', '03033', '02892', '12313', '02436', '00312'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'verb_004',
    name: 'verb (31-40)',
    description: '31-40 vanligaste verb - 370 träffar i lexikonet',
    wordIds: ['03181', '00824', '04769', '01585', '00446', '04238', '08317', '01300', '08319', '01301'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'verb_005',
    name: 'verb (41-50)',
    description: '41-50 vanligaste verb - 286 träffar i lexikonet',
    wordIds: ['03854', '07621', '03253', '03936', '03115', '17018', '03023', '01571', '00616', '02522'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'verb_006',
    name: 'verb (51-60)',
    description: '51-60 vanligaste verb - 245 träffar i lexikonet',
    wordIds: ['00998', '02945', '02220', '01548', '00333', '07982', '03035', '02694', '00034', '01497'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'verb_007',
    name: 'verb (61-70)',
    description: '61-70 vanligaste verb - 192 träffar i lexikonet',
    wordIds: ['01710', '00277', '00805', '02222', '17620', '00354', '00378', '03919', '01722', '01547'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'verb_008',
    name: 'verb (71-80)',
    description: '71-80 vanligaste verb - 170 träffar i lexikonet',
    wordIds: ['00281', '04496', '16369', '06012', '00179', '00835', '00360', '04209', '02616', '04036'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'verb_009',
    name: 'verb (81-90)',
    description: '81-90 vanligaste verb - 153 träffar i lexikonet',
    wordIds: ['04364', '01828', '01143', '00173', '02747', '03410', '05673', '00666', '01218', '04101'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'verb_010',
    name: 'verb (91-100)',
    description: '91-100 vanligaste verb - 138 träffar i lexikonet',
    wordIds: ['02993', '04848', '02064', '00365', '02068', '05183', '01092', '02663', '13561', '09249'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'verb_011',
    name: 'verb (101-110)',
    description: '101-110 vanligaste verb - 129 träffar i lexikonet',
    wordIds: ['00098', '07789', '03184', '05683', '01876', '01882', '04191', '01716', '00207', '08360'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'verb_012',
    name: 'verb (111-120)',
    description: '111-120 vanligaste verb - 114 träffar i lexikonet',
    wordIds: ['04009', '01784', '03926', '00585', '04489', '00580', '05093', '15816', '00249', '10555'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'verb_013',
    name: 'verb (121-130)',
    description: '121-130 vanligaste verb - 110 träffar i lexikonet',
    wordIds: ['00529', '01901', '00044', '07714', '09032', '01820', '02739', '00648', '00163', '03852'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'verb_014',
    name: 'verb (131-140)',
    description: '131-140 vanligaste verb - 100 träffar i lexikonet',
    wordIds: ['03068', '02153', '14794', '00332', '01723', '02213', '15755', '02631', '00462', '12239'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'verb_015',
    name: 'verb (141-143)',
    description: '141-143 vanligaste verb - 30 träffar i lexikonet',
    wordIds: ['11794', '10979', '01870'],
    type: 'predefined',
    difficulty: 'proffs',
    priority: 8.0
  },
  {
    id: 'utan_ordklass_001',
    name: 'utan_ordklass (1-10)',
    description: '1-10 vanligaste ord utan ordklass - 1887 träffar i lexikonet',
    wordIds: ['00699', '02830', '10342', '18717', '03281', '02809', '00715', '01241', '03497', '12546'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'utan_ordklass_002',
    name: 'utan_ordklass (11-20)',
    description: '11-20 vanligaste ord utan ordklass - 517 träffar i lexikonet',
    wordIds: ['02686', '07516', '00064', '01062', '01695', '06495', '10533', '05135', '05071', '00857'],
    type: 'predefined',
    difficulty: 'nyborjare',
    priority: 5.0
  },
  {
    id: 'utan_ordklass_003',
    name: 'utan_ordklass (21-30)',
    description: '21-30 vanligaste ord utan ordklass - 283 träffar i lexikonet',
    wordIds: ['05490', '19460', '11833', '15804', '15873', '03474', '00112', '14530', '00900', '01994'],
    type: 'predefined',
    difficulty: 'lite_erfaren',
    priority: 6.0
  },
  {
    id: 'utan_ordklass_004',
    name: 'utan_ordklass (31-40)',
    description: '31-40 vanligaste ord utan ordklass - 197 träffar i lexikonet',
    wordIds: ['11860', '20028', '01458', '12325', '02978', '11454', '00177', '09222', '08027', '01841'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'utan_ordklass_005',
    name: 'utan_ordklass (41-50)',
    description: '41-50 vanligaste ord utan ordklass - 163 träffar i lexikonet',
    wordIds: ['18600', '12034', '03785', '01818', '08028', '01576', '02778', '04466', '00718', '02087'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'utan_ordklass_006',
    name: 'utan_ordklass (51-60)',
    description: '51-60 vanligaste ord utan ordklass - 140 träffar i lexikonet',
    wordIds: ['08597', '17331', '05295', '07429', '03499', '00118', '04318', '00240', '02689', '12052'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'utan_ordklass_007',
    name: 'utan_ordklass (61-70)',
    description: '61-70 vanligaste ord utan ordklass - 123 träffar i lexikonet',
    wordIds: ['19421', '15520', '00937', '01043', '01196', '00828', '00110', '01806', '01182', '08076'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'utan_ordklass_008',
    name: 'utan_ordklass (71-80)',
    description: '71-80 vanligaste ord utan ordklass - 108 träffar i lexikonet',
    wordIds: ['07612', '07346', '06432', '00313', '01206', '02851', '03540', '05647', '09519', '01221'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  },
  {
    id: 'utan_ordklass_009',
    name: 'utan_ordklass (81-86)',
    description: '81-86 vanligaste ord utan ordklass - 60 träffar i lexikonet',
    wordIds: ['02290', '02810', '17553', '02391', '02705', '00159'],
    type: 'predefined',
    difficulty: 'erfaren',
    priority: 7.0
  }*/
];

// Funktion för att hämta alla ordlistor (både förgenererade och dynamiska)
export const getAllWordLists = (database: any): WordList[] => {
  // console.log('[DEBUG] getAllWordLists called with database keys:', Object.keys(database).length);
  const dynamicLists: DynamicWordList[] = [
    {
      id: 'handalfabetet',
      name: 'Handalfabetet',
      description: 'Alla ord med ämnet "Handalfabetet"',
      subject: 'Handalfabetet',
      type: 'dynamic',
      difficulty: 'nyborjare',
      priority: 0.5,
      showInStartGuide: true,
      startGuidePosition: 1,
      showWordsInStartGuide: false
    },
    {
      id: 'bildelar',
      name: 'Bildelar',
      description: 'Alla ord med ämnet "Bildelar"',
      subject: 'Bildelar',
      type: 'dynamic',
      difficulty: 'erfaren',
      priority: 7.5
    },
    {
      id: 'kläder',
      name: 'Kläder',
      description: 'Alla ord med ämnet "Kläder"',
      subject: 'Kläder',
      type: 'dynamic',
      difficulty: 'lite_erfaren',
      priority: 6.5
    },
    {
      id: 'mat',
      name: 'Mat',
      description: 'Alla ord med ämnet "Mat"',
      subject: 'Mat',
      type: 'dynamic',
      difficulty: 'proffs',
      priority: 0.5
    }
  ];

  // console.log('[DEBUG] predefinedWordLists count:', predefinedWordLists.length);
  // console.log('[DEBUG] dynamicLists count:', dynamicLists.length);
  const result = [...predefinedWordLists, ...dynamicLists];
  // console.log('[DEBUG] Total lists returned:', result.length);
  return result;
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
    case 'nyborjare':
      return {
        label: 'Nivå 1',
        icon: '✋',
        color: 'success' as const,
        description: 'Allra vanligaste orden'
      };
    case 'lite_erfaren':
      return {
        label: 'Nivå 2',
        icon: '🤟',
        color: 'info' as const,
        description: 'Vardagsbegrepp'
      };
    case 'erfaren':
      return {
        label: 'Nivå 3',
        icon: '🙌',
        color: 'warning' as const,
        description: 'Abstraktare ord och fler rörelsemoment'
      };
    case 'proffs':
      return {
        label: 'Nivå 4',
        icon: '🤝',
        color: 'error' as const,
        description: 'Komplexa handformer eller mindre vanliga ord'
      };
    case 'fortsattning':
      return {
        label: 'Fortsättning',
        icon: '→',
        color: 'secondary' as const,
        description: 'Avancerade och specialiserade ord'
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
