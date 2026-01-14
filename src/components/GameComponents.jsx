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

// Projectile component - simplified for performance
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
      {/* Simple laser beam */}
      <div className="w-2 h-8 bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 8px #00ffff' }} />
    </div>
  );
});

// Explosion effect component - simplified for performance
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
        {/* Main flash - simplified */}
        <div className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400 animate-[explode-core_0.4s_ease-out]" />
        <div className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300 animate-[explode-core_0.3s_ease-out]" />
      </div>
    </div>
  );
});

// HUD component
export const HUD = memo(function HUD({ score, level, lives, wpm, accuracy }) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
      {/* Left side - Score and Level */}
      <div className="flex gap-6">
        <div className="text-cyan-400 neon-text">
          <span className="text-sm opacity-70">SCORE</span>
          <div className="text-2xl font-bold">{score.toLocaleString()}</div>
        </div>
        <div className="text-purple-400 neon-text">
          <span className="text-sm opacity-70">LEVEL</span>
          <div className="text-2xl font-bold">{level}</div>
        </div>
      </div>

      {/* Center - Lives */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
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
  );
});

// Typing indicator - cleaner design with help text
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

// Game over screen
export const GameOverScreen = memo(function GameOverScreen({ score, level, wpm, accuracy, wordsDestroyed, onRestart }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/80 backdrop-blur-sm">
      <div className="text-center p-8 bg-gray-900/90 border-2 border-red-500 rounded-2xl neon-border max-w-md">
        <h1 className="text-5xl font-black text-red-500 neon-text mb-6">
          GAME OVER
        </h1>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-xl">
            <span className="text-gray-400">Final Score:</span>
            <span className="text-cyan-400 font-bold">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xl">
            <span className="text-gray-400">Level Reached:</span>
            <span className="text-purple-400 font-bold">{level}</span>
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
            PLAY AGAIN
          </button>
          
          <Link
            to="/"
            className="px-8 py-3 bg-gray-800 text-gray-300 font-bold text-lg rounded-lg
                       hover:bg-gray-700 hover:text-white transition-all duration-300
                       border border-gray-600 hover:border-gray-500"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
});

// Start screen
export const StartScreen = memo(function StartScreen({ onStart }) {
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

        <div className="space-y-3 text-left max-w-sm mx-auto mb-8 text-gray-300">
          <div className="flex items-center gap-3">
            <span className="text-green-400">✓</span>
            <span>Type the complete word to destroy enemies</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400">✓</span>
            <span>Green letters = Correct typing</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-red-400">✗</span>
            <span>Red flash = Wrong key, try again</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-400">⚡</span>
            <span>Level up every 10 words!</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="px-12 py-5 bg-gradient-to-r from-green-600 to-cyan-600 text-white font-bold text-2xl rounded-lg
                     hover:from-green-500 hover:to-cyan-500 transition-all duration-300 transform hover:scale-110
                     border-2 border-green-400 neon-border animate-pulse"
        >
          START GAME
        </button>

        <p className="text-gray-500 text-sm mt-6">
          Use Mangal keyboard layout for Hindi typing
        </p>
      </div>
    </div>
  );
});
