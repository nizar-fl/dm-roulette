'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, remove, onValue, push, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only on client side
let app: FirebaseApp | undefined;
let database: Database | undefined;

function getFirebaseApp() {
  if (typeof window === 'undefined') {
    return undefined;
  }
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

function getFirebaseDatabase() {
  if (typeof window === 'undefined') {
    return undefined;
  }
  if (!database) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      console.log('Initializing Firebase Database with URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
      database = getDatabase(firebaseApp);
      console.log('Firebase Database initialized');
    } else {
      console.error('Firebase App not initialized');
    }
  }
  return database;
}

// Database references (these will be undefined on server)
export const getGameStateRef = () => {
  const db = getFirebaseDatabase();
  return db ? ref(db, 'gameState') : null;
};

export const getPlayersRef = () => {
  const db = getFirebaseDatabase();
  return db ? ref(db, 'players') : null;
};

export const getPlayerRef = (playerId: string) => {
  const db = getFirebaseDatabase();
  return db ? ref(db, `players/${playerId}`) : null;
};

export { getFirebaseDatabase as database, ref, set, get, update, remove, onValue, push };
