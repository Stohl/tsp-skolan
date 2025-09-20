// Svårighetsnivåer för ordlistor
export type DifficultyLevel = 'nyborjare' | 'lite_erfaren' | 'erfaren' | 'proffs';

// Förgenererade ordlistor som är hårdkodade i källkoden
export interface PredefinedWordList {
  id: string;
  name: string;
  description: string;
  wordIds: string[]; // Array med ord-ID:n som ska vara i listan
  type: 'predefined'; // För att skilja från dynamiska listor
  difficulty: DifficultyLevel; // Svårighetsnivå för ordlistan
  priority: number; // Prioritering för lärande (0 och uppåt, decimaler tillåtna)
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
      id: 'pedagogic_001',
      name: 'Grundläggande kommunikation (1-10)',
      description: '1-10 pedagogiskt sorterade ord - 5731 träffar i lexikonet',
      wordIds: ['02798', '02817', '00479', '15855', '00812', '02238', '00022', '05173', '00239', '02158'],
    type: 'predefined',
      difficulty: 'nyborjare',
      priority: 1
    },
    {
      id: 'pedagogic_002',
      name: 'Grundläggande kommunikation (11-20)',
      description: '11-20 pedagogiskt sorterade ord - 777 träffar i lexikonet',
      wordIds: ['00257', '01266', '02557', '00696', '00222', '00188', '01384', '05150', '00344', '02711'],
      type: 'predefined',
      difficulty: 'nyborjare',
      priority: 2
    },
    {
      id: 'pedagogic_003',
      name: 'Vardagsliv och behov (21-30)',
      description: '21-30 pedagogiskt sorterade ord - 698 träffar i lexikonet',
      wordIds: ['11274', '03965', '05114', '02866', '00452', '00683', '15519', '15960', '00519', '02352'],
      type: 'predefined',
      difficulty: 'nyborjare',
      priority: 3
    },
    {
      id: 'pedagogic_004',
      name: 'Vardagsliv och behov (31-40)',
      description: '31-40 pedagogiskt sorterade ord - 486 träffar i lexikonet',
      wordIds: ['00086', '09120', '00789', '08479', '00256', '00607', '11320', '00604', '01505', '00659'],
      type: 'predefined',
      difficulty: 'nyborjare',
      priority: 4
    },
    {
      id: 'pedagogic_005',
      name: 'Vardagsliv och behov (41-50)',
      description: '41-50 pedagogiskt sorterade ord - 178 träffar i lexikonet',
      wordIds: ['05259', '07367', '07410', '05680', '02042', '01913', '08776', '00966', '03447', '05136'],
      type: 'predefined',
      difficulty: 'nyborjare',
      priority: 5
    },
    {
      id: 'pedagogic_006',
      name: 'Känslor och upplevelser (51-60)',
      description: '51-60 pedagogiskt sorterade ord - 666 träffar i lexikonet',
      wordIds: ['02773', '00773', '01477', '02966', '01701', '17211', '00328', '05055', '00320', '00464'],
      type: 'predefined',
      difficulty: 'lite_erfaren',
      priority: 6
    },
    {
      id: 'pedagogic_007',
      name: 'Abstrakta begrepp (61-70)',
      description: '61-70 pedagogiskt sorterade ord - 644 träffar i lexikonet',
      wordIds: ['04473', '15485', '02173', '04151', '03954', '01456', '05748', '03563', '00617', '00304'],
      type: 'predefined',
      difficulty: 'lite_erfaren',
      priority: 7
    },
    {
      id: 'pedagogic_008',
      name: 'Tekniska begrepp (71-80)',
      description: '71-80 pedagogiskt sorterade ord - 420 träffar i lexikonet',
      wordIds: ['05870', '01909', '00912', '01302', '00770', '01377', '03700', '02117', '08116', '00708'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 8,
    },
    {
      id: 'pedagogic_009',
      name: 'Tekniska begrepp (81-90)',
      description: '81-90 pedagogiskt sorterade ord - 343 träffar i lexikonet',
      wordIds: ['05382', '00623', '03552', '05434', '04250', '04510', '07824', '06912', '09044', '03513'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 9,
    },
    {
      id: 'pedagogic_010',
      name: 'Tekniska begrepp (91-100)',
      description: '91-100 pedagogiskt sorterade ord - 296 träffar i lexikonet',
      wordIds: ['00589', '02284', '04582', '02839', '01210', '00610', '07603', '00632', '00498', '04593'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 10,
    },
    {
      id: 'pedagogic_011',
      name: 'Tekniska begrepp (101-110)',
      description: '101-110 pedagogiskt sorterade ord - 264 träffar i lexikonet',
      wordIds: ['07549', '07668', '05697', '05374', '02877', '08133', '01353', '17327', '11721', '08730'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 11,
    },
    {
      id: 'pedagogic_012',
      name: 'Tekniska begrepp (111-120)',
      description: '111-120 pedagogiskt sorterade ord - 244 träffar i lexikonet',
      wordIds: ['01943', '04603', '00472', '01553', '04024', '00286', '04540', '00058', '02521', '03660'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 12,
    },
    {
      id: 'pedagogic_013',
      name: 'Tekniska begrepp (121-130)',
      description: '121-130 pedagogiskt sorterade ord - 230 träffar i lexikonet',
      wordIds: ['03019', '05369', '02740', '05513', '02412', '01018', '00416', '01581', '04408', '03839'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 13,
    },
    {
      id: 'pedagogic_014',
      name: 'Tekniska begrepp (131-140)',
      description: '131-140 pedagogiskt sorterade ord - 222 träffar i lexikonet',
      wordIds: ['02224', '00979', '12048', '04568', '02875', '16261', '04567', '03826', '03750', '09156'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 14,
    },
    {
      id: 'pedagogic_015',
      name: 'Tekniska begrepp (141-150)',
      description: '141-150 pedagogiskt sorterade ord - 204 träffar i lexikonet',
      wordIds: ['00319', '07696', '01938', '01720', '01767', '04545', '12312', '02378', '06723', '04560'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 15,
    },
    {
      id: 'pedagogic_016',
      name: 'Tekniska begrepp (151-160)',
      description: '151-160 pedagogiskt sorterade ord - 189 träffar i lexikonet',
      wordIds: ['02861', '00059', '04008', '02775', '05395', '00945', '10692', '04853', '00106', '08386'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 16,
    },
    {
      id: 'pedagogic_017',
      name: 'Tekniska begrepp (161-170)',
      description: '161-170 pedagogiskt sorterade ord - 179 träffar i lexikonet',
      wordIds: ['05072', '00339', '07219', '10521', '03456', '01106', '02574', '05831', '01038', '07961'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 17,
    },
    {
      id: 'pedagogic_018',
      name: 'Tekniska begrepp (171-180)',
      description: '171-180 pedagogiskt sorterade ord - 169 träffar i lexikonet',
      wordIds: ['05777', '02890', '00391', '03156', '00516', '01550', '01282', '02037', '04907', '04299'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 18,
    },
    {
      id: 'pedagogic_019',
      name: 'Tekniska begrepp (181-190)',
      description: '181-190 pedagogiskt sorterade ord - 156 träffar i lexikonet',
      wordIds: ['11733', '13821', '18191', '00496', '01259', '04397', '02538', '09318', '04718', '09701'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 19,
    },
    {
      id: 'pedagogic_020',
      name: 'Tekniska begrepp (191-200)',
      description: '191-200 pedagogiskt sorterade ord - 148 träffar i lexikonet',
      wordIds: ['01416', '07822', '17265', '00664', '14854', '01786', '02924', '02445', '05214', '08870'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 20,
    },
    {
      id: 'pedagogic_021',
      name: 'Tekniska begrepp (201-210)',
      description: '201-210 pedagogiskt sorterade ord - 140 träffar i lexikonet',
      wordIds: ['00588', '05635', '07405', '05036', '01522', '00995', '04527', '03152', '00864', '01217'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 21,
    },
    {
      id: 'pedagogic_022',
      name: 'Tekniska begrepp (211-220)',
      description: '211-220 pedagogiskt sorterade ord - 131 träffar i lexikonet',
      wordIds: ['01875', '00303', '02504', '09098', '12226', '00262', '10930', '00669', '03638', '02203'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 22,
    },
    {
      id: 'pedagogic_023',
      name: 'Tekniska begrepp (221-230)',
      description: '221-230 pedagogiskt sorterade ord - 124 träffar i lexikonet',
      wordIds: ['07858', '07958', '08205', '00678', '14976', '02215', '05539', '01978', '00838', '02089'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 23,
    },
    {
      id: 'pedagogic_024',
      name: 'Tekniska begrepp (231-240)',
      description: '231-240 pedagogiskt sorterade ord - 120 träffar i lexikonet',
      wordIds: ['01251', '08580', '12779', '00439', '03411', '01462', '05134', '05846', '00555', '07606'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 24,
    },
    {
      id: 'pedagogic_025',
      name: 'Tekniska begrepp (241-250)',
      description: '241-250 pedagogiskt sorterade ord - 117 träffar i lexikonet',
      wordIds: ['03741', '05499', '13038', '17726', '03809', '04025', '00573', '08316', '03356', '03828'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 25,
    },
    {
      id: 'pedagogic_026',
      name: 'Tekniska begrepp (251-260)',
      description: '251-260 pedagogiskt sorterade ord - 110 träffar i lexikonet',
      wordIds: ['05056', '07605', '04184', '01403', '03629', '08476', '02622', '00449', '02395', '02061'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 26,
    },
    {
      id: 'pedagogic_027',
      name: 'Tekniska begrepp (261-270)',
      description: '261-270 pedagogiskt sorterade ord - 109 träffar i lexikonet',
      wordIds: ['02130', '05787', '03018', '05240', '00418', '01759', '11658', '00247', '02519', '01939'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 27,
    },
    {
      id: 'pedagogic_028',
      name: 'Tekniska begrepp (271-280)',
      description: '271-280 pedagogiskt sorterade ord - 100 träffar i lexikonet',
      wordIds: ['16268', '05564', '11459', '09659', '01260', '01613', '03555', '00993', '05660', '02472'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 28,
    },
    {
      id: 'pedagogic_029',
      name: 'Tekniska begrepp (281-290)',
      description: '281-290 pedagogiskt sorterade ord - 100 träffar i lexikonet',
      wordIds: ['00088', '00223', '04491', '00490', '00488', '01168', '02208', '00676', '00200', '01737'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 29,
    },
    {
      id: 'pedagogic_030',
      name: 'Tekniska begrepp (291-300)',
      description: '291-300 pedagogiskt sorterade ord - 215 träffar i lexikonet',
      wordIds: ['05988', '15259', '03191', '07749', '03010', '02383', '04373', '07173', '00935', '03033'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 30,
    },
    {
      id: 'pedagogic_031',
      name: 'Tekniska begrepp (301-310)',
      description: '301-310 pedagogiskt sorterade ord - 409 träffar i lexikonet',
      wordIds: ['02892', '12313', '02436', '00312', '03181', '00824', '04769', '01585', '00446', '04238'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 31,
    },
    {
      id: 'pedagogic_032',
      name: 'Tekniska begrepp (311-320)',
      description: '311-320 pedagogiskt sorterade ord - 311 träffar i lexikonet',
      wordIds: ['08317', '01300', '08319', '01301', '03854', '07621', '03253', '03936', '03115', '17018'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 32,
    },
    {
      id: 'pedagogic_033',
      name: 'Tekniska begrepp (321-330)',
      description: '321-330 pedagogiskt sorterade ord - 262 träffar i lexikonet',
      wordIds: ['03023', '01571', '00616', '02522', '00998', '02945', '02220', '01548', '00333', '07982'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 33,
    },
    {
      id: 'pedagogic_034',
      name: 'Tekniska begrepp (331-340)',
      description: '331-340 pedagogiskt sorterade ord - 213 träffar i lexikonet',
      wordIds: ['03035', '02694', '00034', '01497', '01710', '00277', '00805', '02222', '17620', '00354'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 34,
    },
    {
      id: 'pedagogic_035',
      name: 'Tekniska begrepp (341-350)',
      description: '341-350 pedagogiskt sorterade ord - 176 träffar i lexikonet',
      wordIds: ['00378', '03919', '01722', '01547', '00281', '04496', '16369', '06012', '00179', '00835'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 35,
    },
    {
      id: 'pedagogic_036',
      name: 'Tekniska begrepp (351-360)',
      description: '351-360 pedagogiskt sorterade ord - 159 träffar i lexikonet',
      wordIds: ['00360', '04209', '02616', '04036', '04364', '01828', '01143', '00173', '02747', '03410'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 36,
    },
    {
      id: 'pedagogic_037',
      name: 'Tekniska begrepp (361-370)',
      description: '361-370 pedagogiskt sorterade ord - 144 träffar i lexikonet',
      wordIds: ['05673', '00666', '01218', '04101', '02993', '04848', '02064', '00365', '02068', '05183'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 37,
    },
    {
      id: 'pedagogic_038',
      name: 'Tekniska begrepp (371-380)',
      description: '371-380 pedagogiskt sorterade ord - 132 träffar i lexikonet',
      wordIds: ['01092', '02663', '13561', '09249', '00098', '07789', '03184', '05683', '01876', '01882'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 38,
    },
    {
      id: 'pedagogic_039',
      name: 'Tekniska begrepp (381-390)',
      description: '381-390 pedagogiskt sorterade ord - 121 träffar i lexikonet',
      wordIds: ['04191', '01716', '00207', '08360', '04009', '01784', '03926', '00585', '04489', '00580'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 39,
    },
    {
      id: 'pedagogic_040',
      name: 'Tekniska begrepp (391-400)',
      description: '391-400 pedagogiskt sorterade ord - 110 träffar i lexikonet',
      wordIds: ['05093', '15816', '00249', '10555', '00529', '01901', '00044', '07714', '09032', '01820'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 40,
    },
    {
      id: 'pedagogic_041',
      name: 'Tekniska begrepp (401-410)',
      description: '401-410 pedagogiskt sorterade ord - 104 träffar i lexikonet',
      wordIds: ['02739', '00648', '00163', '03852', '03068', '02153', '14794', '00332', '01723', '02213'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 41,
    },
    {
      id: 'pedagogic_042',
      name: 'Tekniska begrepp (411-420)',
      description: '411-420 pedagogiskt sorterade ord - 215 träffar i lexikonet',
      wordIds: ['15755', '02631', '00462', '12239', '11794', '10979', '01870', '00469', '02293', '00289'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 42,
    },
    {
      id: 'pedagogic_043',
      name: 'Tekniska begrepp (421-430)',
      description: '421-430 pedagogiskt sorterade ord - 397 träffar i lexikonet',
      wordIds: ['01609', '05076', '02645', '00720', '05705', '01885', '00298', '05642', '11866', '04866'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 43,
    },
    {
      id: 'pedagogic_044',
      name: 'Tekniska begrepp (431-440)',
      description: '431-440 pedagogiskt sorterade ord - 276 träffar i lexikonet',
      wordIds: ['00387', '12125', '03145', '05131', '00631', '05218', '03377', '07101', '02902', '00456'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 44,
    },
    {
      id: 'pedagogic_045',
      name: 'Tekniska begrepp (441-450)',
      description: '441-450 pedagogiskt sorterade ord - 223 träffar i lexikonet',
      wordIds: ['00174', '00233', '03856', '00172', '01117', '04602', '01741', '01234', '01058', '04308'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 45,
    },
    {
      id: 'pedagogic_046',
      name: 'Tekniska begrepp (451-460)',
      description: '451-460 pedagogiskt sorterade ord - 197 träffar i lexikonet',
      wordIds: ['05431', '00755', '00515', '00202', '02751', '02355', '09401', '00322', '02899', '02569'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 46,
    },
    {
      id: 'pedagogic_047',
      name: 'Tekniska begrepp (461-470)',
      description: '461-470 pedagogiskt sorterade ord - 169 träffar i lexikonet',
      wordIds: ['00311', '13464', '00647', '01401', '07440', '00532', '07278', '00379', '00866', '20372'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 47,
    },
    {
      id: 'pedagogic_048',
      name: 'Tekniska begrepp (471-480)',
      description: '471-480 pedagogiskt sorterade ord - 142 träffar i lexikonet',
      wordIds: ['05079', '17195', '02647', '00443', '02989', '00597', '00017', '05061', '05086', '04803'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 48,
    },
    {
      id: 'pedagogic_049',
      name: 'Tekniska begrepp (481-490)',
      description: '481-490 pedagogiskt sorterade ord - 126 träffar i lexikonet',
      wordIds: ['12377', '02204', '10773', '03990', '07499', '04771', '00535', '01702', '00085', '04095'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 49,
    },
    {
      id: 'pedagogic_050',
      name: 'Tekniska begrepp (491-500)',
      description: '491-500 pedagogiskt sorterade ord - 114 träffar i lexikonet',
      wordIds: ['04596', '10789', '04339', '02363', '07525', '01869', '08001', '00079', '02058', '01078'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 50,
    },
    {
      id: 'pedagogic_051',
      name: 'Tekniska begrepp (501-510)',
      description: '501-510 pedagogiskt sorterade ord - 103 träffar i lexikonet',
      wordIds: ['20373', '00248', '02214', '02465', '05668', '02150', '20017', '12900', '00603', '00512'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 51,
    },
    {
      id: 'pedagogic_052',
      name: 'Tekniska begrepp (511-520)',
      description: '511-520 pedagogiskt sorterade ord - 4435 träffar i lexikonet',
      wordIds: ['00069', '02991', '00187', '03955', '00699', '02852', '05133', '01816', '16234', '02237'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 52,
    },
    {
      id: 'pedagogic_053',
      name: 'Avancerade begrepp (521-530)',
      description: '521-530 pedagogiskt sorterade ord - 2487 träffar i lexikonet',
      wordIds: ['02830', '02712', '00204', '00060', '10342', '00167', '00958', '00644', '00646', '08979'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 53,
    },
    {
      id: 'pedagogic_054',
      name: 'Avancerade begrepp (531-540)',
      description: '531-540 pedagogiskt sorterade ord - 1689 träffar i lexikonet',
      wordIds: ['02801', '04485', '00275', '01061', '15856', '02531', '02381', '18717', '01807', '11879'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 54,
    },
    {
      id: 'pedagogic_055',
      name: 'Avancerade begrepp (541-550)',
      description: '541-550 pedagogiskt sorterade ord - 1228 träffar i lexikonet',
      wordIds: ['04569', '06767', '06832', '04104', '00563', '15606', '04724', '00483', '02688', '07844'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 55,
    },
    {
      id: 'pedagogic_056',
      name: 'Avancerade begrepp (551-560)',
      description: '551-560 pedagogiskt sorterade ord - 1005 träffar i lexikonet',
      wordIds: ['02063', '04357', '03622', '01267', '03281', '09956', '02809', '00182', '02690', '04004'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 56,
    },
    {
      id: 'pedagogic_057',
      name: 'Avancerade begrepp (561-570)',
      description: '561-570 pedagogiskt sorterade ord - 865 träffar i lexikonet',
      wordIds: ['02845', '00310', '00050', '11880', '00561', '09291', '00124', '03639', '00715', '01366'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 57,
    },
    {
      id: 'pedagogic_058',
      name: 'Avancerade begrepp (571-580)',
      description: '571-580 pedagogiskt sorterade ord - 734 träffar i lexikonet',
      wordIds: ['01241', '03497', '00074', '02375', '03640', '02850', '02365', '04919', '00193', '02584'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 58,
    },
    {
      id: 'pedagogic_059',
      name: 'Avancerade begrepp (581-590)',
      description: '581-590 pedagogiskt sorterade ord - 645 träffar i lexikonet',
      wordIds: ['12546', '02686', '01944', '02354', '03194', '02749', '07516', '03171', '00064', '02847'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 59,
    },
    {
      id: 'pedagogic_060',
      name: 'Avancerade begrepp (591-600)',
      description: '591-600 pedagogiskt sorterade ord - 576 träffar i lexikonet',
      wordIds: ['11882', '08045', '05428', '02831', '02273', '08135', '04864', '04606', '00954', '01062'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 60,
    },
    {
      id: 'pedagogic_061',
      name: 'Avancerade begrepp (601-610)',
      description: '601-610 pedagogiskt sorterade ord - 522 träffar i lexikonet',
      wordIds: ['05158', '04475', '00432', '00609', '02433', '00375', '01695', '00582', '00625', '01862'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 61,
    },
    {
      id: 'pedagogic_062',
      name: 'Avancerade begrepp (611-620)',
      description: '611-620 pedagogiskt sorterade ord - 458 träffar i lexikonet',
      wordIds: ['11881', '06495', '10533', '06773', '11898', '02914', '02828', '05708', '05135', '12054'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 62,
    },
    {
      id: 'pedagogic_063',
      name: 'Avancerade begrepp (621-630)',
      description: '621-630 pedagogiskt sorterade ord - 400 träffar i lexikonet',
      wordIds: ['03451', '08042', '03279', '04892', '05071', '05459', '00857', '05490', '07700', '00274'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 63,
    },
    {
      id: 'pedagogic_064',
      name: 'Avancerade begrepp (631-640)',
      description: '631-640 pedagogiskt sorterade ord - 331 träffar i lexikonet',
      wordIds: ['04333', '04153', '19460', '11833', '00123', '12274', '04287', '05500', '00061', '15804'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 64,
    },
    {
      id: 'pedagogic_065',
      name: 'Avancerade begrepp (641-650)',
      description: '641-650 pedagogiskt sorterade ord - 277 träffar i lexikonet',
      wordIds: ['11910', '15873', '08850', '00299', '03187', '04289', '08984', '01764', '11884', '03211'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 65,
    },
    {
      id: 'pedagogic_066',
      name: 'Avancerade begrepp (651-660)',
      description: '651-660 pedagogiskt sorterade ord - 241 träffar i lexikonet',
      wordIds: ['03474', '04264', '02370', '00112', '14530', '11908', '09229', '00900', '11950', '04480'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 66,
    },
    {
      id: 'pedagogic_067',
      name: 'Avancerade begrepp (661-670)',
      description: '661-670 pedagogiskt sorterade ord - 212 träffar i lexikonet',
      wordIds: ['00186', '10593', '01994', '01464', '11885', '11860', '20028', '01458', '12325', '02978'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 67,
    },
    {
      id: 'pedagogic_068',
      name: 'Avancerade begrepp (671-680)',
      description: '671-680 pedagogiskt sorterade ord - 189 träffar i lexikonet',
      wordIds: ['11454', '17210', '11890', '19467', '14156', '00177', '09222', '08027', '01841', '01420'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 68,
    },
    {
      id: 'pedagogic_069',
      name: 'Avancerade begrepp (681-690)',
      description: '681-690 pedagogiskt sorterade ord - 169 träffar i lexikonet',
      wordIds: ['04877', '02950', '18600', '12034', '03785', '01818', '08028', '01576', '02778', '16274'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 69,
    },
    {
      id: 'pedagogic_070',
      name: 'Avancerade begrepp (691-700)',
      description: '691-700 pedagogiskt sorterade ord - 149 träffar i lexikonet',
      wordIds: ['04466', '00767', '11886', '00718', '02087', '04620', '08597', '17331', '05295', '07429'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 70,
    },
    {
      id: 'pedagogic_071',
      name: 'Avancerade begrepp (701-710)',
      description: '701-710 pedagogiskt sorterade ord - 136 träffar i lexikonet',
      wordIds: ['03499', '00294', '00118', '04318', '00240', '02658', '02689', '12052', '01180', '19421'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 71,
    },
    {
      id: 'pedagogic_072',
      name: 'Avancerade begrepp (711-720)',
      description: '711-720 pedagogiskt sorterade ord - 126 träffar i lexikonet',
      wordIds: ['11912', '11909', '15520', '00937', '08535', '10033', '08728', '00487', '01043', '01196'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 72,
    },
    {
      id: 'pedagogic_073',
      name: 'Avancerade begrepp (721-730)',
      description: '721-730 pedagogiskt sorterade ord - 117 träffar i lexikonet',
      wordIds: ['11810', '00828', '00110', '00873', '01806', '01182', '08076', '07612', '07346', '06432'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 73,
    },
    {
      id: 'pedagogic_074',
      name: 'Avancerade begrepp (731-740)',
      description: '731-740 pedagogiskt sorterade ord - 109 träffar i lexikonet',
      wordIds: ['00313', '01206', '02851', '04261', '11911', '00062', '11892', '03540', '05647', '09519'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 74,
    },
    {
      id: 'pedagogic_075',
      name: 'Avancerade begrepp (741-750)',
      description: '741-750 pedagogiskt sorterade ord - 100 träffar i lexikonet',
      wordIds: ['01221', '02290', '02810', '01789', '02329', '17553', '02391', '00335', '02705', '00159'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 75,
    },
    {
      id: 'pedagogic_076',
      name: 'Avancerade begrepp (751-753)',
      description: '751-753 pedagogiskt sorterade ord - 30 träffar i lexikonet',
      wordIds: ['18671', '11891', '11894'],
      type: 'predefined',
      difficulty: 'proffs',
      priority: 76,
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
  console.log('[DEBUG] getAllWordLists called with database keys:', Object.keys(database).length);
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
    case 'nyborjare':
      return {
        label: 'Nybörjare',
        icon: '✋',
        color: 'success' as const,
        description: 'Allra vanligaste orden'
      };
    case 'lite_erfaren':
      return {
        label: 'Lite erfaren',
        icon: '🤟',
        color: 'info' as const,
        description: 'Vardagsbegrepp'
      };
    case 'erfaren':
      return {
        label: 'Erfaren',
        icon: '🙌',
        color: 'warning' as const,
        description: 'Abstraktare ord och fler rörelsemoment'
      };
    case 'proffs':
      return {
        label: 'Proffs',
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
