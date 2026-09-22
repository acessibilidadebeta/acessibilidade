import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
const env = import.meta.env;
export const firebaseConfigured = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_AUTH_DOMAIN && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_APP_ID);
const app: FirebaseApp | null = firebaseConfigured ? initializeApp({ apiKey:env.VITE_FIREBASE_API_KEY, authDomain:env.VITE_FIREBASE_AUTH_DOMAIN, projectId:env.VITE_FIREBASE_PROJECT_ID, storageBucket:env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId:env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId:env.VITE_FIREBASE_APP_ID }) : null;
export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;
