// Svårighetsnivåer för ordlistor
export type DifficultyLevel = 'handstart' | 'fingervana' | 'tecknare' | 'samspelare';

// Förgenererade ordlistor som är hårdkodade i källkoden
export interface PredefinedWordList {
  id: string;
  name: string;
  description: string;
  wordIds: string[]; // Array med ord-ID:n som ska vara i listan
  type: 'predefined'; // För att skilja från dynamiska listor
  difficulty: DifficultyLevel; // Svårighetsnivå för ordlistan
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
  
  return wordDifficultyMap?.get(wordId) || 'samspelare'; // Default till högsta svårighetsgrad
};

// Förgenererade ordlistor
export const predefinedWordLists: PredefinedWordList[] = [
  {
    id: 'siffror_0_10',
    name: 'Siffror 0-10',
    description: 'Siffrorna 0 - 10',
    wordIds: ['24273', '02852', '11879', '11880', '11881', '11882', '11950', '11884', '11885', '11886', '04475'],
    type: 'predefined',
    difficulty: 'handstart',
    showInStartGuide: true,
    startGuidePosition: 5,
    showWordsInStartGuide: true
  },
  {
    id: 'adjektiv_001',
    name: 'adjektiv vanligaste 1-20',
    description: '20 vanligaste adjektiv (rank 1-20)',
    wordIds: ['02801', '01061', '06767', '00086', '00310', '00074', '02375', '09120', '02850', '00789', '02365', '00193', '02354', '02847', '04606', '08479', '05158', '00469', '02293', '00256'],
    type: 'predefined',
    difficulty: 'handstart',
    showInStartGuide: true,
    startGuidePosition: 3,
    showWordsInStartGuide: true
  },
  {
    id: 'adjektiv_002',
    name: 'adjektiv vanligaste 21-40',
    description: '20 vanligaste adjektiv (rank 21-40)',
    wordIds: ['00289', '01609', '05076', '02645', '00720', '05705', '01885', '00298', '08776', '05642', '11866', '04866', '00387', '12125', '03145', '05131', '00631', '00607', '11320', '05218'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'adjektiv_003',
    name: 'adjektiv vanligaste 41-60',
    description: '20 vanligaste adjektiv (rank 41-60)',
    wordIds: ['03377', '07101', '02902', '00456', '00174', '00233', '03856', '00966', '00604', '00172', '01505', '01117', '04602', '01741', '01234', '01058', '00659', '04308', '05431', '00755'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'adjektiv_004',
    name: 'adjektiv vanligaste 61-80',
    description: '20 vanligaste adjektiv (rank 61-80)',
    wordIds: ['00515', '00202', '02751', '02355', '09401', '00322', '02899', '02569', '00311', '13464', '00647', '05259', '01401', '07440', '00532', '07278', '00379', '00866', '20372', '05079'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'adjektiv_005',
    name: 'adjektiv vanligaste 81-100',
    description: '20 vanligaste adjektiv (rank 81-100)',
    wordIds: ['17195', '02647', '07367', '00443', '02989', '00597', '00017', '03447', '05061', '05086', '04803', '12377', '02204', '10773', '03990', '07499', '04771', '07410', '00535', '01702'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'adjektiv_006',
    name: 'adjektiv vanligaste 101-120',
    description: '20 vanligaste adjektiv (rank 101-120)',
    wordIds: ['00085', '04095', '04596', '10789', '04339', '02363', '07525', '01869', '08001', '00079', '02058', '01078', '05136', '20373', '00248', '02214', '02465', '05668', '02150', '20017'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'adjektiv_007',
    name: 'adjektiv vanligaste 121-126 (sista gruppen)',
    description: '6 vanligaste adjektiv (rank 121-126)',
    wordIds: ['12900', '05680', '00603', '00512', '00069', '02991'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'adverb_008',
    name: 'adverb vanligaste 1-20',
    description: '20 vanligaste adverb (rank 1-20)',
    wordIds: ['03955', '05133', '02711', '00060', '00167', '00646', '08979', '04485', '11274', '03965', '02381', '04569', '02966', '04724', '02688', '02690', '02845', '05114', '00561', '02866'],
    type: 'predefined',
    difficulty: 'handstart',
    showInStartGuide: true,
    startGuidePosition: 4,
    showWordsInStartGuide: false
  },
  {
    id: 'adverb_009',
    name: 'adverb vanligaste 21-40',
    description: '20 vanligaste adverb (rank 21-40)',
    wordIds: ['03171', '00432', '00375', '00582', '06773', '00452', '02914', '05708', '00683', '03279', '04892', '05459', '07700', '12274', '04287', '05500', '15519', '00061', '03187', '01701'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'adverb_010',
    name: 'adverb vanligaste 41-60',
    description: '20 vanligaste adverb (rank 41-60)',
    wordIds: ['08984', '01764', '03211', '09229', '04480', '10593', '01464', '17210', '19467', '01420', '04877', '02950', '00767', '00294', '02658', '01180', '08535', '10033', '08728', '00487'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'adverb_011',
    name: 'adverb vanligaste 61-67 (sista gruppen)',
    description: '7 vanligaste adverb (rank 61-67)',
    wordIds: ['00873', '17211', '15960', '04261', '00062', '00519', '18671'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'artikel_012',
    name: 'artikel vanligaste 1-1 (sista gruppen)',
    description: '1 vanligaste artikel (rank 1-1)',
    wordIds: ['15606'],
    type: 'predefined',
    difficulty: 'handstart'
  },
  {
    id: 'interjektion_013',
    name: 'interjektion vanligaste 1-3 (sista gruppen)',
    description: '3 vanligaste interjektion (rank 1-3)',
    wordIds: ['00274', '08850', '14156'],
    type: 'predefined',
    difficulty: 'handstart'
  },
  {
    id: 'konjunktion_014',
    name: 'konjunktion vanligaste 1-7 (sista gruppen)',
    description: '7 vanligaste konjunktion (rank 1-7)',
    wordIds: ['02173', '04151', '03954', '01456', '08042', '05748', '04289'],
    type: 'predefined',
    difficulty: 'handstart'
  },
  {
    id: 'preposition_015',
    name: 'preposition vanligaste 1-9 (sista gruppen)',
    description: '9 vanligaste preposition (rank 1-9)',
    wordIds: ['00328', '05055', '00320', '00464', '04473', '00299', '15485', '16274', '00335'],
    type: 'predefined',
    difficulty: 'handstart'
  },
  {
    id: 'pronomen_016',
    name: 'pronomen vanligaste 1-20',
    description: '20 vanligaste pronomen (rank 1-20)',
    wordIds: ['02798', '00187', '02817', '00479', '00275', '15856', '01807', '00483', '07844', '03622', '00124', '03639', '04864', '02828', '04333', '04153', '00123', '15855', '04264', '02370'],
    type: 'predefined',
    difficulty: 'handstart',
    showInStartGuide: true,
    startGuidePosition: 6,
    showWordsInStartGuide: true
  },
  {
    id: 'pronomen_017',
    name: 'pronomen vanligaste 21-25 (sista gruppen)',
    description: '5 vanligaste pronomen (rank 21-25)',
    wordIds: ['00186', '00812', '11810', '01789', '02329'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'räkneord_018',
    name: 'räkneord vanligaste 1-20',
    description: '20 vanligaste räkneord (rank 1-20)',
    wordIds: ['02852', '11879', '11880', '11882', '04475', '11881', '11898', '12054', '03451', '11910', '11884', '11908', '11950', '11885', '11890', '11886', '04620', '11912', '11909', '11911'],
    type: 'predefined',
    difficulty: 'handstart'
  },
  {
    id: 'räkneord_019',
    name: 'räkneord vanligaste 21-23 (sista gruppen)',
    description: '3 vanligaste räkneord (rank 21-23)',
    wordIds: ['11892', '11891', '11894'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'substantiv_020',
    name: 'substantiv vanligaste 1-20',
    description: '20 vanligaste substantiv (rank 1-20)',
    wordIds: ['01816', '02237', '00644', '02158', '02531', '00257', '04357', '09291', '01366', '01266', '03640', '04919', '01944', '03194', '02557', '08045', '05428', '02831', '08135', '00696'],
    type: 'predefined',
    difficulty: 'handstart',
    showInStartGuide: true,
    startGuidePosition: 7,
    showWordsInStartGuide: true
  },
  {
    id: 'substantiv_021',
    name: 'substantiv vanligaste 21-40',
    description: '20 vanligaste substantiv (rank 21-40)',
    wordIds: ['00954', '00609', '03563', '00773', '00617', '00304', '05870', '01909', '00912', '01302', '00222', '00770', '01377', '03700', '02117', '08116', '00708', '05382', '00623', '03552'],
    type: 'predefined',
    difficulty: 'fingervana',
    showInStartGuide: true,
    startGuidePosition: 8,
    showWordsInStartGuide: true
  },
  {
    id: 'substantiv_022',
    name: 'substantiv vanligaste 41-60',
    description: '20 vanligaste substantiv (rank 41-60)',
    wordIds: ['05434', '04250', '04510', '07824', '06912', '09044', '03513', '00589', '02284', '04582', '02839', '01210', '00610', '07603', '00632', '00498', '04593', '07549', '07668', '05697'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'substantiv_023',
    name: 'substantiv vanligaste 61-80',
    description: '20 vanligaste substantiv (rank 61-80)',
    wordIds: ['05374', '00188', '02877', '08133', '01477', '01353', '17327', '11721', '08730', '01384', '01943', '05150', '04603', '00344', '00472', '01553', '04024', '00286', '04540', '00058'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'substantiv_024',
    name: 'substantiv vanligaste 81-100',
    description: '20 vanligaste substantiv (rank 81-100)',
    wordIds: ['02042', '02521', '03660', '03019', '05369', '02740', '05513', '02412', '01018', '00416', '01581', '04408', '03839', '02224', '00979', '12048', '04568', '02875', '16261', '04567'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'substantiv_025',
    name: 'substantiv vanligaste 101-120',
    description: '20 vanligaste substantiv (rank 101-120)',
    wordIds: ['03826', '03750', '09156', '00319', '07696', '01938', '01720', '01767', '04545', '12312', '02378', '06723', '04560', '02861', '00059', '04008', '02775', '05395', '00945', '10692'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'substantiv_026',
    name: 'substantiv vanligaste 121-140',
    description: '20 vanligaste substantiv (rank 121-140)',
    wordIds: ['04853', '00106', '08386', '05072', '00339', '07219', '10521', '03456', '01106', '02574', '05831', '01038', '07961', '05777', '02890', '00391', '03156', '00516', '01550', '01282'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'substantiv_027',
    name: 'substantiv vanligaste 141-160',
    description: '20 vanligaste substantiv (rank 141-160)',
    wordIds: ['02037', '04907', '04299', '11733', '13821', '18191', '00496', '01259', '04397', '02538', '09318', '04718', '09701', '01416', '07822', '17265', '00664', '14854', '01786', '02924'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'substantiv_028',
    name: 'substantiv vanligaste 161-180',
    description: '20 vanligaste substantiv (rank 161-180)',
    wordIds: ['02445', '05214', '08870', '00588', '05635', '07405', '05036', '01522', '00995', '04527', '03152', '00864', '01217', '01875', '00303', '02504', '01913', '09098', '12226', '00262'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'substantiv_029',
    name: 'substantiv vanligaste 181-200',
    description: '20 vanligaste substantiv (rank 181-200)',
    wordIds: ['02773', '10930', '00669', '03638', '02203', '07858', '07958', '08205', '00678', '14976', '02215', '05539', '01978', '00838', '02089', '01251', '08580', '12779', '00439', '03411'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'substantiv_030',
    name: 'substantiv vanligaste 201-220',
    description: '20 vanligaste substantiv (rank 201-220)',
    wordIds: ['01462', '05134', '05846', '00555', '07606', '03741', '05499', '13038', '17726', '03809', '04025', '00573', '08316', '03356', '03828', '05056', '07605', '04184', '01403', '03629'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'substantiv_031',
    name: 'substantiv vanligaste 221-240',
    description: '20 vanligaste substantiv (rank 221-240)',
    wordIds: ['08476', '02622', '00449', '02395', '02061', '02130', '05787', '03018', '05240', '00418', '01759', '11658', '00247', '02519', '01939', '16268', '05564', '11459', '09659', '01260'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'substantiv_032',
    name: 'substantiv vanligaste 241-260',
    description: '20 vanligaste substantiv (rank 241-260)',
    wordIds: ['01613', '03555', '00993', '05660', '02472', '00088', '00223', '02352', '04491', '00490', '00488', '01168', '02208', '00676', '00200', '01737', '05988', '15259', '03191', '07749'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'substantiv_033',
    name: 'substantiv vanligaste 261-263 (sista gruppen)',
    description: '3 vanligaste substantiv (rank 261-263)',
    wordIds: ['03010', '02383', '04373'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'verb_034',
    name: 'verb vanligaste 1-20',
    description: '20 vanligaste verb (rank 1-20)',
    wordIds: ['02238', '16234', '00022', '02712', '00204', '00958', '05173', '06832', '04104', '00563', '02063', '01267', '09956', '00182', '00239', '04004', '00050', '02584', '02749', '02273'],
    type: 'predefined',
    difficulty: 'handstart'
  },
  {
    id: 'verb_035',
    name: 'verb vanligaste 21-40',
    description: '20 vanligaste verb (rank 21-40)',
    wordIds: ['02433', '00625', '01862', '07173', '00935', '03033', '02892', '12313', '02436', '00312', '03181', '00824', '04769', '01585', '00446', '04238', '08317', '01300', '08319', '01301'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'verb_036',
    name: 'verb vanligaste 41-60',
    description: '20 vanligaste verb (rank 41-60)',
    wordIds: ['03854', '07621', '03253', '03936', '03115', '17018', '03023', '01571', '00616', '02522', '00998', '02945', '02220', '01548', '00333', '07982', '03035', '02694', '00034', '01497'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'verb_037',
    name: 'verb vanligaste 61-80',
    description: '20 vanligaste verb (rank 61-80)',
    wordIds: ['01710', '00277', '00805', '02222', '17620', '00354', '00378', '03919', '01722', '01547', '00281', '04496', '16369', '06012', '00179', '00835', '00360', '04209', '02616', '04036'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'verb_038',
    name: 'verb vanligaste 81-100',
    description: '20 vanligaste verb (rank 81-100)',
    wordIds: ['04364', '01828', '01143', '00173', '02747', '03410', '05673', '00666', '01218', '04101', '02993', '04848', '02064', '00365', '02068', '05183', '01092', '02663', '13561', '09249'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'verb_039',
    name: 'verb vanligaste 101-120',
    description: '20 vanligaste verb (rank 101-120)',
    wordIds: ['00098', '07789', '03184', '05683', '01876', '01882', '04191', '01716', '00207', '08360', '04009', '01784', '03926', '00585', '04489', '00580', '05093', '15816', '00249', '10555'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'verb_040',
    name: 'verb vanligaste 121-140',
    description: '20 vanligaste verb (rank 121-140)',
    wordIds: ['00529', '01901', '00044', '07714', '09032', '01820', '02739', '00648', '00163', '03852', '03068', '02153', '14794', '00332', '01723', '02213', '15755', '02631', '00462', '12239'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'verb_041',
    name: 'verb vanligaste 141-143 (sista gruppen)',
    description: '3 vanligaste verb (rank 141-143)',
    wordIds: ['11794', '10979', '01870'],
    type: 'predefined',
    difficulty: 'tecknare'
  },
  {
    id: 'utan_ordklass_042',
    name: 'Utan ordklass vanligaste 1-20',
    description: '20 vanligaste ord utan ordklass (rank 1-20)',
    wordIds: ['00699', '02830', '10342', '18717', '03281', '02809', '00715', '01241', '03497', '12546', '02686', '07516', '00064', '01062', '01695', '06495', '10533', '05135', '05071', '00857'],
    type: 'predefined',
    difficulty: 'handstart'
  },
  {
    id: 'utan_ordklass_043',
    name: 'Utan ordklass vanligaste 21-40',
    description: '20 vanligaste ord utan ordklass (rank 21-40)',
    wordIds: ['05490', '19460', '11833', '15804', '15873', '03474', '00112', '14530', '00900', '01994', '11860', '20028', '01458', '12325', '02978', '11454', '00177', '09222', '08027', '01841'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'utan_ordklass_044',
    name: 'Utan ordklass vanligaste 41-60',
    description: '20 vanligaste ord utan ordklass (rank 41-60)',
    wordIds: ['18600', '12034', '03785', '01818', '08028', '01576', '02778', '04466', '00718', '02087', '08597', '17331', '05295', '07429', '03499', '00118', '04318', '00240', '02689', '12052'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'utan_ordklass_045',
    name: 'Utan ordklass vanligaste 61-80',
    description: '20 vanligaste ord utan ordklass (rank 61-80)',
    wordIds: ['19421', '15520', '00937', '01043', '01196', '00828', '00110', '01806', '01182', '08076', '07612', '07346', '06432', '00313', '01206', '02851', '03540', '05647', '09519', '01221'],
    type: 'predefined',
    difficulty: 'fingervana'
  },
  {
    id: 'utan_ordklass_046',
    name: 'Utan ordklass vanligaste 81-86 (sista gruppen)',
    description: '6 vanligaste ord utan ordklass (rank 81-86)',
    wordIds: ['02290', '02810', '17553', '02391', '02705', '00159'],
    type: 'predefined',
    difficulty: 'fingervana'
  }
];

// Funktion för att hämta alla ordlistor (både förgenererade och dynamiska)
export const getAllWordLists = (database: any): WordList[] => {
  console.log('[DEBUG] getAllWordLists called with database keys:', Object.keys(database).length);
  const dynamicLists: DynamicWordList[] = [
    {
      id: 'handalfabetet',
      name: 'Handalfabetet',
      description: 'Alla ord med ämnet "Handalfabetet"',
      subject: 'Handalfabetet',
      type: 'dynamic',
      difficulty: 'handstart',
      showInStartGuide: true,
      startGuidePosition: 1,
      showWordsInStartGuide: false
    },
    {
      id: 'siffror',
      name: 'Siffror',
      description: 'Alla ord med ämnet "Siffror"',
      subject: 'Siffror',
      type: 'dynamic',
      difficulty: 'handstart',
      showInStartGuide: true,
      startGuidePosition: 2,
      showWordsInStartGuide: true
    },
    {
      id: 'bildelar',
      name: 'Bildelar',
      description: 'Alla ord med ämnet "Bildelar"',
      subject: 'Bildelar',
      type: 'dynamic',
      difficulty: 'tecknare'
    },
    {
      id: 'kläder',
      name: 'Kläder',
      description: 'Alla ord med ämnet "Kläder"',
      subject: 'Kläder',
      type: 'dynamic',
      difficulty: 'fingervana'
    },
    {
      id: 'mat',
      name: 'Mat',
      description: 'Alla ord med ämnet "Mat"',
      subject: 'Mat',
      type: 'dynamic',
      difficulty: 'samspelare'
    }
  ];

  console.log('[DEBUG] predefinedWordLists count:', predefinedWordLists.length);
  console.log('[DEBUG] dynamicLists count:', dynamicLists.length);
  const result = [...predefinedWordLists, ...dynamicLists];
  console.log('[DEBUG] Total lists returned:', result.length);
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
    case 'handstart':
      return {
        label: 'Handstart',
        icon: '✋',
        color: 'success' as const,
        description: 'Allra vanligaste orden'
      };
    case 'fingervana':
      return {
        label: 'Fingervana',
        icon: '🤟',
        color: 'info' as const,
        description: 'Vardagsbegrepp'
      };
    case 'tecknare':
      return {
        label: 'Tecknare',
        icon: '🙌',
        color: 'warning' as const,
        description: 'Abstraktare ord och fler rörelsemoment'
      };
    case 'samspelare':
      return {
        label: 'Samspelare',
        icon: '🤝',
        color: 'error' as const,
        description: 'Komplexa handformer eller mindre vanliga ord'
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
