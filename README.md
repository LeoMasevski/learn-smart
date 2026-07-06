# LearnSmart

LearnSmart je spletna aplikacija za personalizirano učenje. Študentom pomaga odkriti učni tip, se vpisati v predmete, pregledovati prilagojene lekcije in reševati kvize, profesorjem pa omogoča ustvarjanje predmetov, lekcij, AI-prilagojenih učnih variant in kvizov.

Aplikacija podpira tri učne tipe:

- vizualni
- slušni
- kinestetični

## Ključne Funkcionalnosti

- registracija in prijava uporabnikov
- vloge `STUDENT` in `PROFESSOR`
- podpora za Google OAuth prijavo
- podpora za dvofaktorsko avtentikacijo z aplikacijo za enkratne kode
- kviz za določanje učnega tipa po registraciji
- vpis študentov v predmete
- ustvarjanje predmetov, lekcij in kvizov za profesorje
- nalaganje PDF gradiv za lekcije
- AI-generiranje učnih variant za vizualni, slušni in kinestetični tip
- AI-generiranje kviz vprašanj
- reševanje kvizov in pregled rezultatov
- študentski dashboard za napredek
- profesorski dashboard za pregled predmetov, študentov in rezultatov
- Supabase Row Level Security migracije za dodatno zaščito podatkov

## Tehnološki Sklad

Različice so povzete iz `package.json`, `backend/package.json`, `frontend/package.json` in GitHub Actions nastavitev.

### Frontend

- React `^18.3.1`
- React DOM `^18.3.1`
- TypeScript `^5.5.3`
- Vite `^5.3.4`
- Tailwind CSS `^3.4.19`
- PostCSS `^8.5.14`
- Autoprefixer `^10.5.0`
- Axios `^1.16.1`
- Recharts `^3.8.1`
- Lucide React `^0.383.0`
- Vitest `^3.2.6`
- Testing Library React `^16.3.2`
- Testing Library Jest DOM `^6.9.1`
- Testing Library User Event `^14.6.1`
- Happy DOM `^20.10.6`
- jsdom `^27.0.1`

### Backend

- Node.js `20+`
- Express `^5.2.1`
- TypeScript `^6.0.3`
- Supabase JS client `^2.105.4`
- Gemini API prek `@google/genai` `^2.6.0`
- CORS `^2.8.6`
- dotenv `^17.4.2`
- Multer `^2.1.1`
- `pdf-parse` `^2.4.5`
- ws `^8.20.1`
- Jest `^30.4.2`
- ts-jest `^29.4.11`
- ts-node-dev `^2.0.0`

### Infrastruktura In Podatki

- Supabase Auth, Supabase Postgres in Supabase Storage: upravljane Supabase storitve; aplikacija uporablja `@supabase/supabase-js` `^2.105.4`
- Gemini API: aplikacija uporablja `@google/genai` `^2.6.0`
- GitHub Actions `actions/checkout@v4`
- GitHub Actions `actions/setup-node@v4`
- CI Node.js verzija `20`
- concurrently `^8.2.2`

## Struktura Projekta

```text
learn-smart/
  backend/                 Express API, avtentikacija, AI logika, Supabase dostop
  frontend/                React aplikacija
  supabase/migrations/     SQL migracije za bazo in RLS politike
  docs/                    projektna dokumentacija
  scripts/dev.js           skupni lokalni zagon frontenda in backenda
  .github/workflows/       CI testi
```

## Predpogoji

Pred zagonom potrebuješ:

- Node.js 20 ali novejši
- npm
- Supabase projekt
- Gemini API ključ
- ustvarjen Supabase Storage bucket za slike lekcij, privzeto `lesson_images`

## Lokalna Namestitev

1. Kloniraj repozitorij.

```bash
git clone <url-repozitorija>
cd learn-smart
```

2. Namesti odvisnosti.

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

3. Ustvari lokalni okoljski datoteki.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Na Windows PowerShell lahko uporabiš:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

4. Izpolni `backend/.env`.

```env
NODE_ENV=development
PORT=5000
SUPABASE_REST_API_URL=
SUPABASE_PUBLISHABLE_API_KEY=
SUPABASE_SECRET_API_KEY=
SUPABASE_LESSON_IMAGES_BUCKET=lesson_images
GEMINI_API_KEY=
FRONTEND_ORIGIN=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
JSON_BODY_LIMIT=1mb
PROFESSOR_REGISTRATION_CODE=
```

Pomen pomembnih spremenljivk:

- `SUPABASE_REST_API_URL`: URL Supabase projekta.
- `SUPABASE_PUBLISHABLE_API_KEY`: javni Supabase ključ.
- `SUPABASE_SECRET_API_KEY`: service-role ključ za backend. Tega ključa ne izpostavljaj v frontendu.
- `GEMINI_API_KEY`: ključ za Gemini API.
- `SUPABASE_LESSON_IMAGES_BUCKET`: ime bucketa za slike iz PDF lekcij.
- `PROFESSOR_REGISTRATION_CODE`: koda za ustvarjanje novih profesorskih računov. V produkciji jo nastavi obvezno.

5. Izpolni `frontend/.env`.

```env
VITE_API_URL=http://localhost:5000/api
```

## Nastavitev Supabase

1. V Supabase ustvari nov projekt.
2. V SQL Editorju zaženi migracije iz mape `supabase/migrations` v pravilnem vrstnem redu:

```text
001_initial_schema.sql
002_security_hardening.sql
```

3. Ustvari Storage bucket z imenom, ki je nastavljen v `SUPABASE_LESSON_IMAGES_BUCKET`, privzeto `lesson_images`.
4. V Supabase Auth po potrebi omogoči Google provider.
5. Za Google OAuth nastavi redirect URL na frontend callback, na primer:

```text
http://localhost:5173/auth/callback
```

Za produkcijo dodaj tudi produkcijski callback URL.

## Zagon Aplikacije

Za zagon frontenda in backenda hkrati iz korena projekta:

```bash
npm run dev
```

Privzeti lokalni naslovi:

- frontend: `http://localhost:5173`
- backend API: `http://localhost:5000/api`
- health check: `http://localhost:5000/health`

Ločen zagon:

```bash
npm run dev:backend
npm run dev:frontend
```

## Testi

Za vse teste:

```bash
npm test
```

Samo backend:

```bash
npm run test:backend
```

Samo frontend:

```bash
npm run test:frontend
```

Direktno po mapah:

```bash
npm test --prefix backend
npm test --prefix frontend
```

## Build

Za produkcijski build backenda in frontenda:

```bash
npm run build
```

Ločeno:

```bash
npm run build --prefix backend
npm run build --prefix frontend
```

Backend po buildu zaženeš z:

```bash
npm start --prefix backend
```

## Varnostne Opombe

- Datotek `.env` ne commitaj v Git.
- `SUPABASE_SECRET_API_KEY` uporabljaj samo na backendu.
- V produkciji nastavi `PROFESSOR_REGISTRATION_CODE`, da se profesorski računi ne morejo ustvarjati brez odobritve.
- Backend uporablja preverjanje vlog, lastništva lekcij in lastništva kvizov.
- AI generiranje ima omejitve zahtevkov, omejitve velikosti vhodnih podatkov in sanitizacijo generiranih blokov.
- Kviz oddaje se ocenjujejo proti celotnemu naboru vprašanj, manjkajoči odgovori štejejo kot napačni.
- Supabase RLS migracije so vključene kot dodatna zaščita, tudi če kdo dostopa neposredno prek javnega Supabase ključa.

## CI

GitHub Actions workflow v `.github/workflows/tests.yml` zažene:

- backend teste z Jest
- frontend teste z Vitest

Workflow se sproži na `push` in `pull_request` proti veji `develop`.

## Pogoste Težave

### Backend se ne zažene zaradi manjkajočih spremenljivk

Preveri, da ima `backend/.env` nastavljene vse obvezne vrednosti:

- `SUPABASE_REST_API_URL`
- `SUPABASE_PUBLISHABLE_API_KEY`
- `SUPABASE_SECRET_API_KEY`
- `GEMINI_API_KEY`

### Google prijava ne deluje

Preveri:

- ali je Google provider omogočen v Supabase Auth
- ali je redirect URL pravilno nastavljen
- ali `FRONTEND_ORIGIN` kaže na pravi frontend URL

### Profesor se ne more registrirati

V produkciji mora biti nastavljen `PROFESSOR_REGISTRATION_CODE`, uporabnik pa mora pri registraciji vnesti pravilno kodo.

### AI generiranje ne deluje

Preveri:

- ali je `GEMINI_API_KEY` nastavljen
- ali backend lahko dostopa do Gemini API
- ali vsebina lekcije ni prazna
- ali zahteva ni presegla omejitve generiranja

## Licenca

Projekt trenutno nima posebej določene licence.
