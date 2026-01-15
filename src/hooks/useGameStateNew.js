import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSpeedForLevel,
  getSpawnIntervalForLevel,
  getMaxEnemiesForLevel,
  generateId,
  splitIntoGraphemes,
  calculateWPM,
  calculateAccuracy,
  getRandomWordForRound,
  getRoundConfig,
  TOTAL_ROUNDS,
} from '../gameUtils';

const GAME_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;
const GAME_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;
const ENEMY_SPAWN_MARGIN = 100;
const BOTTOM_THRESHOLD = GAME_HEIGHT - 100;

// Words needed to complete each difficulty within a round
const WORDS_PER_DIFFICULTY = 20;

// Difficulty order for auto-progression
const DIFFICULTY_ORDER = ['beginner', 'normal', 'hard'];

// Difficulty settings (affects speed, spawn rate, lives)
const DIFFICULTY_SETTINGS = {
  beginner: {
    speedMultiplier: 0.5,
    spawnMultiplier: 1.8,
    maxEnemiesMultiplier: 0.6,
    lives: 7,
    label: 'Easy',
    labelHindi: 'आसान',
    color: 'from-green-400 to-green-600',
    description: 'Slow speed, more lives',
  },
  normal: {
    speedMultiplier: 1.0,
    spawnMultiplier: 1.0,
    maxEnemiesMultiplier: 1.0,
    lives: 5,
    label: 'Medium',
    labelHindi: 'मध्यम',
    color: 'from-yellow-400 to-orange-500',
    description: 'Standard speed and lives',
  },
  hard: {
    speedMultiplier: 1.5,
    spawnMultiplier: 0.6,
    maxEnemiesMultiplier: 1.4,
    lives: 5,
    label: 'Hard',
    labelHindi: 'कठिन',
    color: 'from-red-500 to-red-700',
    description: 'Fast speed, fewer lives',
  },
};

export function useGameState(autoStart = false) {
  // Game flow states: 'round-select' -> 'playing' -> 'round-complete' / 'gameover'
  const [gameState, setGameState] = useState('round-select');
  
  // Pause state
  const [isPaused, setIsPaused] = useState(false);
  
  // Round system (1-4) - starts at 1
  const [currentRound, setCurrentRound] = useState(1);
  
  // Progress within current difficulty (0 to WORDS_PER_DIFFICULTY)
  const [difficultyProgress, setDifficultyProgress] = useState(0);
  
  // Difficulty within round (beginner -> normal -> hard)
  const [difficulty, setDifficulty] = useState('beginner');
  
  // Game stats
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [wordsDestroyed, setWordsDestroyed] = useState(0);
  
  // Enemies and projectiles
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [explosions, setExplosions] = useState([]);
  
  // Typing state
  const [currentInput, setCurrentInput] = useState('');
  const [activeTargetId, setActiveTargetId] = useState(null);
  const [errorFlashId, setErrorFlashId] = useState(null);
  
  // Stats
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);
  const [correctCharsTyped, setCorrectCharsTyped] = useState(0);
  
  // Notifications
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDifficultyUp, setShowDifficultyUp] = useState(false);

  // Sound event triggers
  const [playWordCompleteSound, setPlayWordCompleteSound] = useState(0);
  const [playLifeLostSound, setPlayLifeLostSound] = useState(0);
  const [playRoundCompleteSound, setPlayRoundCompleteSound] = useState(0);
  
  // Refs for game loop
  const gameLoopRef = useRef(null);
  const spawnIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastFrameTimeRef = useRef(null);
  const lastVisualUpdateRef = useRef(Date.now());

  // Mutable refs for arrays
  const enemiesRef = useRef([]);
  const projectilesRef = useRef([]);
  const explosionsRef = useRef([]);
  const activeTargetIdRef = useRef(null);
  const difficultyRef = useRef(difficulty);
  const currentRoundRef = useRef(currentRound);
  const recentWordsRef = useRef([]);
  const isPausedRef = useRef(false);
  const pauseStartTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0);

  // Sync refs
  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Get current round config
  const roundConfig = getRoundConfig(currentRound);
  const difficultySettings = DIFFICULTY_SETTINGS[difficulty];

  // Select round and start playing (with optional starting difficulty for practice)
  const selectRoundAndStart = useCallback((round, startingDifficulty = 'beginner') => {
    setCurrentRound(round);
    setDifficulty(startingDifficulty);
    const settings = DIFFICULTY_SETTINGS[startingDifficulty];
    
    setGameState('playing');
    setScore(0);
    setLives(settings.lives);
    setWordsDestroyed(0);
    setDifficultyProgress(0);
    setEnemies([]);
    setProjectiles([]);
    setExplosions([]);
    setCurrentInput('');
    setActiveTargetId(null);
    setWpm(0);
    setAccuracy(100);
    setTotalCharsTyped(0);
    setCorrectCharsTyped(0);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    lastFrameTimeRef.current = Date.now();
    
    // Reset refs
    enemiesRef.current = [];
    projectilesRef.current = [];
    explosionsRef.current = [];
    activeTargetIdRef.current = null;
    recentWordsRef.current = [];
  }, []);

  // Go back to round selection
  const goToRoundSelect = useCallback(() => {
    setGameState('round-select');
    setIsPaused(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
    }
    setEnemies([]);
    setProjectiles([]);
    setExplosions([]);
    enemiesRef.current = [];
    projectilesRef.current = [];
    explosionsRef.current = [];
  }, []);

  // Change difficulty during pause (for practice)
  const changeDifficulty = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
    const settings = DIFFICULTY_SETTINGS[newDifficulty];
    setLives(settings.lives);
    setDifficultyProgress(0);
    // Clear current enemies when changing difficulty
    setEnemies([]);
    enemiesRef.current = [];
    setCurrentInput('');
    setActiveTargetId(null);
    activeTargetIdRef.current = null;
    // Resume the game after changing difficulty
    if (pauseStartTimeRef.current) {
      totalPausedTimeRef.current += Date.now() - pauseStartTimeRef.current;
      pauseStartTimeRef.current = null;
    }
    setIsPaused(false);
  }, []);

  // Upgrade to next difficulty (called when completing WORDS_PER_DIFFICULTY words)
  const upgradeDifficulty = useCallback(() => {
    const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
    
    if (currentIndex < DIFFICULTY_ORDER.length - 1) {
      // Move to next difficulty
      const nextDifficulty = DIFFICULTY_ORDER[currentIndex + 1];
      setDifficulty(nextDifficulty);
      const settings = DIFFICULTY_SETTINGS[nextDifficulty];
      setLives(settings.lives);
      setDifficultyProgress(0);
      setShowDifficultyUp(true);
      
      // Clear enemies for fresh start at new difficulty
      setEnemies([]);
      enemiesRef.current = [];
      setCurrentInput('');
      setActiveTargetId(null);
      activeTargetIdRef.current = null;
    } else {
      // Completed Hard difficulty - Round is complete!
      setPlayRoundCompleteSound(prev => prev + 1);
      setTimeout(() => {
        setGameState('round-complete');
      }, 500);
    }
  }, [difficulty]);

  // Continue to next round (starts at beginner difficulty)
  const continueToNextRound = useCallback(() => {
    if (currentRound < TOTAL_ROUNDS) {
      selectRoundAndStart(currentRound + 1, 'beginner');
    } else {
      setGameState('game-complete');
    }
  }, [currentRound, selectRoundAndStart]);

  // Retry current round (start from beginner)
  const retryRound = useCallback(() => {
    selectRoundAndStart(currentRound, 'beginner');
  }, [currentRound, selectRoundAndStart]);

  // Restart from current difficulty
  const restartFromCurrentDifficulty = useCallback(() => {
    selectRoundAndStart(currentRound, difficulty);
  }, [currentRound, difficulty, selectRoundAndStart]);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (gameState !== 'playing') return;
    
    setIsPaused(prev => {
      if (!prev) {
        // Pausing - record start time
        pauseStartTimeRef.current = Date.now();
      } else {
        // Resuming - add paused duration to total
        if (pauseStartTimeRef.current) {
          totalPausedTimeRef.current += Date.now() - pauseStartTimeRef.current;
          pauseStartTimeRef.current = null;
        }
      }
      return !prev;
    });
  }, [gameState]);

  // Resume game
  const resumeGame = useCallback(() => {
    if (isPaused) {
      if (pauseStartTimeRef.current) {
        totalPausedTimeRef.current += Date.now() - pauseStartTimeRef.current;
        pauseStartTimeRef.current = null;
      }
      setIsPaused(false);
    }
  }, [isPaused]);

  // Legacy start game function
  const startGame = useCallback(() => {
    goToRoundSelect();
  }, [goToRoundSelect]);

  // Spawn enemy
  const spawnEnemy = useCallback(() => {
    const settings = DIFFICULTY_SETTINGS[difficultyRef.current];
    const round = currentRoundRef.current;
    const maxEnemies = Math.floor(getMaxEnemiesForLevel(round) * settings.maxEnemiesMultiplier);
    
    if (enemiesRef.current.length >= maxEnemies) return;

    const word = getRandomWordForRound(round, recentWordsRef.current);
    recentWordsRef.current = [...recentWordsRef.current.slice(-10), word];
    
    const x = ENEMY_SPAWN_MARGIN + Math.random() * (GAME_WIDTH - 2 * ENEMY_SPAWN_MARGIN);

    const newEnemy = {
      id: generateId(),
      word,
      x,
      y: -50,
      speed: getSpeedForLevel(round) * settings.speedMultiplier,
    };

    enemiesRef.current = [...enemiesRef.current, newEnemy];
    setEnemies(enemiesRef.current);
  }, []);

  // Find matching target for input
  const findMatchingTarget = useCallback((input, enemyList) => {
    if (!input) return null;
    
    const activeEnemy = enemyList.find(e => e.id === activeTargetIdRef.current);
    if (activeEnemy) {
      const graphemes = splitIntoGraphemes(activeEnemy.word);
      const inputGraphemes = splitIntoGraphemes(input);
      
      let matches = true;
      for (let i = 0; i < inputGraphemes.length; i++) {
        if (inputGraphemes[i] !== graphemes[i]) {
          matches = false;
          break;
        }
      }
      if (matches) return activeEnemy;
    }
    
    const sortedEnemies = [...enemyList].sort((a, b) => b.y - a.y);
    
    for (const enemy of sortedEnemies) {
      const graphemes = splitIntoGraphemes(enemy.word);
      const inputGraphemes = splitIntoGraphemes(input);
      
      let matches = true;
      for (let i = 0; i < inputGraphemes.length; i++) {
        if (inputGraphemes[i] !== graphemes[i]) {
          matches = false;
          break;
        }
      }
      if (matches) return enemy;
    }
    
    return null;
  }, []);

  // Destroy enemy
  const destroyEnemy = useCallback((enemy) => {
    const shipX = GAME_WIDTH / 2;
    const shipY = GAME_HEIGHT - 60;
    const projectileId = generateId();
    
    setPlayWordCompleteSound(prev => prev + 1);
    
    projectilesRef.current = [...projectilesRef.current, {
      id: projectileId,
      startX: shipX,
      startY: shipY,
      targetX: enemy.x,
      targetY: enemy.y,
      targetEnemyId: enemy.id,
      progress: 0,
    }];
    setProjectiles(projectilesRef.current);
    
    enemiesRef.current = enemiesRef.current.map(e => 
      e.id === enemy.id ? { ...e, isHit: true } : e
    );
    setEnemies(enemiesRef.current);
    
    const wordLength = splitIntoGraphemes(enemy.word).length;
    const difficultyMultiplier = DIFFICULTY_ORDER.indexOf(difficultyRef.current) + 1;
    const roundMultiplier = currentRoundRef.current;
    const points = wordLength * 100 * roundMultiplier * difficultyMultiplier;
    setScore(prev => prev + points);
    
    setWordsDestroyed(prev => prev + 1);
    
    // Update difficulty progress
    setDifficultyProgress(prev => {
      const newProgress = prev + 1;
      
      // Check if we completed this difficulty (20 words)
      if (newProgress >= WORDS_PER_DIFFICULTY) {
        // Trigger difficulty upgrade after a short delay
        setTimeout(() => {
          upgradeDifficulty();
        }, 300);
      }
      
      return newProgress;
    });
  }, [upgradeDifficulty]);

  // Hindi Mangal keyboard Shift+Number mappings (for keys that don't produce Hindi natively)
  const HINDI_SHIFT_NUMBER_MAP = {
    // Shift + number key → Hindi character (based on standard Hindi Mangal layout)
    'Digit3': '्र',  // Shift+3 - reph (र् conjunct)
    'Digit4': 'र्',  // Shift+4 - र्
    'Digit5': 'ज्ञ', // Shift+5 - ज्ञ
    'Digit6': 'त्र', // Shift+6 - त्र
    'Digit7': 'क्ष', // Shift+7 - क्ष
    'Digit8': 'श्र', // Shift+8 - श्र
    'Digit9': '(',   // Shift+9 - bracket (skip, not Hindi)
    'Digit0': ')',   // Shift+0 - bracket (skip, not Hindi)
  };

  // Handle keyboard input
  const handleKeyDown = useCallback((e) => {
    // Escape key toggles pause
    if (e.key === 'Escape' && gameState === 'playing') {
      e.preventDefault();
      setIsPaused(prev => {
        if (!prev) {
          pauseStartTimeRef.current = Date.now();
        } else {
          if (pauseStartTimeRef.current) {
            totalPausedTimeRef.current += Date.now() - pauseStartTimeRef.current;
            pauseStartTimeRef.current = null;
          }
        }
        return !prev;
      });
      return;
    }
    
    // Don't process input if paused or not playing
    if (gameState !== 'playing' || isPaused) return;
    
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }
    
    if (e.key === 'Backspace') {
      e.preventDefault();
      setCurrentInput(prev => {
        if (!prev) return prev;
        const graphemes = splitIntoGraphemes(prev);
        if (graphemes.length > 0) {
          graphemes.pop();
        }
        return graphemes.join('');
      });
      return;
    }
    
    if (e.key === 'Enter') {
      setCurrentInput('');
      setActiveTargetId(null);
      activeTargetIdRef.current = null;
      return;
    }
    
    // Check if this is a Shift+Number that should produce Hindi but doesn't
    let char = e.key;
    if (e.shiftKey && e.code && HINDI_SHIFT_NUMBER_MAP[e.code]) {
      // Only apply mapping if the key produced a digit (meaning Hindi didn't work)
      if (/^[0-9]$/.test(e.key)) {
        char = HINDI_SHIFT_NUMBER_MAP[e.code];
        e.preventDefault();
      }
    }
    
    if (char.length !== 1 && char !== 'Dead' && !/[\u0900-\u097F]/.test(char)) {
      return;
    }
    
    // Prevent default for all character input
    e.preventDefault();
    
    setCurrentInput(prevInput => {
      const newInput = prevInput + char;
      setTotalCharsTyped(prev => prev + 1);

      const matchingEnemy = findMatchingTarget(newInput, enemiesRef.current);

      if (matchingEnemy) {
        setActiveTargetId(matchingEnemy.id);
        activeTargetIdRef.current = matchingEnemy.id;
        setCorrectCharsTyped(prev => prev + 1);

        const graphemes = splitIntoGraphemes(matchingEnemy.word);
        const inputGraphemes = splitIntoGraphemes(newInput);

        if (inputGraphemes.length === graphemes.length) {
          destroyEnemy(matchingEnemy);
          setActiveTargetId(null);
          activeTargetIdRef.current = null;
          return '';
        }
      } else {
        setActiveTargetId(null);
        activeTargetIdRef.current = null;
      }

      return newInput;
    });
  }, [gameState, findMatchingTarget, destroyEnemy]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = Date.now();
    }
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    
    const gameLoop = () => {
      const now = Date.now();
      
      // Skip updates if paused
      if (isPausedRef.current) {
        lastFrameTimeRef.current = now; // Keep updating so delta doesn't accumulate
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      const deltaTime = Math.min((now - lastFrameTimeRef.current) / 16.67, 3);
      lastFrameTimeRef.current = now;

      enemiesRef.current = enemiesRef.current.map(enemy => ({
        ...enemy,
        y: enemy.isHit ? enemy.y : enemy.y + enemy.speed * deltaTime,
      }));

      const enemiesReachedBottom = enemiesRef.current.filter(e => e.y >= BOTTOM_THRESHOLD && !e.isHit);
      if (enemiesReachedBottom.length > 0) {
        setPlayLifeLostSound(prev => prev + 1);
        
        setLives(l => {
          const newLives = l - enemiesReachedBottom.length;
          if (newLives <= 0) {
            setGameState('gameover');
          }
          return Math.max(0, newLives);
        });

        enemiesReachedBottom.forEach(enemy => {
          if (activeTargetIdRef.current === enemy.id) {
            setCurrentInput('');
            setActiveTargetId(null);
            activeTargetIdRef.current = null;
          }
        });

        enemiesRef.current = enemiesRef.current.filter(e => e.y < BOTTOM_THRESHOLD);
      }

      projectilesRef.current = projectilesRef.current.map(p => ({ ...p, progress: p.progress + 0.15 }));

      const completedProjectiles = projectilesRef.current.filter(p => p.progress >= 1 && p.targetEnemyId);
      if (completedProjectiles.length > 0) {
        completedProjectiles.forEach(p => {
          explosionsRef.current = [...explosionsRef.current, { id: generateId(), x: p.targetX, y: p.targetY }];
          enemiesRef.current = enemiesRef.current.filter(e => e.id !== p.targetEnemyId);
        });
        projectilesRef.current = projectilesRef.current.filter(p => p.progress < 1);
      }

      if (now - lastVisualUpdateRef.current >= 50) {
        lastVisualUpdateRef.current = now;
        setEnemies([...enemiesRef.current]);
        setProjectiles([...projectilesRef.current]);
        setExplosions([...explosionsRef.current]);

        const elapsed = now - startTimeRef.current;
        setWpm(calculateWPM(wordsDestroyed, elapsed));
        setAccuracy(calculateAccuracy(correctCharsTyped, totalCharsTyped));
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, wordsDestroyed, correctCharsTyped, totalCharsTyped]);

  // Spawn enemies periodically
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const interval = Math.floor(getSpawnIntervalForLevel(currentRound) * settings.spawnMultiplier);
    
    // Wrapper that checks pause state before spawning
    const spawnIfNotPaused = () => {
      if (!isPausedRef.current) {
        spawnEnemy();
      }
    };
    
    const firstSpawnTimeout = setTimeout(() => {
      spawnIfNotPaused();
    }, 1000);
    
    spawnIntervalRef.current = setInterval(spawnIfNotPaused, interval);
    
    return () => {
      clearTimeout(firstSpawnTimeout);
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [gameState, currentRound, difficulty, spawnEnemy]);

  // Keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Remove explosion
  const removeExplosion = useCallback((id) => {
    explosionsRef.current = explosionsRef.current.filter(e => e.id !== id);
    setExplosions(explosionsRef.current);
  }, []);

  // Hide level up notification
  const hideLevelUp = useCallback(() => {
    setShowLevelUp(false);
  }, []);

  // Hide difficulty up notification
  const hideDifficultyUp = useCallback(() => {
    setShowDifficultyUp(false);
  }, []);

  return {
    // State
    gameState,
    isPaused,
    currentRound,
    difficulty,
    difficultyProgress,
    wordsPerDifficulty: WORDS_PER_DIFFICULTY,
    difficultyOrder: DIFFICULTY_ORDER,
    roundConfig,
    totalRounds: TOTAL_ROUNDS,
    difficultySettings,
    allDifficultySettings: DIFFICULTY_SETTINGS,
    score,
    lives,
    maxLives: DIFFICULTY_SETTINGS[difficulty].lives,
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
    
    // Sound triggers
    playWordCompleteSound,
    playLifeLostSound,
    playRoundCompleteSound,
    
    // Actions
    startGame,
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
  };
}
