# learn-smart
LearnSmart je spletna aplikacija za personalizirano učenje, ki s pomočjo AI prilagaja učne vsebine različnim učnim tipom (vizualni, slušni, kinestetični). Sistem vključuje AI-generirane lekcije, kvize ter dashboarde za študente in profesorje za spremljanje napredka in analitiko učenja.

## Lokalni zagon

1. Nastavi `backend/.env` po zgledu `backend/.env.example`.
2. Nastavi `frontend/.env` po zgledu `frontend/.env.example`.
3. Zaženi `npm run dev` iz korena repozitorija.

Backend uporablja Express, Supabase in Gemini. Frontend uporablja React, TypeScript, Vite, Tailwind CSS in Recharts.

## Baza

Za začetno Supabase shemo uporabi migracijo v `supabase/migrations/001_initial_schema.sql`.
