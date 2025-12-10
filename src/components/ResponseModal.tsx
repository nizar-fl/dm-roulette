'use client';

import { Player } from '@/lib/types';
import { getScenarioText } from '@/lib/scenarios';

interface ResponseModalProps {
    player: Player;
    onClose: () => void;
}

export default function ResponseModal({ player, onClose }: ResponseModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{player.name}'s Response</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Scenario #{player.scenarioId}</p>
                    <p className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded text-sm">
                        {player.scenarioId ? getScenarioText(player.scenarioId) : 'No scenario assigned'}
                    </p>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Response:</p>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded min-h-[100px]">
                        {player.response || <span className="text-gray-400 italic">No response submitted</span>}
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className={player.submitted ? 'text-green-600' : 'text-red-600'}>
                        {player.submitted ? '✓ Submitted' : '✗ Not submitted'}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
