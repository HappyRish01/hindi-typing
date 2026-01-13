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
    setEnemies(prev => {
      const maxEnemies = getMaxEnemiesForLevel(level);
      if (prev.length >= maxEnemies) {
        return prev; // Don't spawn if at max
      }
      
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
      
      return [...prev, newEnemy];
    });
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
    
    // Always add the character to input
    const newInput = currentInput + e.key;
    setCurrentInput(newInput);
    setTotalCharsTyped(prev => prev + 1);
    
    // Find matching target
    const matchingEnemy = findMatchingTarget(newInput, enemies);
    
    if (matchingEnemy) {
      setActiveTargetId(matchingEnemy.id);
      setCorrectCharsTyped(prev => prev + 1);
      
      // Check if word is complete
      const graphemes = splitIntoGraphemes(matchingEnemy.word);
      const inputGraphemes = splitIntoGraphemes(newInput);
      
      if (inputGraphemes.length === graphemes.length) {
        // Word completed! Destroy enemy
        destroyEnemy(matchingEnemy);
        setCurrentInput('');
        setActiveTargetId(null);
      }
    } else {
      // No match - clear active target but keep input visible
      setActiveTargetId(null);
    }
  }, [gameState, currentInput, enemies, activeTargetId, findMatchingTarget]);

  // Destroy enemy - Fire projectile first, then destroy on impact
  const destroyEnemy = useCallback((enemy) => {
    const shipX = GAME_WIDTH / 2;
    const shipY = GAME_HEIGHT - 60;
    const projectileId = generateId();
    
    // Fire projectile toward the enemy
    setProjectiles(prev => [...prev, {
      id: projectileId,
      startX: shipX,
      startY: shipY,
      targetX: enemy.x,
      targetY: enemy.y,
      targetEnemyId: enemy.id,
      progress: 0,
    }]);
    
    // Mark enemy as "hit" (will be destroyed when projectile arrives)
    setEnemies(prev => prev.map(e => 
      e.id === enemy.id ? { ...e, isHit: true } : e
    ));
    
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
      
      // Update enemy positions
      setEnemies(prev => {
        const updated = prev.map(enemy => ({
          ...enemy,
          y: enemy.isHit ? enemy.y : enemy.y + enemy.speed * deltaTime, // Don't move hit enemies
        }));
        
        // Check for enemies reaching bottom (only non-hit ones)
        const enemiesReachedBottom = updated.filter(e => e.y >= BOTTOM_THRESHOLD && !e.isHit);
        
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
            if (activeTargetId === enemy.id) {
              setCurrentInput('');
              setActiveTargetId(null);
            }
          });
        }
        
        return updated.filter(e => e.y < BOTTOM_THRESHOLD);
      });
      
      // Update projectiles and handle impacts
      setProjectiles(prev => {
        const updated = prev.map(p => ({ ...p, progress: p.progress + 0.15 }));
        
        // Check for projectiles that reached their target
        const completedProjectiles = updated.filter(p => p.progress >= 1 && p.targetEnemyId);
        
        if (completedProjectiles.length > 0) {
          completedProjectiles.forEach(p => {
            // Create explosion at target position
            setExplosions(ex => [...ex, { 
              id: generateId(), 
              x: p.targetX, 
              y: p.targetY
            }]);
            // Remove the hit enemy
            setEnemies(en => en.filter(e => e.id !== p.targetEnemyId));
          });
        }
        
        return updated.filter(p => p.progress < 1);
      });
      
      // Calculate WPM
      const elapsed = now - startTimeRef.current;
      setWpm(calculateWPM(wordsDestroyed, elapsed));
      
      // Calculate accuracy
      setAccuracy(calculateAccuracy(correctCharsTyped, totalCharsTyped));
      
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
    setExplosions(prev => prev.filter(e => e.id !== id));
  }, []);

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
