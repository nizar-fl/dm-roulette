export interface Player {
    id: string;
    name: string;
    scenarioId: number | null;
    response: string;
    submitted: boolean;
}

export interface GameState {
    started: boolean;
    roundEndsAt: number | null;
}

export interface PlayersMap {
    [key: string]: Player;
}
