# Authentication setup

## Password policy

LearnSmart requires passwords with:

- at least 15 characters
- at least one uppercase letter
- at least one number
- at least one symbol
- at most 128 characters

The frontend validates this before registration, and the backend validates it again in `backend/src/utils/validation.ts`.

## Google login

Google login uses Supabase OAuth. If Google login shows an error such as `provider not enabled`, enable and configure Google in Supabase:

1. In Supabase, open Authentication > Providers > Google.
2. Enable Google.
3. Add the Google OAuth Client ID and Client Secret from Google Cloud Console.
4. In Google Cloud Console, add this authorized redirect URI:

   ```text
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```

5. In Google Cloud Console, add this authorized JavaScript origin for local development:

   ```text
   http://localhost:5173
   ```

6. In Supabase Authentication > URL Configuration, set the local site URL:

   ```text
   http://localhost:5173
   ```

7. Add the local redirect URL:

   ```text
   http://localhost:5173/auth/callback
   ```

8. In `backend/.env`, set:

   ```text
   FRONTEND_ORIGIN=http://localhost:5173
   ```

For production, add the production frontend origin and `/auth/callback` URL in the same places.

## Two-factor authentication

2FA uses Supabase TOTP factors. Users enable it from the dashboard security panel by scanning the QR code in an authenticator app and confirming the 6-digit code.

After a verified TOTP factor exists, password and Google login both require the authenticator code before the app session is accepted. Protected backend routes also reject non-MFA sessions for users who have a verified factor.

If a user loses access to the authenticator app, reset or remove the MFA factor from Supabase Auth user management.

## Current security measures

- Google OAuth via Supabase.
- TOTP-based 2FA via Supabase MFA.
- Strong password validation on frontend and backend.
- Auth and API rate limiting.
- Restricted CORS origins from environment config.
- Common security headers and disabled `X-Powered-By`.
- Auth responses are sent with `Cache-Control: no-store`.
