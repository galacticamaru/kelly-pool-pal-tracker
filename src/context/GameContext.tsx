import React, { createContext, useContext, useState, ReactNode } from "react";
import { GameState, Player, Ball } from "../types/game";
import { toast } from "sonner";

interface GameContextType {
  game: GameState;
  createPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  startGame: () => void;
  assignBalls: () => void;
  pocketBall: (ballNumber: number) => void;
  resetGame: () => void;
  availableBallsCount: () => number;
}

const initialGameState: GameState = {
  players: [],
  availableBalls: Array.from({ length: 15 }, (_, i) => i + 1),
  gameStarted: false,
  gameFinished: false,
  currentTurn: 0,
  history: [],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [game, setGame] = useState<GameState>(initialGameState);

  const createPlayer = (name: string) => {
    if (game.gameStarted) {
      toast.error("Cannot add players once game has started");
      return;
    }
    
    if (game.players.length >= 15) {
      toast.error("Maximum 15 players allowed");
      return;
    }
    
    if (name.trim() === "") {
      toast.error("Player name cannot be empty");
      return;
    }
    
    // Check for duplicate names
    if (game.players.some(player => player.name === name.trim())) {
      toast.error("Player name already exists");
      return;
    }

    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      balls: [],
      score: 0,
      isActive: true,
    };

    setGame(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
      history: [...prev.history, {
        timestamp: new Date(),
        playerName: newPlayer.name,
        action: "joined the game"
      }]
    }));

    toast.success(`${name} added to the game`);
  };

  const removePlayer = (id: string) => {
    if (game.gameStarted) {
      toast.error("Cannot remove players once game has started");
      return;
    }

    const player = game.players.find(p => p.id === id);
    if (!player) return;

    setGame(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id),
      history: [...prev.history, {
        timestamp: new Date(),
        playerName: player.name,
        action: "left the game"
      }]
    }));

    toast.info(`${player.name} removed from the game`);
  };

  const startGame = () => {
    if (game.players.length < 2) {
      toast.error("Need at least 2 players to start");
      return;
    }

    if (game.gameStarted) {
      toast.error("Game already started");
      return;
    }

    assignBalls();

    setGame(prev => ({
      ...prev,
      gameStarted: true,
      history: [...prev.history, {
        timestamp: new Date(),
        playerName: "Game",
        action: "started"
      }]
    }));

    toast.success("Game started!");
  };

  const assignBalls = () => {
    // Shuffle the available balls
    const shuffledBalls = [...game.availableBalls]
      .sort(() => Math.random() - 0.5);

    const playerCount = game.players.length;
    const ballsPerPlayer = Math.floor(15 / playerCount);
    const extraBalls = 15 % playerCount;

    const updatedPlayers = [...game.players].map((player, index) => {
      // Calculate how many balls this player should get
      const ballCount = index < extraBalls 
        ? ballsPerPlayer + 1 
        : ballsPerPlayer;
      
      // Assign balls to this player
      const assignedBalls = shuffledBalls.splice(0, ballCount);
      
      return {
        ...player,
        balls: assignedBalls,
      };
    });

    setGame(prev => ({
      ...prev,
      players: updatedPlayers,
      availableBalls: [],
      history: [...prev.history, {
        timestamp: new Date(),
        playerName: "System",
        action: "assigned balls to players"
      }]
    }));

    // Notify each player of their assigned balls
    updatedPlayers.forEach(player => {
      toast.info(`${player.name} got balls: ${player.balls.join(', ')}`);
    });
  };

  const pocketBall = (ballNumber: number) => {
    if (!game.gameStarted || game.gameFinished) {
      toast.error("Game not in progress");
      return;
    }

    // Find the player who owns this ball
    const playerWithBall = game.players.find(player => 
      player.balls.includes(ballNumber) && player.isActive
    );

    if (!playerWithBall) {
      // Check if it's the 8-ball (which ends the game if it's the last ball)
      if (ballNumber === 8) {
        // If any player has only the 8-ball left, they win
        const playerWith8Ball = game.players.find(p => 
          p.balls.includes(8) && p.balls.length === 1 && p.isActive
        );

        if (playerWith8Ball) {
          // This player wins by pocketing their last ball (the 8-ball)
          const updatedPlayers = game.players.map(p => {
            if (p.id === playerWith8Ball.id) {
              return { ...p, score: p.score + 1, balls: [] };
            }
            return p;
          });

          setGame(prev => ({
            ...prev,
            players: updatedPlayers,
            gameFinished: true,
            winner: playerWith8Ball,
            history: [...prev.history, {
              timestamp: new Date(),
              playerName: playerWith8Ball.name,
              action: "won by pocketing the 8-ball",
              ballNumber: 8
            }]
          }));

          toast.success(`${playerWith8Ball.name} wins the game!`);
          return;
        } else {
          // Someone pocketed the 8-ball early - they lose
          const currentPlayer = game.players[game.currentTurn];
          const updatedPlayers = game.players.map(p => {
            if (p.id === currentPlayer.id) {
              return { ...p, isActive: false };
            }
            return p;
          });

          setGame(prev => ({
            ...prev,
            players: updatedPlayers,
            history: [...prev.history, {
              timestamp: new Date(),
              playerName: currentPlayer.name,
              action: "scratched by pocketing the 8-ball early",
              ballNumber: 8
            }]
          }));

          toast.error(`${currentPlayer.name} scratched by pocketing the 8-ball early!`);
          
          // Check if game is over (only one player left)
          const activePlayers = updatedPlayers.filter(p => p.isActive);
          if (activePlayers.length === 1) {
            setGame(prev => ({
              ...prev,
              gameFinished: true,
              winner: activePlayers[0],
              history: [...prev.history, {
                timestamp: new Date(),
                playerName: activePlayers[0].name,
                action: "won the game",
              }]
            }));
            
            toast.success(`${activePlayers[0].name} wins the game!`);
          }
          
          nextTurn();
          return;
        }
      }

      // If we get here, someone pocketed a ball that doesn't belong to them
      const currentPlayer = game.players[game.currentTurn];
      toast.error(`${currentPlayer.name} pocketed someone else's ball, next player's turn`);
      nextTurn();
      return;
    }

    // Update the player's balls and score
    const updatedPlayers = game.players.map(player => {
      if (player.id === playerWithBall.id) {
        const updatedBalls = player.balls.filter(b => b !== ballNumber);
        return { 
          ...player, 
          balls: updatedBalls,
          // Player finishes if they have no balls left
          isActive: updatedBalls.length > 0 
        };
      }
      return player;
    });

    setGame(prev => ({
      ...prev,
      players: updatedPlayers,
      history: [...prev.history, {
        timestamp: new Date(),
        playerName: playerWithBall.name,
        action: "pocketed ball",
        ballNumber
      }]
    }));

    toast.success(`${playerWithBall.name} pocketed ball ${ballNumber}`);

    // Check if player has no balls left (finished)
    const updatedPlayer = updatedPlayers.find(p => p.id === playerWithBall.id)!;
    if (updatedPlayer.balls.length === 0) {
      // Calculate their position (1st, 2nd, etc.)
      const finishedPlayers = updatedPlayers.filter(p => !p.isActive).length;
      const position = finishedPlayers;
      const positionText = getPositionText(position);
      
      toast.success(`${playerWithBall.name} finished in ${positionText} place!`);
      
      // Update player score based on position
      const updatedPlayersWithScore = updatedPlayers.map(p => {
        if (p.id === playerWithBall.id) {
          return { 
            ...p, 
            score: updatedPlayers.length - position + 1 
          };
        }
        return p;
      });
      
      setGame(prev => ({
        ...prev,
        players: updatedPlayersWithScore,
        history: [...prev.history, {
          timestamp: new Date(),
          playerName: playerWithBall.name,
          action: `finished in ${positionText} place`
        }]
      }));

      // Check if game is over (only one player left or everyone finished)
      const activePlayers = updatedPlayers.filter(p => p.isActive);
      if (activePlayers.length <= 1) {
        const winner = activePlayers[0] || updatedPlayer;
        setGame(prev => ({
          ...prev,
          gameFinished: true,
          winner,
          history: [...prev.history, {
            timestamp: new Date(),
            playerName: winner.name,
            action: "won the game"
          }]
        }));
        
        toast.success(`${winner.name} wins the game!`);
      }
    }

    // Move to next player's turn
    nextTurn();
  };

  const resetGame = () => {
    // Keep the same players but reset their scores and balls
    const resetPlayers = game.players.map(player => ({
      ...player,
      balls: [],
      score: 0,
      isActive: true,
    }));

    setGame({
      players: resetPlayers,
      availableBalls: Array.from({ length: 15 }, (_, i) => i + 1),
      gameStarted: false,
      gameFinished: false,
      currentTurn: 0,
      history: [{
        timestamp: new Date(),
        playerName: "Game",
        action: "reset"
      }],
    });

    toast.info("Game reset");
  };

  const nextTurn = () => {
    setGame(prev => {
      // Find the next active player
      let nextTurn = prev.currentTurn;
      const activePlayers = prev.players.filter(p => p.isActive);
      
      if (activePlayers.length < 1) return prev;

      do {
        nextTurn = (nextTurn + 1) % prev.players.length;
      } while (!prev.players[nextTurn].isActive);

      return {
        ...prev,
        currentTurn: nextTurn,
      };
    });
  };

  const getPositionText = (position: number): string => {
    if (position === 1) return '1st';
    if (position === 2) return '2nd';
    if (position === 3) return '3rd';
    return `${position}th`;
  };

  const availableBallsCount = () => {
    return game.availableBalls.length;
  };

  return (
    <GameContext.Provider
      value={{
        game,
        createPlayer,
        removePlayer,
        startGame,
        assignBalls,
        pocketBall,
        resetGame,
        availableBallsCount,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
