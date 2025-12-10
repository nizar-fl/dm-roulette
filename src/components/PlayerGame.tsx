'use client';

import { useState, useEffect } from 'react';
import { getScenarioText } from '@/lib/scenarios';

interface PlayerGameProps {
    playerId: string;
    playerName: string;
    scenarioId: number;
    roundEndsAt: number;
    submitted: boolean;
    existingResponse: string;
}

export default function PlayerGame({
    playerId,
    playerName,
    scenarioId,
    roundEndsAt,
    submitted: initialSubmitted,
    existingResponse,
}: PlayerGameProps) {
    const [response, setResponse] = useState(existingResponse || '');
    const [submitted, setSubmitted] = useState(initialSubmitted);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roundEnded, setRoundEnded] = useState(false);

    // Timer countdown
    useEffect(() => {
        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((roundEndsAt - Date.now()) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0 && !submitted && !roundEnded) {
                setRoundEnded(true);
                // Auto-submit empty response when time runs out
                handleAutoSubmit();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [roundEndsAt, submitted, roundEnded]);

    const handleAutoSubmit = async () => {
        if (submitted) return;

        try {
            await fetch('/api/submit-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId,
                    response: response || 'No response',
                }),
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Auto-submit failed:', error);
        }
    };

    const handleSubmit = async () => {
        if (submitted || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/submit-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId,
                    response,
                }),
            });

            if (res.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Submit failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const scenarioText = getScenarioText(scenarioId);
    const isLocked = submitted || timeLeft === 0;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Player: {playerName}</h2>
                <div className={`text-2xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
            </div>

            {/* Scenario */}
            <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg mb-6">
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    Your Scenario (#{scenarioId})
                </h3>
                <p className="text-lg">{scenarioText}</p>
            </div>

            {/* Response input */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Your Response:</label>
                <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    disabled={isLocked}
                    className="w-full p-4 border rounded-lg resize-none h-32 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Type your response here..."
                />
            </div>

            {/* Submit button */}
            <button
                onClick={handleSubmit}
                disabled={isLocked || isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${isLocked
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {submitted ? '✓ Submitted' : isSubmitting ? 'Submitting...' : 'Submit Response'}
            </button>

            {submitted && (
                <p className="text-center text-green-600 mt-4">
                    Your response has been submitted. Waiting for the round to end...
                </p>
            )}

            {timeLeft === 0 && !submitted && (
                <p className="text-center text-red-600 mt-4">
                    Time's up! Your response was automatically submitted.
                </p>
            )}
        </div>
    );
}
