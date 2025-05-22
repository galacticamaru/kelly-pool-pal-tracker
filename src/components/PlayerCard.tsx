
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Player } from '@/types/game';
import BallDisplay from './BallDisplay';

type PlayerCardProps = {
  player: Player;
  isCurrentTurn: boolean;
  gameStarted: boolean;
  onRemove?: (id: string) => void;
  onBallClick?: (ballNumber: number) => void;
};

const PlayerCard = ({ 
  player, 
  isCurrentTurn, 
  gameStarted,
  onRemove,
  onBallClick
}: PlayerCardProps) => {
  return (
    <Card className={cn(
      'transition-all duration-300',
      isCurrentTurn ? 'border-billiards-gold border-2' : '',
      !player.isActive ? 'opacity-60' : ''
    )}>
      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">
            {player.name}
          </CardTitle>
          {!player.isActive && <span className="text-xs text-muted-foreground">(Finished)</span>}
        </div>
        {!gameStarted && onRemove && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={() => onRemove(player.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-2 min-h-16 justify-center">
          {player.balls.length > 0 ? (
            player.balls.map(ball => (
              <BallDisplay 
                key={ball} 
                number={ball} 
                size="sm"
                onClick={gameStarted && onBallClick ? () => onBallClick(ball) : undefined}
              />
            ))
          ) : (
            gameStarted && <span className="text-muted-foreground text-sm">All balls pocketed</span>
          )}
        </div>
      </CardContent>
      {gameStarted && (
        <CardFooter className="p-3 pt-0 text-sm">
          {isCurrentTurn && player.isActive && (
            <p className="text-billiards-gold font-semibold">Current turn</p>
          )}
          {player.score > 0 && (
            <p className="ml-auto">Score: {player.score}</p>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

import { cn } from '@/lib/utils';

export default PlayerCard;
