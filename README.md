# TSP Skolan Webpage

En React-app för att lära sig teckenspråk, byggd med TypeScript och Material UI.

## Funktioner

- **Bottom Navigation**: Enkel navigation mellan 4 huvudsektioner
- **Övning**: Plats för framtida övningsfunktioner
- **Listor**: Sub-tabs för att hantera ordlistor och progress
- **Lexikon**: Sökfunktion för teckenspråksord
- **Inställningar**: Anpassningsalternativ för appen

## Teknisk Stack

- **React 18** - Frontend framework
- **TypeScript** - Typesäker JavaScript
- **Material UI (MUI)** - UI-komponenter och styling
- **React Router** - Navigation (förberedd för framtida användning)

## Installation

1. Installera dependencies:
```bash
npm install
```

2. Starta utvecklingsservern:
```bash
npm start
```

3. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Projektstruktur

```
src/
├── pages/           # Huvudsidor
│   ├── OvningPage.tsx
│   ├── ListorPage.tsx
│   ├── LexikonPage.tsx
│   └── InstallningarPage.tsx
├── App.tsx          # Huvudkomponent med navigation
├── index.tsx        # App entry point
└── index.css        # Globala stilar
```

## Utveckling

Appen är byggd med mobila enheter i fokus och använder:
- Responsive design
- Touch-friendly komponenter
- Material Design principer
- TypeScript för typesäkerhet

## Kommande Funktioner

- Implementering av övningsfunktioner
- Sökfunktionalitet i lexikonet
- Databasintegration för ordlistor
- Användarprogress tracking
- Mörkt tema
- Notifikationer
