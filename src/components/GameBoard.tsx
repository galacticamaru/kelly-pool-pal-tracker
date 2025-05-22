
import React from 'react';
import { useGame } from '@/context/GameContext';
import PlayerCard from './PlayerCard';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import BallDisplay from './BallDisplay';

const GameBoard = () => {
  const { game, pocketBall, resetGame } = useGame();
  
  const handleBallClick = (ballNumber: number) => {
    pocketBall(ballNumber);
  };

  return (
    <div className="space-y-6">
      {game.gameFinished && game.winner && (
        <Card className="border-billiards-gold bg-gradient-to-r from-billiards-gold/10 to-billiards-wood/10">
          <CardHeader>
            <CardTitle className="text-center">🏆 Game Finished! 🏆</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg font-medium">{game.winner.name} wins!</p>
            <div className="mt-4">
              <Button
                className="bg-billiards-gold hover:bg-billiards-gold/80"
                onClick={resetGame}
              >
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!game.gameFinished && (
        <>
          <div className="felt-background rounded-lg p-4">
            <h2 className="text-lg font-semibold text-center mb-4 text-white">
              {game.players[game.currentTurn]?.name}'s Turn
            </h2>
            <div className="mb-2 text-sm text-center text-white/80">Click a ball to pocket it</div>
            <div className="flex flex-wrap justify-center gap-2">
              {Array(15).fill(0).map((_, i) => {
                const ballNumber = i + 1;
                // Find if this ball belongs to any player
                const ballOwner = game.players.find(
                  p => p.balls.includes(ballNumber) && p.isActive
                );
                const isBallActive = !!ballOwner;
                
                return (
                  <BallDisplay
                    key={ballNumber}
                    number={ballNumber}
                    inactive={!isBallActive}
                    onClick={isBallActive ? () => handleBallClick(ballNumber) : undefined}
                  />
                );
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {game.players.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                isCurrentTurn={game.currentTurn === index}
                gameStarted={game.gameStarted}
                onBallClick={handleBallClick}
              />
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Game History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {[...game.history].reverse().map((event, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-muted-foreground text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}:
                      </span>{' '}
                      <span className="font-medium">{event.playerName}</span>{' '}
                      {event.action}
                      {event.ballNumber !== undefined && ` ${event.ballNumber}`}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={resetGame}
              >
                Reset Game
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default GameBoard;
