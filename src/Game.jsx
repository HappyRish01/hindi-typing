import { useMemo, useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameStateNew';
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
  DifficultyUpNotification,
  GameOverScreen,
  RoundSelectScreen,
  RoundCompleteScreen,
  GameCompleteScreen,
  PauseScreen,
} from './components/GameComponentsNew';

function Game() {
  const {
    gameState,
    isPaused,
    currentRound,
    difficulty,
    difficultyProgress,
    wordsPerDifficulty,
    difficultySettings,
    allDifficultySettings,
    roundConfig,
    score,
    lives,
    maxLives,
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
    showDifficultyUp,
    playWordCompleteSound,
    playLifeLostSound,
    playRoundCompleteSound,
    selectRoundAndStart,
    goToRoundSelect,
    changeDifficulty,
    continueToNextRound,
    retryRound,
    restartFromCurrentDifficulty,
    togglePause,
    resumeGame,
    removeExplosion,
    hideLevelUp,
    hideDifficultyUp,
  } = useGameState();

  // Audio refs for sound effects
  const wordCompleteSoundRef = useRef(null);
  const lifeLostSoundRef = useRef(null);
  const roundCompleteSoundRef = useRef(null);

  // Play word complete sound when triggered
  useEffect(() => {
    if (playWordCompleteSound > 0 && wordCompleteSoundRef.current) {
      wordCompleteSoundRef.current.currentTime = 0;
      wordCompleteSoundRef.current.play().catch(() => {});
    }
  }, [playWordCompleteSound]);

  // Play life lost sound when triggered
  useEffect(() => {
    if (playLifeLostSound > 0 && lifeLostSoundRef.current) {
      lifeLostSoundRef.current.currentTime = 0;
      lifeLostSoundRef.current.play().catch(() => {});
    }
  }, [playLifeLostSound]);

  // Play round complete sound when triggered
  useEffect(() => {
    if (playRoundCompleteSound > 0 && roundCompleteSoundRef.current) {
      roundCompleteSoundRef.current.currentTime = 0;
      roundCompleteSoundRef.current.play().catch(() => {});
    }
  }, [playRoundCompleteSound]);

  // Calculate typed characters for active target
  const typedCharsForActiveTarget = useMemo(() => {
    if (!activeTargetId || !currentInput) return 0;
    return splitIntoGraphemes(currentInput).length;
  }, [activeTargetId, currentInput]);

  return (
    <div className="relative w-screen h-screen bg-[#0a0a12] overflow-hidden">
      {/* Colorful animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-400/30 via-sky-500/20 to-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/20 via-orange-500/15 to-rose-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-to-tl from-emerald-400/20 via-teal-500/15 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '1s' }} />
      </div>

      {/* Audio elements for sound effects */}
      <audio ref={wordCompleteSoundRef} src="/sounds/word-complete.mp3" preload="auto" />
      <audio ref={lifeLostSoundRef} src="/sounds/life-lost.mp3" preload="auto" />
      <audio ref={roundCompleteSoundRef} src="/sounds/round-complete.mp3" preload="auto" />

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

      {/* Round selection screen */}
      {gameState === 'round-select' && (
        <RoundSelectScreen 
          onSelectRound={(round) => selectRoundAndStart(round, 'beginner')}
        />
      )}

      {/* Game playing state */}
      {gameState === 'playing' && (
        <>
          {/* HUD */}
          <HUD
            score={score}
            currentRound={currentRound}
            difficulty={difficulty}
            difficultyProgress={difficultyProgress}
            wordsPerDifficulty={wordsPerDifficulty}
            difficultySettings={difficultySettings}
            lives={lives}
            maxLives={maxLives}
            wpm={wpm}
            accuracy={accuracy}
            onPause={togglePause}
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
            <LevelUpNotification level={currentRound} onComplete={hideLevelUp} />
          )}

          {/* Difficulty upgrade notification */}
          {showDifficultyUp && (
            <DifficultyUpNotification 
              difficulty={difficulty} 
              difficultySettings={difficultySettings}
              onComplete={hideDifficultyUp} 
            />
          )}

          {/* Pause screen overlay */}
          {isPaused && (
            <PauseScreen
              currentRound={currentRound}
              difficulty={difficulty}
              difficultyProgress={difficultyProgress}
              wordsPerDifficulty={wordsPerDifficulty}
              difficultySettings={difficultySettings}
              allDifficultySettings={allDifficultySettings}
              score={score}
              lives={lives}
              maxLives={maxLives}
              onResume={resumeGame}
              onRestart={restartFromCurrentDifficulty}
              onChangeDifficulty={changeDifficulty}
              onHome={goToRoundSelect}
            />
          )}
        </>
      )}

      {/* Round complete screen */}
      {gameState === 'round-complete' && (
        <RoundCompleteScreen
          currentRound={currentRound}
          score={score}
          wpm={wpm}
          accuracy={accuracy}
          wordsDestroyed={wordsDestroyed}
          onContinue={continueToNextRound}
          onRetry={retryRound}
          onHome={goToRoundSelect}
        />
      )}

      {/* Game over screen */}
      {gameState === 'gameover' && (
        <GameOverScreen
          score={score}
          currentRound={currentRound}
          difficulty={difficulty}
          difficultyProgress={difficultyProgress}
          wordsPerDifficulty={wordsPerDifficulty}
          difficultySettings={difficultySettings}
          wpm={wpm}
          accuracy={accuracy}
          wordsDestroyed={wordsDestroyed}
          onRestart={retryRound}
          onHome={goToRoundSelect}
        />
      )}

      {/* All rounds complete screen */}
      {gameState === 'game-complete' && (
        <GameCompleteScreen
          score={score}
          onHome={goToRoundSelect}
        />
      )}

      {/* Audio elements for sound effects */}
      <audio ref={wordCompleteSoundRef} src="/sounds/word-complete.mp3" preload="auto" />
      <audio ref={lifeLostSoundRef} src="/sounds/life-lost.mp3" preload="auto" />
      <audio ref={roundCompleteSoundRef} src="/sounds/word-complete.mp3" preload="auto" />
    </div>
  );
}

export default Game;
