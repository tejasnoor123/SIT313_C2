# DEV@Deakin — D1 Project

React + Vite frontend with an Express backend and Firebase Firestore integration.

## Project structure

- `src/` — React frontend.
- `backendgithub/` — Express API server.
- `public/` — static images and assets.
- `netlify.toml` — Netlify build and React Router fallback configuration.
- `.env.example` and `backendgithub/.env.example` — environment variable templates (do not put real secrets in Git).

## Run locally

Requirements: a current Node.js LTS release and npm.

1. Copy `.env.example` to `.env` and fill in the Firebase web app values from Firebase Console. Leave `VITE_API_URL=http://localhost:3000` for local development.
2. Copy `backendgithub/.env.example` to `backendgithub/.env`. Fill in the same Firebase project values and set `JWT_SECRET` to a long random secret.
3. Install and start the backend in one terminal:

   ```bash
   cd backendgithub
   npm install
   npm start
   ```

4. In a second terminal at the project root, install and start the frontend:

   ```bash
   npm install
   npm run dev
   ```

5. Build the frontend before deployment with `npm run build`.

## Deploy the backend to Render

Create a Render Web Service connected to this repository. Set **Root Directory** to `backendgithub`, **Build Command** to `npm install`, and **Start Command** to `npm start`. Add `JWT_SECRET` and the `FIREBASE_*` environment variables from the backend example in Render's Environment settings. Add `SENDGRID_API_KEY` and `FROM_EMAIL` only if email delivery is configured. Render provides `PORT` automatically.

## Deploy the frontend to Netlify

Import this repository into Netlify. Use the repository root as the base directory, `npm run build` as the build command, and `dist` as the publish directory. Add `VITE_API_URL` set to the public Render service URL (no trailing slash), plus all six `VITE_FIREBASE_*` values shown in `.env.example`. Redeploy after changing environment variables because Vite embeds them at build time. `netlify.toml` contains the build and SPA fallback settings.

## Git safety

Do not commit `.env`, `backendgithub/.env`, private keys, or service-account credentials. The example files contain placeholders only. The Firebase web API key is intended for browser configuration; protect Firestore data with correct Firebase Security Rules.

## Assignment demo note

The pricing upgrade flow is a demonstration and is not a real payment-processing integration. Do not enter real card details.
