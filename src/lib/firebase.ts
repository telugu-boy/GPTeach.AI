import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { Firestore, getFirestore } from 'firebase/firestore'

type FirebaseConfig = FirebaseOptions & {
  projectId: string
}

function buildConfig(): FirebaseConfig | null {
  const config: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  }
  const missing = Object.entries(config).filter(([, value]) => !value)
  if (missing.length) {
    if (import.meta.env.DEV) {
      console.warn(
        'Firebase configuration missing for keys:',
        missing.map(([key]) => key).join(', ')
      )
    }
    return null
  }
  return config
}

let app: FirebaseApp | null = null
let db: Firestore | null = null

export function getFirebaseApp(): FirebaseApp | null {
  if (app) return app
  const config = buildConfig()
  if (!config) return null
  app = getApps().length ? getApp() : initializeApp(config)
  return app
}

export function getDb(): Firestore | null {
  if (db) return db
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) return null
  db = getFirestore(firebaseApp)
  return db
}

export function isFirebaseConfigured(): boolean {
  return Boolean(buildConfig())
}
