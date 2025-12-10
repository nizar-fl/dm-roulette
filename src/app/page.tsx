'use client';

import { useState, useEffect } from 'react';
import { getGameStateRef, getPlayersRef, getPlayerRef, onValue, set, push } from '@/lib/firebase';
import { ref, getDatabase } from 'firebase/database';
import { GameState, Player } from '@/lib/types';
import PlayerLobby from '@/components/PlayerLobby';
import PlayerGame from '@/components/PlayerGame';

export default function Home() {
  const [name, setName] = useState('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState>({ started: false, roundEndsAt: null });
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Check if we're on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for existing player in localStorage
  useEffect(() => {
    if (!isClient) return;
    const storedPlayerId = localStorage.getItem('dm-roulette-playerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    }
  }, [isClient]);

  // Listen to game state changes
  useEffect(() => {
    if (!isClient) return;

    const gameStateRef = getGameStateRef();
    if (!gameStateRef) return;

    const unsubscribe = onValue(gameStateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
      }
    });
    return () => unsubscribe();
  }, [isClient]);

  // Listen to player data changes
  useEffect(() => {
    if (!isClient || !playerId) return;

    const playerRef = getPlayerRef(playerId);
    if (!playerRef) return;

    const unsubscribe = onValue(playerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlayer(data);
      } else {
        // Player was removed (game reset)
        setPlayerId(null);
        setPlayer(null);
        localStorage.removeItem('dm-roulette-playerId');
      }
    });
    return () => unsubscribe();
  }, [isClient, playerId]);

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsJoining(true);
    setError('');
    console.log('Starting join process...');

    try {
      const playersRef = getPlayersRef();
      console.log('Players ref:', playersRef);

      if (!playersRef) {
        throw new Error('Database not initialized - playersRef is null');
      }

      // Create new player entry
      console.log('Creating new player ref...');
      const newPlayerRef = push(playersRef);
      const newPlayerId = newPlayerRef.key!;
      console.log('New player ID:', newPlayerId);

      const newPlayer: Player = {
        id: newPlayerId,
        name: name.trim(),
        scenarioId: null,
        response: '',
        submitted: false,
      };

      console.log('Saving player to Firebase...');

      // Add timeout to prevent hanging forever
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firebase operation timed out after 10 seconds. Check your database URL and security rules.')), 10000);
      });

      await Promise.race([set(newPlayerRef, newPlayer), timeoutPromise]);
      console.log('Player saved successfully!');

      // Store player ID in localStorage
      localStorage.setItem('dm-roulette-playerId', newPlayerId);
      setPlayerId(newPlayerId);
      setPlayer(newPlayer);
    } catch (err) {
      console.error('Error joining game:', err);
      setError(`Failed to join: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsJoining(false);
    }
  };

  // Show loading while checking client state
  if (!isClient) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  // Not joined yet - show join form
  if (!playerId || !player) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">DM Roulette</h1>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Enter your name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700"
                placeholder="Your name..."
                disabled={isJoining}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Joined, waiting for game to start
  if (!gameState.started || !player.scenarioId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">DM Roulette</h1>
          <PlayerLobby playerName={player.name} />
        </div>
      </main>
    );
  }

  // Game is active
  return (
    <main className="min-h-screen p-4 pt-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">DM Roulette</h1>
        <PlayerGame
          playerId={playerId}
          playerName={player.name}
          scenarioId={player.scenarioId}
          roundEndsAt={gameState.roundEndsAt || Date.now()}
          submitted={player.submitted}
          existingResponse={player.response}
        />
      </div>
    </main>
  );
}
