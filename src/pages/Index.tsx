
import { useGame, GameProvider } from '@/context/GameContext';
import GameSetup from '@/components/GameSetup';
import GameBoard from '@/components/GameBoard';
import { Separator } from '@/components/ui/separator';

const GameView = () => {
  const { game } = useGame();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-billiards-green">Kelly Pool Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Randomly select, track and score your Kelly Pool games
        </p>
        <Separator className="mt-4 bg-billiards-gold/20" />
      </div>
      
      {!game.gameStarted ? (
        <GameSetup />
      ) : (
        <GameBoard />
      )}
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Kelly Pool Tracker | Lovable App</p>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <GameProvider>
      <GameView />
    </GameProvider>
  );
};

export default Index;
