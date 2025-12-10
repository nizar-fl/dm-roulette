'use client';

import { useState, useEffect } from 'react';
import { getGameStateRef, getPlayersRef, onValue } from '@/lib/firebase';
import { GameState, Player, PlayersMap } from '@/lib/types';
import ResponseModal from '@/components/ResponseModal';

export default function AdminPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [gameState, setGameState] = useState<GameState>({ started: false, roundEndsAt: null });
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [authError, setAuthError] = useState('');

    const ADMIN_PIN = '654321';

    // Check if we're on client
    useEffect(() => {
        setIsClient(true);
        // Check session storage for existing auth
        if (sessionStorage.getItem('dm-roulette-admin-auth') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
            sessionStorage.setItem('dm-roulette-admin-auth', 'true');
            setAuthError('');
        } else {
            setAuthError('Incorrect PIN');
            setPin('');
        }
    };

    // Listen to game state changes
    useEffect(() => {
        if (!isClient || !isAuthenticated) return;

        const gameStateRef = getGameStateRef();
        if (!gameStateRef) return;

        const unsubscribe = onValue(gameStateRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setGameState(data);
            } else {
                setGameState({ started: false, roundEndsAt: null });
            }
        });
        return () => unsubscribe();
    }, [isClient, isAuthenticated]);

    // Listen to players changes
    useEffect(() => {
        if (!isClient || !isAuthenticated) return;

        const playersRef = getPlayersRef();
        if (!playersRef) return;

        const unsubscribe = onValue(playersRef, (snapshot) => {
            const data: PlayersMap = snapshot.val() || {};
            const playersList = Object.values(data);
            setPlayers(playersList);
        });
        return () => unsubscribe();
    }, [isClient, isAuthenticated]);

    // Timer countdown
    useEffect(() => {
        if (!gameState.roundEndsAt) {
            setTimeLeft(0);
            return;
        }

        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((gameState.roundEndsAt! - Date.now()) / 1000));
            setTimeLeft(remaining);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [gameState.roundEndsAt]);

    const handleStartGame = async () => {
        if (players.length === 0) {
            alert('No players have joined yet!');
            return;
        }

        setIsStarting(true);
        try {
            const res = await fetch('/api/start-game', { method: 'POST' });
            if (!res.ok) {
                throw new Error('Failed to start game');
            }
        } catch (error) {
            console.error('Error starting game:', error);
            alert('Failed to start game');
        } finally {
            setIsStarting(false);
        }
    };

    const handleResetGame = async () => {
        if (!confirm('Are you sure you want to reset the game? This will remove all players.')) {
            return;
        }

        setIsResetting(true);
        try {
            const res = await fetch('/api/reset-game', { method: 'POST' });
            if (!res.ok) {
                throw new Error('Failed to reset game');
            }
        } catch (error) {
            console.error('Error resetting game:', error);
            alert('Failed to reset game');
        } finally {
            setIsResetting(false);
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

    // Auth screen
    if (!isAuthenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Enter PIN</label>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 font-mono text-center tracking-widest text-lg"
                                placeholder="••••••"
                                autoFocus
                                maxLength={6}
                            />
                        </div>
                        {authError && (
                            <p className="text-red-500 text-sm text-center">{authError}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    const submittedCount = players.filter(p => p.submitted).length;
    const missingCount = players.length - submittedCount;
    const roundEnded = gameState.started && timeLeft === 0;

    return (
        <main className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">DM Roulette - Admin</h1>
                    <button
                        onClick={() => {
                            setIsAuthenticated(false);
                            sessionStorage.removeItem('dm-roulette-admin-auth');
                        }}
                        className="text-sm text-gray-500 hover:text-red-500 underline"
                    >
                        Logout
                    </button>
                </div>

                {/* Game Status */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Game Status</h2>
                            {!gameState.started ? (
                                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                    Waiting for players
                                </span>
                            ) : roundEnded ? (
                                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                    Round Ended
                                </span>
                            ) : (
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    Round Active
                                </span>
                            )}
                        </div>

                        {gameState.started && (
                            <div className="text-right">
                                <div className={`text-4xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
                                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {submittedCount}/{players.length} submitted ({missingCount} missing)
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4">Controls</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={handleStartGame}
                            disabled={gameState.started || isStarting || players.length === 0}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isStarting ? 'Starting...' : 'Start Game'}
                        </button>
                        <button
                            onClick={handleResetGame}
                            disabled={isResetting}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isResetting ? 'Resetting...' : 'Reset Game'}
                        </button>
                    </div>
                </div>

                {/* Players List */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">
                        Players ({players.length})
                    </h2>

                    {players.length === 0 ? (
                        <p className="text-gray-500 italic">No players have joined yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{player.name}</span>
                                        {gameState.started && (
                                            <>
                                                <span className="text-sm text-gray-500">
                                                    (Scenario #{player.scenarioId})
                                                </span>
                                                {player.submitted ? (
                                                    <span className="text-green-600 text-sm">✓ Submitted</span>
                                                ) : (
                                                    <span className="text-yellow-600 text-sm">⏳ Pending</span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {(roundEnded || player.submitted) && (
                                        <button
                                            onClick={() => setSelectedPlayer(player)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                        >
                                            View Response
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Response Modal */}
            {selectedPlayer && (
                <ResponseModal
                    player={selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                />
            )}
        </main>
    );
}
