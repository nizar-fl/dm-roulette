import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, update } from 'firebase/database';

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

export async function POST(request: Request) {
    try {
        const { playerId, response } = await request.json();

        if (!playerId) {
            return NextResponse.json(
                { error: 'Player ID is required' },
                { status: 400 }
            );
        }

        const db = getFirebaseDb();
        const playerRef = ref(db, `players/${playerId}`);

        // Update player's response
        await update(playerRef, {
            response: response || '',
            submitted: true,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting response:', error);
        return NextResponse.json(
            { error: 'Failed to submit response' },
            { status: 500 }
        );
    }
}
