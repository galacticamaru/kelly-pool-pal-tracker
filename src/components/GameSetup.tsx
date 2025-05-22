
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/context/GameContext';
import PlayerCard from './PlayerCard';
import { Plus } from 'lucide-react';

const GameSetup = () => {
  const { game, createPlayer, removePlayer, startGame } = useGame();
  const [playerName, setPlayerName] = useState('');

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      createPlayer(playerName);
      setPlayerName('');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Kelly Pool Setup</CardTitle>
          <CardDescription>Add players to start a new game</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPlayer} className="flex gap-2">
            <Input
              placeholder="Player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-1"
              maxLength={20}
            />
            <Button type="submit" disabled={game.players.length >= 15}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </form>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Players: {game.players.length}/15</h3>
            {game.players.length === 0 ? (
              <p className="text-muted-foreground text-sm">No players added yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {game.players.map(player => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isCurrentTurn={false}
                    gameStarted={game.gameStarted}
                    onRemove={removePlayer}
                  />
                ))}
              </div>
            )}
          </div>
          
          <Button 
            className="mt-6 w-full bg-billiards-gold hover:bg-billiards-gold/80"
            disabled={game.players.length < 2}
            onClick={startGame}
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSetup;
