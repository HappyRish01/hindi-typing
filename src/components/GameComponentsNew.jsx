import { memo } from 'react';
import { Link } from 'react-router-dom';

// Pre-generate stars once (static, no animation for performance)
const STATIC_STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 2 + 1,
  opacity: 0.3 + Math.random() * 0.7,
}));

// Stars background component - simplified for performance
export const StarField = memo(function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STATIC_STARS.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
});

// Player spaceship component
export const PlayerShip = memo(function PlayerShip() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 player-ship">
      <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
        {/* Main body */}
        <path
          d="M30 0 L50 50 L30 40 L10 50 Z"
          fill="url(#shipGradient)"
          stroke="#00ffff"
          strokeWidth="2"
        />
        {/* Wings */}
        <path
          d="M10 50 L0 65 L15 55 Z"
          fill="#0066cc"
          stroke="#00ffff"
          strokeWidth="1"
        />
        <path
          d="M50 50 L60 65 L45 55 Z"
          fill="#0066cc"
          stroke="#00ffff"
          strokeWidth="1"
        />
        {/* Engine glow */}
        <ellipse cx="30" cy="55" rx="8" ry="4" fill="#ff6600" opacity="0.8" />
        <ellipse cx="30" cy="58" rx="5" ry="8" fill="#ffff00" opacity="0.6" />
        {/* Cockpit */}
        <ellipse cx="30" cy="20" rx="6" ry="8" fill="#00ffff" opacity="0.7" />
        <defs>
          <linearGradient id="shipGradient" x1="30" y1="0" x2="30" y2="50">
            <stop offset="0%" stopColor="#003366" />
            <stop offset="100%" stopColor="#001133" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
});

// Projectile component
export const Projectile = memo(function Projectile({ x, y }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-2 h-8 bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 8px #00ffff' }} />
    </div>
  );
});

// Explosion effect component
export const Explosion = memo(function Explosion({ x, y, onComplete }) {
  return (
    <div
      className="absolute pointer-events-none explosion-animation"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
      onAnimationEnd={onComplete}
    >
      <div className="relative">
        <div className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400 animate-[explode-core_0.4s_ease-out]" />
        <div className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300 animate-[explode-core_0.3s_ease-out]" />
      </div>
    </div>
  );
});

// HUD component with round info
export const HUD = memo(function HUD({ score, currentRound, roundProgress, roundConfig, lives, maxLives = 5, wpm, accuracy, onPause }) {
  const progressPercent = roundConfig ? (roundProgress / roundConfig.wordsToComplete) * 100 : 0;
  
  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-20">
      {/* Top bar */}
      <div className="flex justify-between items-center">
        {/* Left side - Score and Round */}
        <div className="flex gap-6 items-center">
          {/* Pause button */}
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/70 hover:bg-gray-700/80 border border-gray-600/50 hover:border-cyan-500/50 rounded-lg text-gray-400 hover:text-white transition-all duration-200 group"
            title="Pause (ESC)"
          >
            <span className="flex gap-0.5">
              <span className="w-1 h-4 bg-current rounded-sm"></span>
              <span className="w-1 h-4 bg-current rounded-sm"></span>
            </span>
            <span className="text-xs opacity-70 group-hover:opacity-100">ESC</span>
          </button>
          
          <div className="text-cyan-400 neon-text">
            <span className="text-sm opacity-70">SCORE</span>
            <div className="text-2xl font-bold">{score.toLocaleString()}</div>
          </div>
          <div className="text-purple-400 neon-text">
            <span className="text-sm opacity-70">ROUND</span>
            <div className="text-2xl font-bold">{currentRound}/4</div>
          </div>
        </div>

        {/* Center - Lives */}
        <div className="flex gap-2">
          {Array.from({ length: maxLives }).map((_, i) => (
            <div
              key={i}
              className={`text-2xl transition-all duration-300 ${
                i < lives ? 'text-red-500 neon-text scale-100' : 'text-gray-700 scale-75'
              }`}
            >
              ❤️
            </div>
          ))}
        </div>

        {/* Right side - Stats */}
        <div className="flex gap-6 text-right">
          <div className="text-green-400 neon-text">
            <span className="text-sm opacity-70">WPM</span>
            <div className="text-2xl font-bold">{wpm}</div>
          </div>
          <div className="text-yellow-400 neon-text">
            <span className="text-sm opacity-70">ACCURACY</span>
            <div className="text-2xl font-bold">{accuracy}%</div>
          </div>
        </div>
      </div>

      {/* Round progress bar */}
      {roundConfig && (
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>{roundConfig.title}</span>
            <span>{roundProgress}/{roundConfig.wordsToComplete} words</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${roundConfig.color} transition-all duration-300`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

// Typing indicator
export const TypingIndicator = memo(function TypingIndicator({ currentInput }) {
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-gray-900/95 border-2 border-cyan-500/80 rounded-xl px-8 py-4 shadow-lg shadow-cyan-500/20">
        <div className="text-center">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Typing (Hindi Mangal)</span>
          <div className="text-2xl font-bold tracking-wider text-cyan-400 min-w-[120px]">
            {currentInput || <span className="opacity-30 text-gray-500">टाइप करें...</span>}
            <span className="cursor-blink text-white">|</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Press Win+Space to switch to Hindi keyboard
          </div>
        </div>
      </div>
    </div>
  );
});

// Level up notification
export const LevelUpNotification = memo(function LevelUpNotification({ level, onComplete }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none level-up-flash"
      onAnimationEnd={onComplete}
    >
      <div className="text-center">
        <div className="text-6xl font-black text-yellow-400 neon-text">
          LEVEL UP!
        </div>
        <div className="text-4xl font-bold text-cyan-400 neon-text mt-2">
          Level {level}
        </div>
      </div>
    </div>
  );
});

// Round selection screen
export const RoundSelect = memo(function RoundSelect({ onSelectRound, totalRounds }) {
  const roundInfo = [
    {
      round: 1,
      title: 'आ की मात्रा',
      subtitle: 'Normal + आ matra',
      description: 'बुनियादी शब्द और आ की मात्रा',
      color: 'from-green-500 to-emerald-600',
      emoji: '🌱',
    },
    {
      round: 2,
      title: 'सभी मात्राएं',
      subtitle: 'इ, ई, उ, ऊ, ए, ऐ, ओ, औ',
      description: 'सभी स्वर मात्राओं वाले शब्द',
      color: 'from-blue-500 to-cyan-600',
      emoji: '⚡',
    },
    {
      round: 3,
      title: 'तीन अक्षर',
      subtitle: 'Three-letter + All matras',
      description: 'तीन अक्षर वाले जटिल शब्द',
      color: 'from-purple-500 to-pink-600',
      emoji: '🎯',
    },
    {
      round: 4,
      title: 'PRO Level',
      subtitle: 'Complex & Hardest',
      description: 'अखबार और मीडिया के कठिन शब्द',
      color: 'from-red-500 to-orange-600',
      emoji: '🔥',
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/90">
      {/* Back to Home Button */}
      <Link 
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-gray-800/80 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-cyan-500 transition-all"
      >
        <span>←</span>
        <span>Home</span>
      </Link>

      <div className="text-center p-8 max-w-2xl">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-2">
          SELECT ROUND
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Choose your practice round
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roundInfo.map((info) => (
            <button
              key={info.round}
              onClick={() => onSelectRound(info.round)}
              className={`p-6 bg-gradient-to-r ${info.color} text-white font-bold rounded-xl
                         hover:scale-105 transition-all duration-300 text-left
                         border-2 border-white/20 hover:border-white/50`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl">{info.emoji}</span>
                <span className="text-sm bg-white/20 px-2 py-1 rounded">Round {info.round}</span>
              </div>
              <div className="text-2xl font-bold mb-1">{info.title}</div>
              <div className="text-sm opacity-80 mb-2">{info.subtitle}</div>
              <div className="text-xs opacity-70">{info.description}</div>
            </button>
          ))}
        </div>

        <p className="text-gray-500 text-sm mt-8">
          Complete each round to unlock mastery! 🎮
        </p>
      </div>
    </div>
  );
});

// Difficulty selection screen - Main game start screen
export const DifficultySelect = memo(function DifficultySelect({ currentRound, roundConfig, onSelectDifficulty, onBack }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-gradient-to-b from-gray-900 via-purple-950/50 to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Home Button */}
      <Link 
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-5 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-gray-300 hover:text-white hover:border-cyan-400 hover:bg-gray-700/60 transition-all duration-300 group"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
        <span className="font-medium">Home</span>
      </Link>

      <div className="text-center p-8 max-w-2xl relative z-10">
        {/* Game Title with glow effect */}
        <div className="mb-8">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-1 tracking-tight drop-shadow-lg">
            HINDI WORD
          </h1>
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-red-500 tracking-tight" 
              style={{ textShadow: '0 0 40px rgba(251, 146, 60, 0.5)' }}>
            ATTACK
          </h1>
        </div>
        
        {/* Select difficulty label */}
        <p className="text-gray-400 text-lg uppercase tracking-widest mb-6 font-medium">
          ── Select Difficulty ──
        </p>

        {/* Difficulty buttons */}
        <div className="flex flex-col gap-4 max-w-xl mx-auto">
          {/* Beginner */}
          <button
            onClick={() => onSelectDifficulty('beginner')}
            className="group relative px-8 py-5 bg-gradient-to-r from-emerald-600/90 to-green-500/90 text-white font-bold rounded-2xl
                       hover:from-emerald-500 hover:to-green-400 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
                       border border-green-400/30 shadow-xl hover:shadow-green-500/25 backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <span className="text-4xl drop-shadow-lg">🌱</span>
                <div className="text-left">
                  <div className="text-xl font-bold tracking-wide">BEGINNER</div>
                  <div className="text-sm opacity-75 font-normal">Slow Speed • Perfect for learning</div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-black/20 px-4 py-2 rounded-xl">
                <span className="text-lg">❤️</span>
                <span className="text-lg font-bold">7</span>
              </div>
            </div>
          </button>

          {/* Normal */}
          <button
            onClick={() => onSelectDifficulty('normal')}
            className="group relative px-8 py-5 bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white font-bold rounded-2xl
                       hover:from-amber-400 hover:to-orange-400 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
                       border border-yellow-400/30 shadow-xl hover:shadow-orange-500/25 backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <span className="text-4xl drop-shadow-lg">⚡</span>
                <div className="text-left">
                  <div className="text-xl font-bold tracking-wide">NORMAL</div>
                  <div className="text-sm opacity-75 font-normal">Medium Speed • Balanced challenge</div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-black/20 px-4 py-2 rounded-xl">
                <span className="text-lg">❤️</span>
                <span className="text-lg font-bold">5</span>
              </div>
            </div>
          </button>

          {/* Hard */}
          <button
            onClick={() => onSelectDifficulty('hard')}
            className="group relative px-8 py-5 bg-gradient-to-r from-red-600/90 to-rose-500/90 text-white font-bold rounded-2xl
                       hover:from-red-500 hover:to-rose-400 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
                       border border-red-400/30 shadow-xl hover:shadow-red-500/25 backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <span className="text-4xl drop-shadow-lg">🔥</span>
                <div className="text-left">
                  <div className="text-xl font-bold tracking-wide">HARD</div>
                  <div className="text-sm opacity-75 font-normal">Fast Speed • For experts only</div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-black/20 px-4 py-2 rounded-xl">
                <span className="text-lg">❤️</span>
                <span className="text-lg font-bold">5</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-10 space-y-2">
          <p className="text-cyan-400/80 text-base flex items-center justify-center gap-2">
            <span>🎯</span>
            <span>Complete <span className="font-bold text-cyan-300">{roundConfig?.wordsToComplete || 15}</span> words to finish this round</span>
          </p>
          <p className="text-gray-500 text-sm">
            Use Hindi Mangal keyboard • Press <kbd className="px-2 py-0.5 bg-gray-700/50 rounded text-gray-400 text-xs">Win</kbd> + <kbd className="px-2 py-0.5 bg-gray-700/50 rounded text-gray-400 text-xs">Space</kbd> to switch
          </p>
        </div>
      </div>
    </div>
  );
});

// Round complete screen
export const RoundCompleteScreen = memo(function RoundCompleteScreen({ 
  currentRound, 
  totalRounds, 
  score, 
  wpm, 
  accuracy, 
  wordsDestroyed,
  onContinue, 
  onRetry,
  onHome 
}) {
  const isLastRound = currentRound >= totalRounds;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/80 backdrop-blur-sm">
      <div className="text-center p-8 bg-gray-900/90 border-2 border-green-500 rounded-2xl neon-border max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-4xl font-black text-green-400 neon-text mb-2">
          ROUND {currentRound} COMPLETE!
        </h1>
        
        <div className="space-y-3 my-6 text-lg">
          <div className="flex justify-between">
            <span className="text-gray-400">Score:</span>
            <span className="text-cyan-400 font-bold">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Words:</span>
            <span className="text-green-400 font-bold">{wordsDestroyed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">WPM:</span>
            <span className="text-yellow-400 font-bold">{wpm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Accuracy:</span>
            <span className="text-orange-400 font-bold">{accuracy}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {!isLastRound ? (
            <button
              onClick={onContinue}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-cyan-600 text-white font-bold text-xl rounded-lg
                         hover:from-green-500 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105
                         border-2 border-green-400 neon-border"
            >
              NEXT ROUND →
            </button>
          ) : (
            <button
              onClick={onHome}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl rounded-lg
                         hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 transform hover:scale-105
                         border-2 border-yellow-400 neon-border"
            >
              🏆 ALL ROUNDS COMPLETE!
            </button>
          )}
          
          <button
            onClick={onRetry}
            className="px-8 py-3 bg-gray-800 text-gray-300 font-bold text-lg rounded-lg
                       hover:bg-gray-700 hover:text-white transition-all duration-300
                       border border-gray-600 hover:border-gray-500"
          >
            Retry Round
          </button>
          
          <button
            onClick={onHome}
            className="px-8 py-2 text-gray-500 hover:text-gray-300 transition-all"
          >
            Back to Rounds
          </button>
        </div>
      </div>
    </div>
  );
});

// Game over screen
export const GameOverScreen = memo(function GameOverScreen({ 
  score, 
  currentRound, 
  wpm, 
  accuracy, 
  wordsDestroyed, 
  roundProgress,
  roundConfig,
  onRestart, 
  onHome 
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/80 backdrop-blur-sm">
      <div className="text-center p-8 bg-gray-900/90 border-2 border-red-500 rounded-2xl neon-border max-w-md">
        <h1 className="text-5xl font-black text-red-500 neon-text mb-6">
          GAME OVER
        </h1>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-xl">
            <span className="text-gray-400">Round:</span>
            <span className="text-purple-400 font-bold">{currentRound}/4</span>
          </div>
          <div className="flex justify-between text-xl">
            <span className="text-gray-400">Progress:</span>
            <span className="text-cyan-400 font-bold">{roundProgress}/{roundConfig?.wordsToComplete || 0}</span>
          </div>
          <div className="flex justify-between text-xl">
            <span className="text-gray-400">Final Score:</span>
            <span className="text-cyan-400 font-bold">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xl">
            <span className="text-gray-400">Words Destroyed:</span>
            <span className="text-green-400 font-bold">{wordsDestroyed}</span>
          </div>
          <div className="flex justify-between text-xl">
            <span className="text-gray-400">Final WPM:</span>
            <span className="text-yellow-400 font-bold">{wpm}</span>
          </div>
          <div className="flex justify-between text-xl">
            <span className="text-gray-400">Accuracy:</span>
            <span className="text-orange-400 font-bold">{accuracy}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold text-xl rounded-lg
                       hover:from-cyan-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105
                       border-2 border-cyan-400 neon-border"
          >
            TRY AGAIN
          </button>
          
          <button
            onClick={onHome}
            className="px-8 py-3 bg-gray-800 text-gray-300 font-bold text-lg rounded-lg
                       hover:bg-gray-700 hover:text-white transition-all duration-300
                       border border-gray-600 hover:border-gray-500"
          >
            Choose Different Round
          </button>
        </div>
      </div>
    </div>
  );
});

// Game complete screen (all rounds finished)
export const GameCompleteScreen = memo(function GameCompleteScreen({ score, onHome }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/80 backdrop-blur-sm">
      <div className="text-center p-8 bg-gray-900/90 border-2 border-yellow-500 rounded-2xl neon-border max-w-md">
        <div className="text-8xl mb-4">🏆</div>
        <h1 className="text-4xl font-black text-yellow-400 neon-text mb-4">
          CONGRATULATIONS!
        </h1>
        <p className="text-2xl text-cyan-400 mb-6">
          You completed all 4 rounds!
        </p>
        
        <div className="text-xl text-gray-300 mb-8">
          Final Score: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
        </div>

        <button
          onClick={onHome}
          className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl rounded-lg
                     hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 transform hover:scale-105
                     border-2 border-yellow-400 neon-border"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
});

// Pause screen overlay
export const PauseScreen = memo(function PauseScreen({ 
  currentRound, 
  score, 
  lives, 
  maxLives,
  roundProgress,
  roundConfig,
  onResume, 
  onRestart, 
  onHome 
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/85 backdrop-blur-md">
      {/* Animated pause icon */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
        <div className="flex gap-4">
          <div className="w-8 h-24 bg-white rounded-lg"></div>
          <div className="w-8 h-24 bg-white rounded-lg"></div>
        </div>
      </div>

      <div className="text-center p-8 bg-gray-900/95 border-2 border-cyan-500/50 rounded-3xl max-w-md shadow-2xl">
        {/* Pause title */}
        <div className="mb-6">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
            PAUSED
          </h1>
          <p className="text-gray-400 text-sm">Press ESC to resume</p>
        </div>

        {/* Current game stats */}
        <div className="bg-gray-800/60 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-400">Round</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 4</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-400">Progress</span>
            <span className="text-green-400 font-bold">{roundProgress} / {roundConfig?.wordsToComplete || 15}</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-400">Score</span>
            <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-400">Lives</span>
            <span className="text-red-400 font-bold">{'❤️'.repeat(lives)} {'🖤'.repeat(maxLives - lives)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-xl rounded-xl
                       hover:from-green-500 hover:to-emerald-400 transition-all duration-300 transform hover:scale-[1.02]
                       border border-green-400/50 shadow-lg shadow-green-500/20"
          >
            <span className="flex items-center justify-center gap-3">
              <span className="text-2xl">▶</span>
              RESUME
            </span>
          </button>
          
          <button
            onClick={onRestart}
            className="w-full px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold text-lg rounded-xl
                       hover:from-amber-500 hover:to-orange-400 transition-all duration-300
                       border border-orange-400/50"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🔄</span>
              Restart Round
            </span>
          </button>
          
          <button
            onClick={onHome}
            className="w-full px-8 py-3 bg-gray-700/80 text-gray-300 font-bold text-lg rounded-xl
                       hover:bg-gray-600 hover:text-white transition-all duration-300
                       border border-gray-500/50"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🏠</span>
              Main Menu
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

// Start screen (legacy, redirects to round select)
export const StartScreen = memo(function StartScreen({ onStart }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/90">
      <Link 
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-gray-800/80 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-cyan-500 transition-all"
      >
        <span>←</span>
        <span>Home</span>
      </Link>

      <div className="text-center p-8">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4">
          HINDI WORD
        </h1>
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-red-500 mb-8 neon-text">
          ATTACK
        </h1>
        
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          Type Hindi words to destroy incoming enemies!
          <br />
          <span className="text-cyan-400">Practice your Mangal typing speed.</span>
        </p>

        <button
          onClick={onStart}
          className="px-12 py-5 bg-gradient-to-r from-green-600 to-cyan-600 text-white font-bold text-2xl rounded-lg
                     hover:from-green-500 hover:to-cyan-500 transition-all duration-300 transform hover:scale-110
                     border-2 border-green-400 neon-border animate-pulse"
        >
          START GAME
        </button>
      </div>
    </div>
  );
});
