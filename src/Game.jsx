import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGameState } from './hooks/useGameState';
import { splitIntoGraphemes } from './gameUtils';
import Enemy from './components/Enemy';
import {
  StarField,
  PlayerShip,
  Projectile,
  Explosion,
  HUD,
  TypingIndicator,
  LevelUpNotification,
  GameOverScreen,
  StartScreen,
} from './components/GameComponents';

function Game() {
  // Check for autostart parameter in URL
  const [searchParams] = useSearchParams();
  const autoStart = searchParams.get('autostart') === 'true';

  const {
    gameState,
    score,
    level,
    lives,
    wordsDestroyed,
    enemies,
    projectiles,
    explosions,
    currentInput,
    activeTargetId,
    errorFlashId,
    wpm,
    accuracy,
    showLevelUp,
    startGame,
    removeExplosion,
    hideLevelUp,
  } = useGameState(autoStart);

  // Calculate typed characters for active target
  const typedCharsForActiveTarget = useMemo(() => {
    if (!activeTargetId || !currentInput) return 0;
    return splitIntoGraphemes(currentInput).length;
  }, [activeTargetId, currentInput]);

  return (
    <div className="relative w-screen h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-black overflow-hidden">
      {/* Star background */}
      <StarField />
      
      {/* Grid overlay for depth effect */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #4a4063 1px, transparent 1px),
            linear-gradient(to bottom, #4a4063 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          perspective: '500px',
          transform: 'rotateX(60deg)',
          transformOrigin: 'center bottom',
        }}
      />

      {/* Game playing state */}
      {gameState === 'playing' && (
        <>
          {/* HUD */}
          <HUD
            score={score}
            level={level}
            lives={lives}
            wpm={wpm}
            accuracy={accuracy}
          />

          {/* Enemies */}
          {enemies.map((enemy) => (
            <Enemy
              key={enemy.id}
              enemy={enemy}
              typedChars={enemy.id === activeTargetId ? typedCharsForActiveTarget : 0}
              isActive={enemy.id === activeTargetId}
              hasError={enemy.id === errorFlashId}
            />
          ))}

          {/* Projectiles */}
          {projectiles.map((projectile) => {
            const currentX = projectile.startX + (projectile.targetX - projectile.startX) * projectile.progress;
            const currentY = projectile.startY + (projectile.targetY - projectile.startY) * projectile.progress;
            return (
              <Projectile
                key={projectile.id}
                x={currentX}
                y={currentY}
              />
            );
          })}

          {/* Explosions */}
          {explosions.map((explosion) => (
            <Explosion
              key={explosion.id}
              x={explosion.x}
              y={explosion.y}
              onComplete={() => removeExplosion(explosion.id)}
            />
          ))}

          {/* Player ship */}
          <PlayerShip />

          {/* Typing indicator */}
          <TypingIndicator currentInput={currentInput} />

          {/* Level up notification */}
          {showLevelUp && (
            <LevelUpNotification level={level} onComplete={hideLevelUp} />
          )}
        </>
      )}

      {/* Start screen */}
      {gameState === 'start' && (
        <StartScreen onStart={startGame} />
      )}

      {/* Game over screen */}
      {gameState === 'gameover' && (
        <GameOverScreen
          score={score}
          level={level}
          wpm={wpm}
          accuracy={accuracy}
          wordsDestroyed={wordsDestroyed}
          onRestart={startGame}
        />
      )}
    </div>
  );
}

export default Game;
