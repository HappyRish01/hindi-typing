import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getWordPoolForLevel,
  getSpeedForLevel,
  getSpawnIntervalForLevel,
  getMaxEnemiesForLevel,
  getRandomWord,
  generateId,
  splitIntoGraphemes,
  calculateWPM,
  calculateAccuracy,
} from '../gameUtils';

const GAME_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;
const GAME_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;
const ENEMY_SPAWN_MARGIN = 100;
const BOTTOM_THRESHOLD = GAME_HEIGHT - 100;

export function useGameState(autoStart = false) {
  // Game state - start as 'playing' if autoStart is true
  const [gameState, setGameState] = useState(autoStart ? 'playing' : 'start'); // 'start', 'playing', 'paused', 'gameover'
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
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
  
  // Level up animation
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Refs for game loop
  const gameLoopRef = useRef(null);
  const spawnIntervalRef = useRef(null);
  const startTimeRef = useRef(autoStart ? Date.now() : null);
  const lastFrameTimeRef = useRef(autoStart ? Date.now() : null);
  const lastVisualUpdateRef = useRef(Date.now());

  // Keep mutable refs for arrays to avoid updating React state every frame
  const enemiesRef = useRef(enemies);
  const projectilesRef = useRef(projectiles);
  const explosionsRef = useRef(explosions);
  const activeTargetIdRef = useRef(activeTargetId);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(5);
    setWordsDestroyed(0);
    setEnemies([]);
    setProjectiles([]);
    setExplosions([]);
    setCurrentInput('');
    setActiveTargetId(null);
    setWpm(0);
    setAccuracy(100);
    setTotalCharsTyped(0);
    setCorrectCharsTyped(0);
    startTimeRef.current = Date.now();
    lastFrameTimeRef.current = Date.now();
    // reset refs
    enemiesRef.current = [];
    projectilesRef.current = [];
    explosionsRef.current = [];
    activeTargetIdRef.current = null;
  }, []);

  // Auto-start initialization
  useEffect(() => {
    if (autoStart && gameState === 'playing' && !startTimeRef.current) {
      startTimeRef.current = Date.now();
      lastFrameTimeRef.current = Date.now();
    }
  }, [autoStart, gameState]);

  // Spawn enemy (only if under max limit)
  const spawnEnemy = useCallback(() => {
    const maxEnemies = getMaxEnemiesForLevel(level);
    if (enemiesRef.current.length >= maxEnemies) return;

    const wordPool = getWordPoolForLevel(level);
    const word = getRandomWord(wordPool);
    const x = ENEMY_SPAWN_MARGIN + Math.random() * (GAME_WIDTH - 2 * ENEMY_SPAWN_MARGIN);

    const newEnemy = {
      id: generateId(),
      word,
      x,
      y: -50,
      speed: getSpeedForLevel(level),
    };

    enemiesRef.current = [...enemiesRef.current, newEnemy];
    // update React state once (spawn event)
    setEnemies(enemiesRef.current);
  }, [level]);

  // Find matching target for input
  const findMatchingTarget = useCallback((input, enemyList) => {
    if (!input) return null;
    
    // First check if current active target still matches
    const activeEnemy = enemyList.find(e => e.id === activeTargetId);
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
    
    // Find new matching target (closest to bottom)
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
  }, [activeTargetId]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e) => {
    if (gameState !== 'playing') return;
    
    // Ignore modifier keys alone
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {
      return;
    }
    
    // Handle backspace
    if (e.key === 'Backspace') {
      setCurrentInput(prev => {
        const graphemes = splitIntoGraphemes(prev);
        graphemes.pop();
        return graphemes.join('');
      });
      setActiveTargetId(null);
      return;
    }
    
    // Handle Enter to clear input
    if (e.key === 'Enter') {
      setCurrentInput('');
      setActiveTargetId(null);
      return;
    }
    
    // Ignore non-printable characters (but allow all printable including Hindi)
    if (e.key.length !== 1) {
      if (e.key !== 'Dead') return;
    }
    
    // Always add the character to input - use functional update to avoid stale closures
    setCurrentInput(prevInput => {
      const newInput = prevInput + e.key;
      setTotalCharsTyped(prev => prev + 1);

      // Find matching target using the mutable ref (latest positions)
      const matchingEnemy = findMatchingTarget(newInput, enemiesRef.current);

      if (matchingEnemy) {
        setActiveTargetId(matchingEnemy.id);
        setCorrectCharsTyped(prev => prev + 1);

        // Check if word is complete
        const graphemes = splitIntoGraphemes(matchingEnemy.word);
        const inputGraphemes = splitIntoGraphemes(newInput);

        if (inputGraphemes.length === graphemes.length) {
          // Word completed! Destroy enemy
          destroyEnemy(matchingEnemy);
          setActiveTargetId(null);
          return '';
        }
      } else {
        // No match - clear active target but keep input visible
        setActiveTargetId(null);
      }

      return newInput;
    });
  }, [gameState, currentInput, enemies, activeTargetId, findMatchingTarget]);

  // Destroy enemy - Fire projectile first, then destroy on impact
  const destroyEnemy = useCallback((enemy) => {
    const shipX = GAME_WIDTH / 2;
    const shipY = GAME_HEIGHT - 60;
    const projectileId = generateId();
    
    // Fire projectile toward the enemy
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
    
    // Mark enemy as "hit" (will be destroyed when projectile arrives)
    enemiesRef.current = enemiesRef.current.map(e => e.id === enemy.id ? { ...e, isHit: true } : e);
    setEnemies(enemiesRef.current);
    
    // Update score immediately for responsiveness
    const wordLength = splitIntoGraphemes(enemy.word).length;
    const points = wordLength * 100 * level;
    setScore(prev => prev + points);
    
    // Update words destroyed
    setWordsDestroyed(prev => {
      const newCount = prev + 1;
      
      // Check for level up
      if (newCount % 10 === 0) {
        setLevel(l => l + 1);
        setShowLevelUp(true);
      }
      
      return newCount;
    });
  }, [level]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Initialize time refs if not set
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = Date.now();
    }
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastFrameTimeRef.current) / 16.67, 3); // Cap deltaTime to prevent huge jumps
      lastFrameTimeRef.current = now;

      // Update enemy positions (mutating refs, not React state every frame)
      enemiesRef.current = enemiesRef.current.map(enemy => ({
        ...enemy,
        y: enemy.isHit ? enemy.y : enemy.y + enemy.speed * deltaTime,
      }));

      // Check for enemies reaching bottom (only non-hit ones)
      const enemiesReachedBottom = enemiesRef.current.filter(e => e.y >= BOTTOM_THRESHOLD && !e.isHit);
      if (enemiesReachedBottom.length > 0) {
        // Lose lives for enemies that reached bottom
        setLives(l => {
          const newLives = l - enemiesReachedBottom.length;
          if (newLives <= 0) {
            setGameState('gameover');
          }
          return Math.max(0, newLives);
        });

        // Clear input if active target reached bottom
        enemiesReachedBottom.forEach(enemy => {
          if (activeTargetIdRef.current === enemy.id) {
            setCurrentInput('');
            setActiveTargetId(null);
            activeTargetIdRef.current = null;
          }
        });

        enemiesRef.current = enemiesRef.current.filter(e => e.y < BOTTOM_THRESHOLD);
      }

      // Update projectiles (progress) and handle impacts
      projectilesRef.current = projectilesRef.current.map(p => ({ ...p, progress: p.progress + 0.15 }));

      const completedProjectiles = projectilesRef.current.filter(p => p.progress >= 1 && p.targetEnemyId);
      if (completedProjectiles.length > 0) {
        completedProjectiles.forEach(p => {
          // Create explosion at target position
          explosionsRef.current = [...explosionsRef.current, { id: generateId(), x: p.targetX, y: p.targetY }];
          // Remove the hit enemy from refs
          enemiesRef.current = enemiesRef.current.filter(e => e.id !== p.targetEnemyId);
        });

        // cleanup completed projectiles
        projectilesRef.current = projectilesRef.current.filter(p => p.progress < 1);
      }

      // Throttle visual React updates to reduce renders (update every ~50ms for smoother visuals)
      if (now - lastVisualUpdateRef.current >= 50) {
        lastVisualUpdateRef.current = now;
        setEnemies([...enemiesRef.current]);
        setProjectiles([...projectilesRef.current]);
        setExplosions([...explosionsRef.current]);

        // Update WPM and accuracy at throttled rate
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
  }, [gameState, wordsDestroyed, correctCharsTyped, totalCharsTyped, activeTargetId]);

  // Spawn enemies periodically
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = getSpawnIntervalForLevel(level);
    
    // Small delay before first spawn to let player get ready
    const firstSpawnTimeout = setTimeout(() => {
      spawnEnemy();
    }, 1000);
    
    spawnIntervalRef.current = setInterval(spawnEnemy, interval);
    
    return () => {
      clearTimeout(firstSpawnTimeout);
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [gameState, level, spawnEnemy]);

  // Keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Remove explosion after animation
  const removeExplosion = useCallback((id) => {
    explosionsRef.current = explosionsRef.current.filter(e => e.id !== id);
    setExplosions(explosionsRef.current);
  }, []);

  // Sync activeTargetIdRef when it changes
  useEffect(() => {
    activeTargetIdRef.current = activeTargetId;
  }, [activeTargetId]);

  // Hide level up notification
  const hideLevelUp = useCallback(() => {
    setShowLevelUp(false);
  }, []);

  return {
    // State
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
    
    // Actions
    startGame,
    removeExplosion,
    hideLevelUp,
  };
}
