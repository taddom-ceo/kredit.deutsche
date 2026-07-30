# Fintech DE — Website

Next.js (App Router, TypeScript, Tailwind) marketing site. Public, no login/auth.
Contact form submissions are written to Firestore via a server-side API route
(`/api/contact`) using the Firebase Admin SDK — the client never talks to
Firebase directly.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase setup

1. Create a Firebase project, and when creating the Firestore database pick an
   **EU region** (e.g. `eur3` / `europe-west`) for GDPR compliance.
2. Firebase Console → Project Settings → Service accounts → Generate new
   private key.
3. Copy `.env.example` to `.env.local` and fill in the three values from that
   key file (`project_id`, `client_email`, `private_key`).
4. Add the same three variables in Vercel → Project Settings → Environment
   Variables for the deployed site.

No Firebase Auth is used — the site has no accounts or login.

## Deploy

Push to GitHub, then import the repo on [Vercel](https://vercel.com/new).
