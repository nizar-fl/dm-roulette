// Scenario placeholders - replace these texts with your actual scenarios
export const SCENARIOS: Record<number, string> = {
    1: "Are you ignoring me or practicing for when u're famous",
    2: "I know where you live , look in your closet",
    3: "hey i am a nigerian prince and i need your help give me 100$ and i will repay your kindness when i am free",
    4: "hey i kinda need some money",
    5: "hey, i know this is wierd but we have to talk",
    6: "i'm pregnant",
};

export const getScenarioText = (scenarioId: number): string => {
    return SCENARIOS[scenarioId] || "Unknown scenario";
};

export const ROUND_DURATION_SECONDS = 40;
