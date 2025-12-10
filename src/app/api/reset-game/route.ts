import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, set, remove } from 'firebase/database';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseDb() {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    return getDatabase(app);
}

export async function POST() {
    try {
        const db = getFirebaseDb();

        // Reset game state
        const gameStateRef = ref(db, 'gameState');
        await set(gameStateRef, {
            started: false,
            roundEndsAt: null,
        });

        // Remove all players
        const playersRef = ref(db, 'players');
        await remove(playersRef);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error resetting game:', error);
        return NextResponse.json(
            { error: 'Failed to reset game' },
            { status: 500 }
        );
    }
}
