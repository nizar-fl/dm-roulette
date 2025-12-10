'use client';

interface PlayerLobbyProps {
    playerName: string;
}

export default function PlayerLobby({ playerName }: PlayerLobbyProps) {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome, {playerName}!</h2>
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                <p className="text-lg mb-2">Waiting for the game to start...</p>
                <div className="animate-pulse flex justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-1"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-1 animation-delay-200"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-1 animation-delay-400"></div>
                </div>
            </div>
        </div>
    );
}
