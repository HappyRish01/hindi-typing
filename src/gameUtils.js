// Import comprehensive word dataset
import { 
  EASY_WORDS, 
  MEDIUM_WORDS, 
  HARD_WORDS, 
  getWordPoolForLevel, 
  getRandomWord,
  WORD_COUNTS 
} from './data/wordDataset';

// Import round-based words
import {
  ROUND_CONFIG,
  TOTAL_ROUNDS,
  getWordsForRound,
  getRoundConfig,
  getRandomWordForRound,
} from './data/roundWords';

// Re-export for backward compatibility
export { EASY_WORDS, MEDIUM_WORDS, HARD_WORDS, getWordPoolForLevel, getRandomWord, WORD_COUNTS };

// Re-export round-based functions
export { ROUND_CONFIG, TOTAL_ROUNDS, getWordsForRound, getRoundConfig, getRandomWordForRound };

// Get speed multiplier based on level
export const getSpeedForLevel = (level) => {
  if (level <= 3) {
    return 0.5 + (level * 0.1); // Slow: 0.6 - 0.8
  } else if (level <= 6) {
    return 0.8 + ((level - 3) * 0.15); // Medium: 0.95 - 1.25
  } else {
    return 1.25 + ((level - 6) * 0.1); // Fast: 1.35+
  }
};

// Get spawn interval based on level (in ms) - Faster spawning for more words
export const getSpawnIntervalForLevel = (level) => {
  const baseInterval = 2500; // Faster base spawn
  const minInterval = 1200;  // Minimum time between spawns
  const reduction = level * 150;
  return Math.max(minInterval, baseInterval - reduction);
};

// Maximum enemies on screen at once
export const getMaxEnemiesForLevel = (level) => {
  if (level <= 2) return 4;
  if (level <= 4) return 5;
  if (level <= 6) return 6;
  return 7;
};

// Generate unique ID
export const generateId = () => {
  return `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Split Hindi word into grapheme clusters (visible characters)
export const splitIntoGraphemes = (word) => {
  // Use Intl.Segmenter for proper Hindi character segmentation
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(word), segment => segment.segment);
  }
  // Fallback: simple split (may not handle complex characters correctly)
  return [...word];
};

// Calculate WPM
export const calculateWPM = (wordsTyped, elapsedTimeMs) => {
  if (elapsedTimeMs === 0) return 0;
  const minutes = elapsedTimeMs / 60000;
  return Math.round(wordsTyped / minutes);
};

// Calculate accuracy
export const calculateAccuracy = (correctChars, totalChars) => {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
};

// Hindi matras (vowel signs) that can be attached to consonants
const HINDI_MATRAS = [
  '\u093E', // ा (aa)
  '\u093F', // ि (i)
  '\u0940', // ी (ii)
  '\u0941', // ु (u)
  '\u0942', // ू (uu)
  '\u0943', // ृ (ri)
  '\u0944', // ॄ (rii)
  '\u0945', // ॅ (candra e)
  '\u0946', // ॆ (short e)
  '\u0947', // े (e)
  '\u0948', // ै (ai)
  '\u0949', // ॉ (candra o)
  '\u094A', // ॊ (short o)
  '\u094B', // ो (o)
  '\u094C', // ौ (au)
  '\u094D', // ् (halant/virama)
  '\u0902', // ं (anusvara)
  '\u0903', // ः (visarga)
  '\u0901', // ँ (chandrabindu)
];

// Remove last character from Hindi text - removes matra first if present
export const removeLastHindiChar = (text) => {
  if (!text || text.length === 0) return '';
  
  const lastChar = text[text.length - 1];
  
  // Check if the last character is a matra/modifier
  if (HINDI_MATRAS.includes(lastChar)) {
    // Just remove the matra
    return text.slice(0, -1);
  }
  
  // If not a matra, remove the entire last grapheme cluster
  const graphemes = splitIntoGraphemes(text);
  if (graphemes.length > 0) {
    graphemes.pop();
  }
  return graphemes.join('');
};
