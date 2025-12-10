import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';
import { ROUND_DURATION_SECONDS } from '@/lib/scenarios';

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

        // Get all players
        const playersRef = ref(db, 'players');
        const playersSnapshot = await get(playersRef);
        const players = playersSnapshot.val() || {};

        // Assign random scenario IDs to each player
        const updates: Record<string, unknown> = {};
        Object.keys(players).forEach((playerId) => {
            const randomScenarioId = Math.floor(Math.random() * 6) + 1; // 1-6
            updates[`players/${playerId}/scenarioId`] = randomScenarioId;
            updates[`players/${playerId}/response`] = '';
            updates[`players/${playerId}/submitted`] = false;
        });

        // Set game state
        const roundEndsAt = Date.now() + (ROUND_DURATION_SECONDS * 1000);
        updates['gameState/started'] = true;
        updates['gameState/roundEndsAt'] = roundEndsAt;

        // Apply all updates atomically
        const rootRef = ref(db);
        await update(rootRef, updates);

        return NextResponse.json({
            success: true,
            roundEndsAt,
            playerCount: Object.keys(players).length
        });
    } catch (error) {
        console.error('Error starting game:', error);
        return NextResponse.json(
            { error: 'Failed to start game' },
            { status: 500 }
        );
    }
}
