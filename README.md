
# Lesson Planner UI

Glassmorphic React + TypeScript app for generating and editing lesson plans from prompts, templates, or curriculum outcomes (Alberta POS-ready, extensible to others).

## Tech Stack
- React + TypeScript + Vite
- Redux Toolkit + localStorage persistence
- React Router
- TailwindCSS (glassmorphism)
- Tiptap (rich text)
- Lucide icons

## Getting Started
```bash
npm i
npm run dev
```

## Firebase-backed outcomes
1. Create a Firebase project with Firestore and add a web app.
2. Copy the Firebase config into a `.env` file (Vite will load `.env.local`):
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
3. Add a service account key JSON (download from **Project Settings → Service Accounts → Generate new private key**) and point to it when importing (`FIREBASE_SERVICE_ACCOUNT=/path/key.json`).

### Import the K-9 math outcomes
```bash
# Preview the parsed dataset (writes dist/mathOutcomes.json, no Firebase call)
npm run import:math-outcomes -- --dry-run

# Push to Firestore (uses collection `mathOutcomes` by default)
FIREBASE_SERVICE_ACCOUNT=/path/serviceAccount.json npm run import:math-outcomes
```

The portal now loads outcomes directly from Firestore and the search inputs in **Outcomes → Find Outcomes** filter the live dataset.

## Notes
- Exports: Markdown and JSON implemented; PDF/DOCX stubs left for later.
- "Generate" is a placeholder — wire your GPT call in `Builder.tsx`.
