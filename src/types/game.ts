
export type Player = {
  id: string;
  name: string;
  balls: number[];
  score: number;
  isActive: boolean;
};

export type Ball = {
  number: number;
  pocketed: boolean;
  playerId?: string;
};

export type GameState = {
  players: Player[];
  availableBalls: number[];
  gameStarted: boolean;
  gameFinished: boolean;
  currentTurn: number;
  winner?: Player;
  history: {
    timestamp: Date;
    playerName: string;
    action: string;
    ballNumber?: number;
  }[];
};
