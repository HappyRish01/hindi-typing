import { memo } from 'react';
import { Link } from 'react-router-dom';

// Color palette for stars
const STAR_COLORS = [
  'rgba(168, 85, 247, opacity)',   // purple
  'rgba(236, 72, 153, opacity)',   // pink
  'rgba(6, 182, 212, opacity)',    // cyan
  'rgba(251, 191, 36, opacity)',   // amber
  'rgba(34, 197, 94, opacity)',    // green
  'rgba(255, 255, 255, opacity)',  // white
  'rgba(99, 102, 241, opacity)',   // indigo
];

// Pre-generate stars once (static, no animation for performance)
const STATIC_STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  opacity: 0.3 + Math.random() * 0.7,
  color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  twinkle: Math.random() > 0.6,
}));

// Stars background component - with colorful stars
export const StarField = memo(function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STATIC_STARS.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full ${star.twinkle ? 'animate-pulse' : ''}`}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color.replace('opacity', star.opacity.toString()),
            boxShadow: `0 0 ${star.size * 2}px ${star.color.replace('opacity', (star.opacity * 0.5).toString())}`,
            animationDuration: `${2 + Math.random() * 3}s`,
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

// HUD component with round and difficulty info
export const HUD = memo(function HUD({ 
  score, 
  currentRound, 
  difficulty,
  difficultyProgress,
  wordsPerDifficulty,
  difficultySettings,
  lives, 
  maxLives = 5, 
  wpm, 
  accuracy, 
  onPause 
}) {
  const progressPercent = (difficultyProgress / wordsPerDifficulty) * 100;
  
  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-20">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm" />
      
      {/* Top bar */}
      <div className="relative flex justify-between items-center">
        {/* Left side - Score and Round */}
        <div className="flex gap-6 items-center">
          {/* Pause button */}
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 hover:border-cyan-400/50 rounded-xl text-gray-400 hover:text-cyan-400 transition-all duration-200 group"
            title="Pause (ESC)"
          >
            <span className="flex gap-1">
              <span className="w-1.5 h-5 bg-current rounded-sm"></span>
              <span className="w-1.5 h-5 bg-current rounded-sm"></span>
            </span>
            <span className="text-xs font-medium opacity-70 group-hover:opacity-100">ESC</span>
          </button>
          
          <div className="bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/30 rounded-xl px-4 py-2">
            <span className="text-xs text-cyan-300/70 font-medium">SCORE</span>
            <div className="text-2xl font-black text-cyan-400" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>{score.toLocaleString()}</div>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-xs text-purple-300/70 font-medium">ROUND</span>
            <div className="text-2xl font-black text-purple-400" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>{currentRound}/4</div>
          </div>
        </div>

        {/* Center - Lives */}
        <div className="flex gap-2 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl px-4 py-2">
          {Array.from({ length: maxLives }).map((_, i) => (
            <div
              key={i}
              className={`text-2xl transition-all duration-300 ${
                i < lives ? 'scale-100 drop-shadow-lg' : 'scale-75 opacity-30 grayscale'
              }`}
              style={i < lives ? { filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' } : {}}
            >
              ❤️
            </div>
          ))}
        </div>

        {/* Right side - Stats */}
        <div className="flex gap-4">
          <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl px-4 py-2 text-right">
            <span className="text-xs text-green-300/70 font-medium">WPM</span>
            <div className="text-2xl font-black text-green-400" style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}>{wpm}</div>
          </div>
          <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/30 rounded-xl px-4 py-2 text-right">
            <span className="text-xs text-amber-300/70 font-medium">ACCURACY</span>
            <div className="text-2xl font-black text-amber-400" style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.5)' }}>{accuracy}%</div>
          </div>
        </div>
      </div>

      {/* Difficulty progress bar */}
      {difficultySettings && (
        <div className="relative mt-4 max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${difficultySettings.color}`}></span>
              Round {currentRound} • <span className="font-semibold">{difficultySettings.label}</span>
            </span>
            <span className="font-mono">{difficultyProgress}/{wordsPerDifficulty} words</span>
          </div>
          <div className="h-3 bg-gray-800/80 backdrop-blur-sm rounded-full overflow-hidden border border-gray-700/50">
            <div 
              className={`h-full bg-gradient-to-r ${difficultySettings.color} transition-all duration-500 ease-out relative`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer"></div>
            </div>
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
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-40" />
        
        <div className="relative bg-gray-900/95 backdrop-blur-sm border-2 border-cyan-400/60 rounded-2xl px-8 py-4 shadow-2xl">
          <div className="text-center">
            <span className="text-xs text-cyan-300/80 uppercase tracking-widest font-medium">Typing (Hindi Mangal)</span>
            <div className="text-3xl font-bold tracking-wider min-w-[140px] mt-1">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {currentInput || <span className="opacity-30 text-gray-500">टाइप करें...</span>}
              </span>
              <span className="cursor-blink text-cyan-400">|</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-2">
              <span>Press</span>
              <kbd className="px-2 py-0.5 bg-gray-700/60 rounded text-gray-400 text-xs border border-gray-600">Win</kbd>
              <span>+</span>
              <kbd className="px-2 py-0.5 bg-gray-700/60 rounded text-gray-400 text-xs border border-gray-600">Space</kbd>
              <span>for Hindi</span>
            </div>
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

// Difficulty upgrade notification
export const DifficultyUpNotification = memo(function DifficultyUpNotification({ difficulty, difficultySettings, onComplete }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none level-up-flash"
      onAnimationEnd={onComplete}
    >
      <div className="text-center">
        <div className="text-5xl font-black text-green-400 neon-text mb-2">
          ⬆️ DIFFICULTY UP!
        </div>
        <div className={`text-4xl font-bold bg-gradient-to-r ${difficultySettings?.color || 'from-yellow-400 to-orange-500'} bg-clip-text text-transparent neon-text`}>
          {difficultySettings?.label || difficulty}
        </div>
        <div className="text-xl text-gray-300 mt-2">
          20 more words to go!
        </div>
      </div>
    </div>
  );
});

// Round selection screen
export const RoundSelectScreen = memo(function RoundSelectScreen({ onSelectRound }) {
  const roundInfo = [
    {
      round: 1,
      title: 'Round 1',
      subtitle: 'Basic Words',
      color: 'from-emerald-500 via-green-500 to-teal-500',
      borderColor: 'border-emerald-400/50',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      emoji: '🌸',
    },
    {
      round: 2,
      title: 'Round 2',
      subtitle: 'Common Words',
      color: 'from-cyan-500 via-blue-500 to-indigo-500',
      borderColor: 'border-cyan-400/50',
      glowColor: 'rgba(6, 182, 212, 0.3)',
      emoji: '🦋',
    },
    {
      round: 3,
      title: 'Round 3',
      subtitle: 'Advanced Words',
      color: 'from-purple-500 via-fuchsia-500 to-pink-500',
      borderColor: 'border-purple-400/50',
      glowColor: 'rgba(168, 85, 247, 0.3)',
      emoji: '🌺',
    },
    {
      round: 4,
      title: 'Round 4',
      subtitle: 'Expert Words',
      color: 'from-orange-500 via-red-500 to-rose-500',
      borderColor: 'border-orange-400/50',
      glowColor: 'rgba(249, 115, 22, 0.3)',
      emoji: '🌟',
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40">
      {/* Animated colorful background */}
      <div className="absolute inset-0 bg-[#0a0a12]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[700px] h-[700px] bg-gradient-to-br from-violet-600/40 via-fuchsia-500/30 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-400/40 via-sky-500/30 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-amber-500/30 via-orange-500/25 to-rose-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
          <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-gradient-to-tl from-emerald-400/30 via-teal-500/25 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '1s' }} />
        </div>
      </div>

      {/* Back to Home Button */}
      <Link 
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-5 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-gray-300 hover:text-white hover:border-cyan-400 hover:bg-gray-700/60 transition-all duration-300 group z-10"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
        <span className="font-medium">Home</span>
      </Link>

      <div className="text-center p-8 max-w-2xl relative z-10">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-2 tracking-tight"
              style={{ textShadow: '0 0 60px rgba(168, 85, 247, 0.5)' }}>
            SELECT ROUND
          </h1>
          <p className="text-gray-400 text-lg">Choose your challenge</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {roundInfo.map((info) => (
            <button
              key={info.round}
              onClick={() => onSelectRound(info.round)}
              className={`group relative p-6 bg-gradient-to-br ${info.color} text-white font-bold rounded-2xl
                         hover:scale-105 transition-all duration-300 overflow-hidden
                         border-2 ${info.borderColor}`}
              style={{ boxShadow: `0 10px 40px ${info.glowColor}` }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative z-10">
                <div className="text-5xl mb-3 drop-shadow-lg group-hover:scale-110 transition-transform">{info.emoji}</div>
                <div className="text-2xl font-black tracking-wide">{info.title}</div>
                <div className="text-sm opacity-80 font-normal mt-1">{info.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
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
    <div className="absolute inset-0 flex items-center justify-center z-40">
      {/* Animated celebration background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-yellow-400/20 via-amber-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-cyan-400/20 via-purple-500/15 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        </div>
      </div>

      <div className="relative text-center p-8 bg-gray-900/90 backdrop-blur-xl border border-green-500/40 rounded-3xl max-w-md"
           style={{ boxShadow: '0 0 60px rgba(34, 197, 94, 0.2)' }}>
        {/* Glow border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 rounded-3xl opacity-30 blur-sm" />
        
        <div className="relative z-10">
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 mb-2"
              style={{ textShadow: '0 0 40px rgba(34, 197, 94, 0.5)' }}>
            ROUND {currentRound} COMPLETE!
          </h1>
          
          <div className="space-y-3 my-6 bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Score:</span>
              <span className="text-cyan-400 font-bold">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Words:</span>
              <span className="text-green-400 font-bold">{wordsDestroyed}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">WPM:</span>
              <span className="text-yellow-400 font-bold">{wpm}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Accuracy:</span>
              <span className="text-orange-400 font-bold">{accuracy}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {!isLastRound ? (
              <button
                onClick={onContinue}
                className="group px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold text-xl rounded-xl
                           hover:from-green-400 hover:to-cyan-400 transition-all duration-300 transform hover:scale-[1.02]
                           border border-green-400/50"
                style={{ boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)' }}
              >
                <span className="flex items-center justify-center gap-2">
                  NEXT ROUND
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </button>
            ) : (
              <button
                onClick={onHome}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl rounded-xl
                           hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 transform hover:scale-[1.02]
                           border border-yellow-400/50"
                style={{ boxShadow: '0 10px 40px rgba(251, 191, 36, 0.3)' }}
              >
                🏆 ALL ROUNDS COMPLETE!
              </button>
            )}
            
            <button
              onClick={onRetry}
              className="px-8 py-3 bg-gray-700/60 text-gray-300 font-bold text-lg rounded-xl
                         hover:bg-gray-600 hover:text-white transition-all duration-300
                         border border-gray-500/50"
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
    </div>
  );
});

// Game over screen
export const GameOverScreen = memo(function GameOverScreen({ 
  score, 
  currentRound,
  difficulty,
  difficultyProgress,
  wordsPerDifficulty,
  difficultySettings,
  wpm, 
  accuracy, 
  wordsDestroyed, 
  onRestart, 
  onHome 
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40">
      {/* Animated red-tinted background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-red-600/30 via-rose-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-to-tl from-orange-500/20 via-red-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        </div>
      </div>

      <div className="relative text-center p-8 bg-gray-900/90 backdrop-blur-xl border border-red-500/40 rounded-3xl max-w-md"
           style={{ boxShadow: '0 0 60px rgba(239, 68, 68, 0.2)' }}>
        {/* Glow border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-3xl opacity-30 blur-sm" />
        
        <div className="relative z-10">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 mb-6"
              style={{ textShadow: '0 0 40px rgba(239, 68, 68, 0.5)' }}>
            GAME OVER
          </h1>
          
          <div className="space-y-3 mb-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Round:</span>
              <span className="text-purple-400 font-bold">{currentRound}/4</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Difficulty:</span>
              <span className={`font-bold bg-gradient-to-r ${difficultySettings?.color || 'from-gray-400 to-gray-500'} bg-clip-text text-transparent`}>
                {difficultySettings?.label || difficulty}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Progress:</span>
              <span className="text-cyan-400 font-bold">{difficultyProgress}/{wordsPerDifficulty}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Final Score:</span>
              <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Words:</span>
              <span className="text-green-400 font-bold">{wordsDestroyed}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">WPM:</span>
              <span className="text-orange-400 font-bold">{wpm}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Accuracy:</span>
              <span className="text-pink-400 font-bold">{accuracy}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onRestart}
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-xl rounded-xl
                         hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-[1.02]
                         border border-cyan-400/50"
              style={{ boxShadow: '0 10px 40px rgba(6, 182, 212, 0.3)' }}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span>
                TRY AGAIN
              </span>
            </button>
            
            <button
              onClick={onHome}
              className="px-8 py-3 bg-gray-700/60 text-gray-300 font-bold text-lg rounded-xl
                         hover:bg-gray-600 hover:text-white transition-all duration-300
                         border border-gray-500/50"
            >
              Choose Different Round
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Game complete screen (all rounds finished)
export const GameCompleteScreen = memo(function GameCompleteScreen({ score, onHome }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40">
      {/* Animated celebration background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-yellow-500/40 via-amber-500/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-orange-400/30 via-yellow-500/25 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
        </div>
      </div>

      <div className="relative text-center p-10 bg-gray-900/90 backdrop-blur-xl border border-yellow-500/40 rounded-3xl max-w-md"
           style={{ boxShadow: '0 0 80px rgba(251, 191, 36, 0.3)' }}>
        {/* Golden glow border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-3xl opacity-40 blur-md animate-pulse" />
        
        <div className="relative z-10">
          <div className="text-9xl mb-6 animate-bounce" style={{ animationDuration: '2s' }}>🏆</div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 mb-4"
              style={{ textShadow: '0 0 60px rgba(251, 191, 36, 0.6)' }}>
            CONGRATULATIONS!
          </h1>
          <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-bold mb-6">
            You completed all 4 rounds!
          </p>
          
          <div className="text-xl bg-gray-800/60 backdrop-blur-sm rounded-2xl px-6 py-4 mb-8 border border-gray-700/50">
            <span className="text-gray-400">Final Score:</span>
            <span className="ml-3 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              {score.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onHome}
            className="group px-10 py-5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white font-black text-2xl rounded-xl
                       hover:from-yellow-400 hover:via-amber-400 hover:to-orange-400 transition-all duration-300 transform hover:scale-[1.02]
                       border border-yellow-400/50"
            style={{ boxShadow: '0 10px 50px rgba(251, 191, 36, 0.4)' }}
          >
            <span className="flex items-center justify-center gap-3">
              <span className="group-hover:rotate-12 transition-transform">⭐</span>
              PLAY AGAIN
              <span className="group-hover:-rotate-12 transition-transform">⭐</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

// Pause screen overlay
export const PauseScreen = memo(function PauseScreen({ 
  currentRound, 
  difficulty,
  difficultyProgress,
  wordsPerDifficulty,
  difficultySettings,
  allDifficultySettings,
  score, 
  lives, 
  maxLives,
  onResume, 
  onRestart,
  onChangeDifficulty,
  onHome 
}) {
  const difficultyOrder = ['beginner', 'normal', 'hard'];
  
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      {/* Animated colorful background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-violet-600/20 via-fuchsia-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-cyan-400/20 via-sky-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>
      </div>

      {/* Animated pause icon */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
        <div className="flex gap-6">
          <div className="w-10 h-32 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-xl"></div>
          <div className="w-10 h-32 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-xl"></div>
        </div>
      </div>

      <div className="relative text-center p-8 bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl max-w-md shadow-2xl"
           style={{ boxShadow: '0 0 60px rgba(6, 182, 212, 0.15)' }}>
        {/* Glow border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur-sm" />
        
        <div className="relative z-10">
          {/* Pause title */}
          <div className="mb-6">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-2">
              PAUSED
            </h1>
            <p className="text-gray-400 text-sm">Press ESC to resume</p>
          </div>

          {/* Current game stats */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 mb-6 space-y-3 border border-gray-700/50">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-400">Round</span>
              <span className="text-cyan-400 font-bold">{currentRound} / 4</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-400">Difficulty</span>
              <span className={`font-bold bg-gradient-to-r ${difficultySettings?.color || 'from-gray-400 to-gray-500'} bg-clip-text text-transparent`}>
                {difficultySettings?.label || difficulty}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-400">Progress</span>
              <span className="text-green-400 font-bold">{difficultyProgress} / {wordsPerDifficulty}</span>
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

          {/* Change Difficulty Section */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">Change Difficulty (Practice Mode)</p>
            <div className="flex gap-2 justify-center">
              {difficultyOrder.map((diff) => {
                const settings = allDifficultySettings[diff];
                const isActive = diff === difficulty;
                return (
                  <button
                    key={diff}
                    onClick={() => !isActive && onChangeDifficulty(diff)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                      isActive 
                        ? `bg-gradient-to-r ${settings.color} text-white border-2 border-white/50 shadow-lg` 
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600 hover:text-white border border-gray-600'
                    }`}
                  >
                    {settings.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onResume}
              className="group w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl rounded-xl
                         hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-[1.02]
                         border border-green-400/50 shadow-lg"
              style={{ boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)' }}
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">▶</span>
                RESUME
              </span>
            </button>
            
            <button
              onClick={onRestart}
              className="w-full px-8 py-3 bg-gradient-to-r from-amber-500/80 to-orange-500/80 text-white font-bold text-lg rounded-xl
                         hover:from-amber-400 hover:to-orange-400 transition-all duration-300
                         border border-orange-400/50"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🔄</span>
                Restart Difficulty
              </span>
            </button>
            
            <button
              onClick={onHome}
              className="w-full px-8 py-3 bg-gray-700/60 text-gray-300 font-bold text-lg rounded-xl
                         hover:bg-gray-600 hover:text-white transition-all duration-300
                         border border-gray-500/50"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🏠</span>
                Back to Round Select
              </span>
            </button>
          </div>
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
