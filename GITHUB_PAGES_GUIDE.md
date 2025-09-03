# GitHub Pages Aktivering - Steg för Steg

## 🚀 Aktivera GitHub Pages

För att få din app att fungera live på https://stohl.github.io behöver du aktivera GitHub Pages i din repository settings.

### Steg 1: Gå till Repository Settings
1. Öppna https://github.com/Stohl/stohl.github.io
2. Klicka på **"Settings"** (fliken längst till höger)

### Steg 2: Aktivera Pages
1. Scrolla ner i vänstermenyn
2. Klicka på **"Pages"** (under "Code and automation")

### Steg 3: Konfigurera Deployment
1. Under **"Source"** välj **"Deploy from a branch"**
2. Under **"Branch"** välj:
   - **Branch:** `gh-pages`
   - **Folder:** `/ (root)`
3. Klicka **"Save"**

### Steg 4: Vänta på Deployment
- Det kan ta 5-10 minuter för första gången
- Du kommer att se en grön bock när det är klart
- Din app kommer att vara live på: **https://stohl.github.io**

## 🔄 Uppdatera Appen Live

När du gör ändringar i koden:

```bash
# 1. Commita ändringarna
git add .
git commit -m "Beskrivning av ändringarna"
git push

# 2. Deploya till GitHub Pages
npm run deploy
```

## 📱 Testa Appen

Efter aktivering kan du:
- **Öppna** https://stohl.github.io
- **Testa** alla funktioner (Övning, Listor, Lexikon, Inställningar)
- **Söka** efter ord i lexikonet
- **Bläddra** kategorier i listor

## ❓ Felsökning

Om appen inte fungerar:
1. **Kontrollera** att gh-pages branchen finns
2. **Vänta** 5-10 minuter efter deployment
3. **Rensa** webbläsarens cache
4. **Kontrollera** att GitHub Pages är aktiverat i settings

## 🎯 Viktigt

- **gh-pages branchen** innehåller den kompilerade appen
- **main branchen** innehåller källkoden
- **npm run deploy** bygger och deployar automatiskt
- **GitHub Pages** serverar statiska filer från gh-pages branchen
