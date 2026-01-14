import { useState, useEffect, useCallback, useRef } from 'react';import { useState, useEffect, useCallback, useRef } from 'react';

import {import {

  getSpeedForLevel,  getWordPoolForLevel,

  getSpawnIntervalForLevel,  getSpeedForLevel,

  getMaxEnemiesForLevel,  getSpawnIntervalForLevel,

  generateId,  getMaxEnemiesForLevel,

  splitIntoGraphemes,  getRandomWord,

  calculateWPM,  generateId,

  calculateAccuracy,  splitIntoGraphemes,

  getRandomWordForRound,  calculateWPM,

  getRoundConfig,  calculateAccuracy,

  TOTAL_ROUNDS,} from '../gameUtils';

} from '../gameUtils';

const GAME_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;

const GAME_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;const GAME_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;

const GAME_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;const ENEMY_SPAWN_MARGIN = 100;

const ENEMY_SPAWN_MARGIN = 100;const BOTTOM_THRESHOLD = GAME_HEIGHT - 100;

const BOTTOM_THRESHOLD = GAME_HEIGHT - 100;

// difficulty multipliers

// Difficulty settings (affects speed, spawn rate, lives)const DIFFICULTY_SETTINGS = {

const DIFFICULTY_SETTINGS = {  beginner: {

  beginner: {    speedMultiplier: 0.6,

    speedMultiplier: 0.5,    spawnMultiplier: 1.5,  

    spawnMultiplier: 1.8,  // Slower spawn (higher = more time between spawns)    maxEnemiesMultiplier: 0.7,

    maxEnemiesMultiplier: 0.6,    lives: 7,

    lives: 7,  },

    label: 'Beginner',  normal: {

    labelHindi: 'शुरुआती',    speedMultiplier: 1.0,

    color: 'from-green-400 to-green-600',    spawnMultiplier: 1.0,

    description: 'धीमी गति, अधिक जीवन',    maxEnemiesMultiplier: 1.0,

  },    lives: 5,

  normal: {  },

    speedMultiplier: 1.0,  hard: {

    spawnMultiplier: 1.0,    speedMultiplier: 1.4,

    maxEnemiesMultiplier: 1.0,    spawnMultiplier: 0.7, 

    lives: 5,    maxEnemiesMultiplier: 1.3,

    label: 'Normal',    lives: 3,

    labelHindi: 'सामान्य',  },

    color: 'from-yellow-400 to-orange-500',};

    description: 'मानक गति और जीवन',

  },export function useGameState(autoStart = false) {

  hard: {  // Game state - start with difficulty selection directly (skip start screen)

    speedMultiplier: 1.5,  const [gameState, setGameState] = useState(autoStart ? 'playing' : 'difficulty-select'); // 'difficulty-select', 'playing', 'paused', 'gameover'

    spawnMultiplier: 0.6,  // Faster spawn  const [difficulty, setDifficulty] = useState('normal'); // 'beginner', 'normal', 'hard'

    maxEnemiesMultiplier: 1.4,  const [score, setScore] = useState(0);

    lives: 3,  const [level, setLevel] = useState(1);

    label: 'Hard',  const [lives, setLives] = useState(5);

    labelHindi: 'कठिन',  const [wordsDestroyed, setWordsDestroyed] = useState(0);

    color: 'from-red-500 to-red-700',  

    description: 'तेज़ गति, कम जीवन',  // Enemies and projectiles

  },  const [enemies, setEnemies] = useState([]);

};  const [projectiles, setProjectiles] = useState([]);

  const [explosions, setExplosions] = useState([]);

export function useGameState(autoStart = false) {  

  // Game flow states: 'round-select' -> 'difficulty-select' -> 'playing' -> 'round-complete' / 'gameover'  // Typing state

  const [gameState, setGameState] = useState('round-select');  const [currentInput, setCurrentInput] = useState('');

    const [activeTargetId, setActiveTargetId] = useState(null);

  // Round system (1-4)  const [errorFlashId, setErrorFlashId] = useState(null);

  const [currentRound, setCurrentRound] = useState(1);  

  const [roundProgress, setRoundProgress] = useState(0); // Words completed in current round  // Stats

    const [wpm, setWpm] = useState(0);

  // Difficulty  const [accuracy, setAccuracy] = useState(100);

  const [difficulty, setDifficulty] = useState('normal');  const [totalCharsTyped, setTotalCharsTyped] = useState(0);

    const [correctCharsTyped, setCorrectCharsTyped] = useState(0);

  // Game stats  

  const [score, setScore] = useState(0);  // Level up animation

  const [lives, setLives] = useState(5);  const [showLevelUp, setShowLevelUp] = useState(false);

  const [wordsDestroyed, setWordsDestroyed] = useState(0);

    // Sound event triggers (for components to react to)

  // Enemies and projectiles  const [playWordCompleteSound, setPlayWordCompleteSound] = useState(0);

  const [enemies, setEnemies] = useState([]);  const [playLifeLostSound, setPlayLifeLostSound] = useState(0);

  const [projectiles, setProjectiles] = useState([]);  

  const [explosions, setExplosions] = useState([]);  // Refs for game loop

    const gameLoopRef = useRef(null);

  // Typing state  const spawnIntervalRef = useRef(null);

  const [currentInput, setCurrentInput] = useState('');  const startTimeRef = useRef(autoStart ? Date.now() : null);

  const [activeTargetId, setActiveTargetId] = useState(null);  const lastFrameTimeRef = useRef(autoStart ? Date.now() : null);

  const [errorFlashId, setErrorFlashId] = useState(null);  const lastVisualUpdateRef = useRef(Date.now());

  

  // Stats  // Keep mutable refs for arrays to avoid updating React state every frame

  const [wpm, setWpm] = useState(0);  const enemiesRef = useRef(enemies);

  const [accuracy, setAccuracy] = useState(100);  const projectilesRef = useRef(projectiles);

  const [totalCharsTyped, setTotalCharsTyped] = useState(0);  const explosionsRef = useRef(explosions);

  const [correctCharsTyped, setCorrectCharsTyped] = useState(0);  const activeTargetIdRef = useRef(activeTargetId);

    const difficultyRef = useRef(difficulty);

  // Notifications

  const [showLevelUp, setShowLevelUp] = useState(false);  // Update difficulty ref when difficulty changes

  useEffect(() => {

  // Sound event triggers    difficultyRef.current = difficulty;

  const [playWordCompleteSound, setPlayWordCompleteSound] = useState(0);  }, [difficulty]);

  const [playLifeLostSound, setPlayLifeLostSound] = useState(0);

  const [playRoundCompleteSound, setPlayRoundCompleteSound] = useState(0);  // Show difficulty selection screen

    const showDifficultySelect = useCallback(() => {

  // Refs for game loop    setGameState('difficulty-select');

  const gameLoopRef = useRef(null);  }, []);

  const spawnIntervalRef = useRef(null);

  const startTimeRef = useRef(null);  // Select difficulty and start game

  const lastFrameTimeRef = useRef(null);  const selectDifficultyAndStart = useCallback((selectedDifficulty) => {

  const lastVisualUpdateRef = useRef(Date.now());    setDifficulty(selectedDifficulty);

    const settings = DIFFICULTY_SETTINGS[selectedDifficulty];

  // Mutable refs for arrays    

  const enemiesRef = useRef([]);    setGameState('playing');

  const projectilesRef = useRef([]);    setScore(0);

  const explosionsRef = useRef([]);    setLevel(1);

  const activeTargetIdRef = useRef(null);    setLives(settings.lives);

  const difficultyRef = useRef(difficulty);    setWordsDestroyed(0);

  const currentRoundRef = useRef(currentRound);    setEnemies([]);

  const recentWordsRef = useRef([]);    setProjectiles([]);

    setExplosions([]);

  // Sync refs    setCurrentInput('');

  useEffect(() => {    setActiveTargetId(null);

    difficultyRef.current = difficulty;    setWpm(0);

  }, [difficulty]);    setAccuracy(100);

    setTotalCharsTyped(0);

  useEffect(() => {    setCorrectCharsTyped(0);

    currentRoundRef.current = currentRound;    startTimeRef.current = Date.now();

  }, [currentRound]);    lastFrameTimeRef.current = Date.now();

    // reset refs

  // Get current round config    enemiesRef.current = [];

  const roundConfig = getRoundConfig(currentRound);    projectilesRef.current = [];

  const difficultySettings = DIFFICULTY_SETTINGS[difficulty];    explosionsRef.current = [];

    activeTargetIdRef.current = null;

  // Select round and go to difficulty selection  }, []);

  const selectRound = useCallback((round) => {

    setCurrentRound(round);  // Start game (legacy - now goes to difficulty select)

    setGameState('difficulty-select');  const startGame = useCallback(() => {

  }, []);    showDifficultySelect();

  }, [showDifficultySelect]);

  // Select difficulty and start playing

  const selectDifficultyAndStart = useCallback((selectedDifficulty) => {  // Auto-start initialization

    setDifficulty(selectedDifficulty);  useEffect(() => {

    const settings = DIFFICULTY_SETTINGS[selectedDifficulty];    if (autoStart && gameState === 'playing' && !startTimeRef.current) {

          startTimeRef.current = Date.now();

    setGameState('playing');      lastFrameTimeRef.current = Date.now();

    setScore(0);    }

    setLives(settings.lives);  }, [autoStart, gameState]);

    setWordsDestroyed(0);

    setRoundProgress(0);  // Spawn enemy (only if under max limit)

    setEnemies([]);  const spawnEnemy = useCallback(() => {

    setProjectiles([]);    const settings = DIFFICULTY_SETTINGS[difficultyRef.current];

    setExplosions([]);    const maxEnemies = Math.floor(getMaxEnemiesForLevel(level) * settings.maxEnemiesMultiplier);

    setCurrentInput('');    if (enemiesRef.current.length >= maxEnemies) return;

    setActiveTargetId(null);

    setWpm(0);    const wordPool = getWordPoolForLevel(level);

    setAccuracy(100);    const word = getRandomWord(wordPool);

    setTotalCharsTyped(0);    const x = ENEMY_SPAWN_MARGIN + Math.random() * (GAME_WIDTH - 2 * ENEMY_SPAWN_MARGIN);

    setCorrectCharsTyped(0);

    startTimeRef.current = Date.now();    const newEnemy = {

    lastFrameTimeRef.current = Date.now();      id: generateId(),

          word,

    // Reset refs      x,

    enemiesRef.current = [];      y: -50,

    projectilesRef.current = [];      speed: getSpeedForLevel(level) * settings.speedMultiplier,

    explosionsRef.current = [];    };

    activeTargetIdRef.current = null;

    recentWordsRef.current = [];    enemiesRef.current = [...enemiesRef.current, newEnemy];

  }, []);    // update React state once (spawn event)

    setEnemies(enemiesRef.current);

  // Go back to round selection  }, [level]);

  const goToRoundSelect = useCallback(() => {

    setGameState('round-select');  // Find matching target for input

    // Clear any running game state  const findMatchingTarget = useCallback((input, enemyList) => {

    if (gameLoopRef.current) {    if (!input) return null;

      cancelAnimationFrame(gameLoopRef.current);    

    }    // First check if current active target still matches

    if (spawnIntervalRef.current) {    const activeEnemy = enemyList.find(e => e.id === activeTargetId);

      clearInterval(spawnIntervalRef.current);    if (activeEnemy) {

    }      const graphemes = splitIntoGraphemes(activeEnemy.word);

    setEnemies([]);      const inputGraphemes = splitIntoGraphemes(input);

    setProjectiles([]);      

    setExplosions([]);      let matches = true;

    enemiesRef.current = [];      for (let i = 0; i < inputGraphemes.length; i++) {

    projectilesRef.current = [];        if (inputGraphemes[i] !== graphemes[i]) {

    explosionsRef.current = [];          matches = false;

  }, []);          break;

        }

  // Continue to next round      }

  const continueToNextRound = useCallback(() => {      if (matches) return activeEnemy;

    if (currentRound < TOTAL_ROUNDS) {    }

      setCurrentRound(prev => prev + 1);    

      setGameState('difficulty-select');    // Find new matching target (closest to bottom)

    } else {    const sortedEnemies = [...enemyList].sort((a, b) => b.y - a.y);

      // All rounds completed!    

      setGameState('game-complete');    for (const enemy of sortedEnemies) {

    }      const graphemes = splitIntoGraphemes(enemy.word);

  }, [currentRound]);      const inputGraphemes = splitIntoGraphemes(input);

      

  // Retry current round      let matches = true;

  const retryRound = useCallback(() => {      for (let i = 0; i < inputGraphemes.length; i++) {

    setGameState('difficulty-select');        if (inputGraphemes[i] !== graphemes[i]) {

  }, []);          matches = false;

          break;

  // Legacy start game function        }

  const startGame = useCallback(() => {      }

    goToRoundSelect();      if (matches) return enemy;

  }, [goToRoundSelect]);    }

    

  // Spawn enemy    return null;

  const spawnEnemy = useCallback(() => {  }, [activeTargetId]);

    const settings = DIFFICULTY_SETTINGS[difficultyRef.current];

    const round = currentRoundRef.current;  // Handle keyboard input

    const maxEnemies = Math.floor(getMaxEnemiesForLevel(round) * settings.maxEnemiesMultiplier);  const handleKeyDown = useCallback((e) => {

        if (gameState !== 'playing') return;

    if (enemiesRef.current.length >= maxEnemies) return;    

    // Ignore modifier keys alone

    // Get word from current round's word pool    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {

    const word = getRandomWordForRound(round, recentWordsRef.current);      return;

        }

    // Track recent words to avoid repetition    

    recentWordsRef.current = [...recentWordsRef.current.slice(-10), word];    // Handle backspace - remove one grapheme (character/matra)

        if (e.key === 'Backspace') {

    const x = ENEMY_SPAWN_MARGIN + Math.random() * (GAME_WIDTH - 2 * ENEMY_SPAWN_MARGIN);      e.preventDefault();

      setCurrentInput(prev => {

    const newEnemy = {        if (!prev) return prev;

      id: generateId(),        const graphemes = splitIntoGraphemes(prev);

      word,        if (graphemes.length > 0) {

      x,          graphemes.pop();

      y: -50,        }

      speed: getSpeedForLevel(round) * settings.speedMultiplier,        return graphemes.join('');

    };      });

      // Don't clear active target on backspace - let it re-match

    enemiesRef.current = [...enemiesRef.current, newEnemy];      return;

    setEnemies(enemiesRef.current);    }

  }, []);    

    // Handle Enter to clear input

  // Find matching target for input    if (e.key === 'Enter') {

  const findMatchingTarget = useCallback((input, enemyList) => {      setCurrentInput('');

    if (!input) return null;      setActiveTargetId(null);

          return;

    const activeEnemy = enemyList.find(e => e.id === activeTargetIdRef.current);    }

    if (activeEnemy) {    

      const graphemes = splitIntoGraphemes(activeEnemy.word);    // Allow printable characters including Hindi and digits

      const inputGraphemes = splitIntoGraphemes(input);    // e.key.length === 1 covers letters, digits, punctuation

          // 'Dead' is for combining characters

      let matches = true;    if (e.key.length !== 1 && e.key !== 'Dead') {

      for (let i = 0; i < inputGraphemes.length; i++) {      return;

        if (inputGraphemes[i] !== graphemes[i]) {    }

          matches = false;    

          break;    // Always add the character to input - use functional update to avoid stale closures

        }    setCurrentInput(prevInput => {

      }      const newInput = prevInput + e.key;

      if (matches) return activeEnemy;      setTotalCharsTyped(prev => prev + 1);

    }

          // Find matching target using the mutable ref (latest positions)

    const sortedEnemies = [...enemyList].sort((a, b) => b.y - a.y);      const matchingEnemy = findMatchingTarget(newInput, enemiesRef.current);

    

    for (const enemy of sortedEnemies) {      if (matchingEnemy) {

      const graphemes = splitIntoGraphemes(enemy.word);        setActiveTargetId(matchingEnemy.id);

      const inputGraphemes = splitIntoGraphemes(input);        setCorrectCharsTyped(prev => prev + 1);

      

      let matches = true;        // Check if word is complete

      for (let i = 0; i < inputGraphemes.length; i++) {        const graphemes = splitIntoGraphemes(matchingEnemy.word);

        if (inputGraphemes[i] !== graphemes[i]) {        const inputGraphemes = splitIntoGraphemes(newInput);

          matches = false;

          break;        if (inputGraphemes.length === graphemes.length) {

        }          // Word completed! Destroy enemy

      }          destroyEnemy(matchingEnemy);

      if (matches) return enemy;          setActiveTargetId(null);

    }          return '';

            }

    return null;      } else {

  }, []);        // No match - clear active target but keep input visible

        setActiveTargetId(null);

  // Destroy enemy      }

  const destroyEnemy = useCallback((enemy) => {

    const shipX = GAME_WIDTH / 2;      return newInput;

    const shipY = GAME_HEIGHT - 60;    });

    const projectileId = generateId();  }, [gameState, currentInput, enemies, activeTargetId, findMatchingTarget]);

    

    setPlayWordCompleteSound(prev => prev + 1);  // Destroy enemy - Fire projectile first, then destroy on impact

      const destroyEnemy = useCallback((enemy) => {

    projectilesRef.current = [...projectilesRef.current, {    const shipX = GAME_WIDTH / 2;

      id: projectileId,    const shipY = GAME_HEIGHT - 60;

      startX: shipX,    const projectileId = generateId();

      startY: shipY,    

      targetX: enemy.x,    // Trigger word complete sound

      targetY: enemy.y,    setPlayWordCompleteSound(prev => prev + 1);

      targetEnemyId: enemy.id,    

      progress: 0,    // Fire projectile toward the enemy

    }];    projectilesRef.current = [...projectilesRef.current, {

    setProjectiles(projectilesRef.current);      id: projectileId,

          startX: shipX,

    enemiesRef.current = enemiesRef.current.map(e =>       startY: shipY,

      e.id === enemy.id ? { ...e, isHit: true } : e      targetX: enemy.x,

    );      targetY: enemy.y,

    setEnemies(enemiesRef.current);      targetEnemyId: enemy.id,

          progress: 0,

    const wordLength = splitIntoGraphemes(enemy.word).length;    }];

    const roundMultiplier = currentRoundRef.current;    setProjectiles(projectilesRef.current);

    const points = wordLength * 100 * roundMultiplier;    

    setScore(prev => prev + points);    // Mark enemy as "hit" (will be destroyed when projectile arrives)

        enemiesRef.current = enemiesRef.current.map(e => e.id === enemy.id ? { ...e, isHit: true } : e);

    setWordsDestroyed(prev => prev + 1);    setEnemies(enemiesRef.current);

        

    // Update round progress    // Update score immediately for responsiveness

    setRoundProgress(prev => {    const wordLength = splitIntoGraphemes(enemy.word).length;

      const newProgress = prev + 1;    const points = wordLength * 100 * level;

      const config = getRoundConfig(currentRoundRef.current);    setScore(prev => prev + points);

          

      // Check if round is complete    // Update words destroyed

      if (newProgress >= config.wordsToComplete) {    setWordsDestroyed(prev => {

        // Round complete!      const newCount = prev + 1;

        setPlayRoundCompleteSound(p => p + 1);      

              // Check for level up

        // Delay state change slightly for visual feedback      if (newCount % 10 === 0) {

        setTimeout(() => {        setLevel(l => l + 1);

          setGameState('round-complete');        setShowLevelUp(true);

        }, 500);      }

      }      

            return newCount;

      return newProgress;    });

    });  }, [level]);

  }, []);

  // Game loop

  // Handle keyboard input  useEffect(() => {

  const handleKeyDown = useCallback((e) => {    if (gameState !== 'playing') return;

    if (gameState !== 'playing') return;    

        // Initialize time refs if not set

    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {    if (!lastFrameTimeRef.current) {

      return;      lastFrameTimeRef.current = Date.now();

    }    }

        if (!startTimeRef.current) {

    if (e.key === 'Backspace') {      startTimeRef.current = Date.now();

      e.preventDefault();    }

      setCurrentInput(prev => {    

        if (!prev) return prev;    const gameLoop = () => {

        const graphemes = splitIntoGraphemes(prev);      const now = Date.now();

        if (graphemes.length > 0) {      const deltaTime = Math.min((now - lastFrameTimeRef.current) / 16.67, 3); // Cap deltaTime to prevent huge jumps

          graphemes.pop();      lastFrameTimeRef.current = now;

        }

        return graphemes.join('');      // Update enemy positions (mutating refs, not React state every frame)

      });      enemiesRef.current = enemiesRef.current.map(enemy => ({

      return;        ...enemy,

    }        y: enemy.isHit ? enemy.y : enemy.y + enemy.speed * deltaTime,

          }));

    if (e.key === 'Enter') {

      setCurrentInput('');      // Check for enemies reaching bottom (only non-hit ones)

      setActiveTargetId(null);      const enemiesReachedBottom = enemiesRef.current.filter(e => e.y >= BOTTOM_THRESHOLD && !e.isHit);

      activeTargetIdRef.current = null;      if (enemiesReachedBottom.length > 0) {

      return;        // Trigger life lost sound

    }        setPlayLifeLostSound(prev => prev + 1);

            

    if (e.key.length !== 1 && e.key !== 'Dead') {        // Lose lives for enemies that reached bottom

      return;        setLives(l => {

    }          const newLives = l - enemiesReachedBottom.length;

              if (newLives <= 0) {

    setCurrentInput(prevInput => {            setGameState('gameover');

      const newInput = prevInput + e.key;          }

      setTotalCharsTyped(prev => prev + 1);          return Math.max(0, newLives);

        });

      const matchingEnemy = findMatchingTarget(newInput, enemiesRef.current);

        // Clear input if active target reached bottom

      if (matchingEnemy) {        enemiesReachedBottom.forEach(enemy => {

        setActiveTargetId(matchingEnemy.id);          if (activeTargetIdRef.current === enemy.id) {

        activeTargetIdRef.current = matchingEnemy.id;            setCurrentInput('');

        setCorrectCharsTyped(prev => prev + 1);            setActiveTargetId(null);

            activeTargetIdRef.current = null;

        const graphemes = splitIntoGraphemes(matchingEnemy.word);          }

        const inputGraphemes = splitIntoGraphemes(newInput);        });



        if (inputGraphemes.length === graphemes.length) {        enemiesRef.current = enemiesRef.current.filter(e => e.y < BOTTOM_THRESHOLD);

          destroyEnemy(matchingEnemy);      }

          setActiveTargetId(null);

          activeTargetIdRef.current = null;      // Update projectiles (progress) and handle impacts

          return '';      projectilesRef.current = projectilesRef.current.map(p => ({ ...p, progress: p.progress + 0.15 }));

        }

      } else {      const completedProjectiles = projectilesRef.current.filter(p => p.progress >= 1 && p.targetEnemyId);

        setActiveTargetId(null);      if (completedProjectiles.length > 0) {

        activeTargetIdRef.current = null;        completedProjectiles.forEach(p => {

      }          // Create explosion at target position

          explosionsRef.current = [...explosionsRef.current, { id: generateId(), x: p.targetX, y: p.targetY }];

      return newInput;          // Remove the hit enemy from refs

    });          enemiesRef.current = enemiesRef.current.filter(e => e.id !== p.targetEnemyId);

  }, [gameState, findMatchingTarget, destroyEnemy]);        });



  // Game loop        // cleanup completed projectiles

  useEffect(() => {        projectilesRef.current = projectilesRef.current.filter(p => p.progress < 1);

    if (gameState !== 'playing') return;      }

    

    if (!lastFrameTimeRef.current) {      // Throttle visual React updates to reduce renders (update every ~50ms for smoother visuals)

      lastFrameTimeRef.current = Date.now();      if (now - lastVisualUpdateRef.current >= 50) {

    }        lastVisualUpdateRef.current = now;

    if (!startTimeRef.current) {        setEnemies([...enemiesRef.current]);

      startTimeRef.current = Date.now();        setProjectiles([...projectilesRef.current]);

    }        setExplosions([...explosionsRef.current]);

    

    const gameLoop = () => {        // Update WPM and accuracy at throttled rate

      const now = Date.now();        const elapsed = now - startTimeRef.current;

      const deltaTime = Math.min((now - lastFrameTimeRef.current) / 16.67, 3);        setWpm(calculateWPM(wordsDestroyed, elapsed));

      lastFrameTimeRef.current = now;        setAccuracy(calculateAccuracy(correctCharsTyped, totalCharsTyped));

      }

      // Update enemy positions

      enemiesRef.current = enemiesRef.current.map(enemy => ({      gameLoopRef.current = requestAnimationFrame(gameLoop);

        ...enemy,    };

        y: enemy.isHit ? enemy.y : enemy.y + enemy.speed * deltaTime,    

      }));    gameLoopRef.current = requestAnimationFrame(gameLoop);

    

      // Check for enemies reaching bottom    return () => {

      const enemiesReachedBottom = enemiesRef.current.filter(e => e.y >= BOTTOM_THRESHOLD && !e.isHit);      if (gameLoopRef.current) {

      if (enemiesReachedBottom.length > 0) {        cancelAnimationFrame(gameLoopRef.current);

        setPlayLifeLostSound(prev => prev + 1);      }

            };

        setLives(l => {  }, [gameState, wordsDestroyed, correctCharsTyped, totalCharsTyped, activeTargetId]);

          const newLives = l - enemiesReachedBottom.length;

          if (newLives <= 0) {  // Spawn enemies periodically

            setGameState('gameover');  useEffect(() => {

          }    if (gameState !== 'playing') return;

          return Math.max(0, newLives);    

        });    const settings = DIFFICULTY_SETTINGS[difficulty];

    const interval = Math.floor(getSpawnIntervalForLevel(level) * settings.spawnMultiplier);

        enemiesReachedBottom.forEach(enemy => {    

          if (activeTargetIdRef.current === enemy.id) {    // Small delay before first spawn to let player get ready

            setCurrentInput('');    const firstSpawnTimeout = setTimeout(() => {

            setActiveTargetId(null);      spawnEnemy();

            activeTargetIdRef.current = null;    }, 1000);

          }    

        });    spawnIntervalRef.current = setInterval(spawnEnemy, interval);

    

        enemiesRef.current = enemiesRef.current.filter(e => e.y < BOTTOM_THRESHOLD);    return () => {

      }      clearTimeout(firstSpawnTimeout);

      if (spawnIntervalRef.current) {

      // Update projectiles        clearInterval(spawnIntervalRef.current);

      projectilesRef.current = projectilesRef.current.map(p => ({ ...p, progress: p.progress + 0.15 }));      }

    };

      const completedProjectiles = projectilesRef.current.filter(p => p.progress >= 1 && p.targetEnemyId);  }, [gameState, level, difficulty, spawnEnemy]);

      if (completedProjectiles.length > 0) {

        completedProjectiles.forEach(p => {  // Keyboard listener

          explosionsRef.current = [...explosionsRef.current, { id: generateId(), x: p.targetX, y: p.targetY }];  useEffect(() => {

          enemiesRef.current = enemiesRef.current.filter(e => e.id !== p.targetEnemyId);    window.addEventListener('keydown', handleKeyDown);

        });    return () => window.removeEventListener('keydown', handleKeyDown);

        projectilesRef.current = projectilesRef.current.filter(p => p.progress < 1);  }, [handleKeyDown]);

      }

  // Remove explosion after animation

      // Throttle visual updates  const removeExplosion = useCallback((id) => {

      if (now - lastVisualUpdateRef.current >= 50) {    explosionsRef.current = explosionsRef.current.filter(e => e.id !== id);

        lastVisualUpdateRef.current = now;    setExplosions(explosionsRef.current);

        setEnemies([...enemiesRef.current]);  }, []);

        setProjectiles([...projectilesRef.current]);

        setExplosions([...explosionsRef.current]);  // Sync activeTargetIdRef when it changes

  useEffect(() => {

        const elapsed = now - startTimeRef.current;    activeTargetIdRef.current = activeTargetId;

        setWpm(calculateWPM(wordsDestroyed, elapsed));  }, [activeTargetId]);

        setAccuracy(calculateAccuracy(correctCharsTyped, totalCharsTyped));

      }  // Hide level up notification

  const hideLevelUp = useCallback(() => {

      gameLoopRef.current = requestAnimationFrame(gameLoop);    setShowLevelUp(false);

    };  }, []);

    

    gameLoopRef.current = requestAnimationFrame(gameLoop);  return {

        // State

    return () => {    gameState,

      if (gameLoopRef.current) {    difficulty,

        cancelAnimationFrame(gameLoopRef.current);    score,

      }    level,

    };    lives,

  }, [gameState, wordsDestroyed, correctCharsTyped, totalCharsTyped]);    maxLives: DIFFICULTY_SETTINGS[difficulty].lives,

    wordsDestroyed,

  // Spawn enemies periodically    enemies,

  useEffect(() => {    projectiles,

    if (gameState !== 'playing') return;    explosions,

        currentInput,

    const settings = DIFFICULTY_SETTINGS[difficulty];    activeTargetId,

    const interval = Math.floor(getSpawnIntervalForLevel(currentRound) * settings.spawnMultiplier);    errorFlashId,

        wpm,

    const firstSpawnTimeout = setTimeout(() => {    accuracy,

      spawnEnemy();    showLevelUp,

    }, 1000);    

        // Sound triggers (increment to play)

    spawnIntervalRef.current = setInterval(spawnEnemy, interval);    playWordCompleteSound,

        playLifeLostSound,

    return () => {    

      clearTimeout(firstSpawnTimeout);    // Actions

      if (spawnIntervalRef.current) {    startGame,

        clearInterval(spawnIntervalRef.current);    selectDifficultyAndStart,

      }    removeExplosion,

    };    hideLevelUp,

  }, [gameState, currentRound, difficulty, spawnEnemy]);  };

}

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

  return {
    // State
    gameState,
    currentRound,
    roundProgress,
    roundConfig,
    totalRounds: TOTAL_ROUNDS,
    difficulty,
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
    
    // Sound triggers
    playWordCompleteSound,
    playLifeLostSound,
    playRoundCompleteSound,
    
    // Actions
    startGame,
    selectRound,
    selectDifficultyAndStart,
    goToRoundSelect,
    continueToNextRound,
    retryRound,
    removeExplosion,
    hideLevelUp,
  };
}
