import { memo } from 'react';
import { splitIntoGraphemes } from '../gameUtils';

// Enemy/Asteroid component with word
const Enemy = memo(function Enemy({ enemy, typedChars, isActive, hasError }) {
  const graphemes = splitIntoGraphemes(enemy.word);
  const isHit = enemy.isHit;
  
  // Don't render enemies that are hit (waiting for projectile)
  if (isHit) {
    return (
      <div
        className="absolute"
        style={{
          left: enemy.x,
          top: enemy.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Fading out effect when hit */}
        <div className="relative animate-pulse opacity-50 scale-90 transition-all duration-200">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <path
              d="M40 5 L55 12 L70 25 L75 40 L70 55 L60 70 L40 75 L25 70 L10 55 L5 40 L10 25 L25 12 Z"
              fill="#4a4063"
              stroke="#00ffff"
              strokeWidth="2"
              opacity="0.5"
            />
          </svg>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="px-3 py-1 rounded-lg text-lg font-bold bg-gray-900/60 border border-green-500">
              <span className="text-green-400">{enemy.word}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={`absolute transition-all duration-150 ${hasError ? 'animate-shake' : ''}`}
      style={{
        left: enemy.x,
        top: enemy.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Enemy body (asteroid) */}
      <div className={`relative ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
        {/* Glow effect for active target */}
        {isActive && (
          <div className="absolute inset-0 -m-6 rounded-full bg-cyan-500/30 blur-xl animate-pulse" />
        )}
        
        {/* Asteroid shape */}
        <svg
          width="70"
          height="70"
          viewBox="0 0 80 80"
          className={`transition-all duration-200 ${
            isActive 
              ? 'drop-shadow-[0_0_20px_rgba(0,255,255,0.9)]' 
              : 'drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]'
          }`}
        >
          <defs>
            <radialGradient id={`asteroidGrad_${enemy.id}`} cx="30%" cy="30%">
              <stop offset="0%" stopColor="#8b7fb8" />
              <stop offset="50%" stopColor="#5a4d7a" />
              <stop offset="100%" stopColor="#2d2540" />
            </radialGradient>
          </defs>
          
          {/* Asteroid shape */}
          <path
            d="M40 5 L55 12 L70 25 L75 40 L70 55 L60 70 L40 75 L25 70 L10 55 L5 40 L10 25 L25 12 Z"
            fill={`url(#asteroidGrad_${enemy.id})`}
            stroke={isActive ? '#00ffff' : '#8b5cf6'}
            strokeWidth={isActive ? 3 : 2}
          />
          
          {/* Crater details */}
          <circle cx="30" cy="30" r="6" fill="#3d3455" opacity="0.5" />
          <circle cx="50" cy="45" r="4" fill="#3d3455" opacity="0.4" />
          <circle cx="35" cy="55" r="5" fill="#3d3455" opacity="0.3" />
        </svg>

        {/* Word label */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div
            className={`px-4 py-2 rounded-xl text-xl font-bold tracking-wider transition-all duration-200
                       ${isActive 
                         ? 'bg-gray-900 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30' 
                         : 'bg-gray-900/90 border border-purple-500/50'
                       }
                       ${hasError ? 'border-red-500 shadow-red-500/50' : ''}`}
          >
            {graphemes.map((char, index) => {
              const isTyped = isActive && index < typedChars;
              return (
                <span
                  key={index}
                  className={`transition-all duration-100 ${
                    isTyped
                      ? 'text-green-400 font-black text-shadow-green'
                      : isActive
                      ? 'text-white'
                      : 'text-gray-300'
                  }`}
                  style={isTyped ? { textShadow: '0 0 10px #22c55e, 0 0 20px #22c55e' } : {}}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

export default Enemy;
