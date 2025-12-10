// Scenario placeholders - replace these texts with your actual scenarios
export const SCENARIOS: Record<number, string> = {
    1: "Scenario 1 text placeholder",
    2: "Scenario 2 text placeholder",
    3: "Scenario 3 text placeholder",
    4: "Scenario 4 text placeholder",
    5: "Scenario 5 text placeholder",
    6: "Scenario 6 text placeholder",
};

export const getScenarioText = (scenarioId: number): string => {
    return SCENARIOS[scenarioId] || "Unknown scenario";
};

export const ROUND_DURATION_SECONDS = 40;
