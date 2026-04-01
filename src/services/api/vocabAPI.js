import axios from "axios";
import levenshtein from 'js-levenshtein';
import { Store } from "../../flux";
import { alphabetCache, alphabetCacheTimestamps } from "./alphabetAPI";

// Utility: Format string using Store method
const formatString = (str) => Store.formatString(str);

// Utility: Capitalize the first letter
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Cache setup
const vocabCache = new Map();
const vocabCacheTimestamps = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Find vocab in alphabet cache
const findVocabInAlphabetData = (vocabName) => {
  if (!vocabName) return null;

  const formatted = formatString(vocabName);
  const firstLetter = formatted.charAt(0);

  if (alphabetCache?.has(firstLetter)) {
    console.log(`Looking for "${vocabName}" in alphabet cache [${firstLetter}]`);

    const entries = alphabetCache.get(firstLetter);
    const matches = entries.filter(
      (item) => !formatString(item.word).localeCompare(formatted)
    );

    if (matches.length > 0) {
      console.log(`Found "${vocabName}" in alphabet cache`);
      return matches;
    }
  }

  return null;
};

// Fetch vocab from external API
export const fetchVocabDetailFromAPI = async (vocabName) => {
  if (!vocabName) return null;

  const formatted = formatString(vocabName);
  const capitalized = capitalizeFirstLetter(vocabName);

  try {
    const cachedData = findVocabInAlphabetData(vocabName);
    if (cachedData) return cachedData;

    console.log(`Fetching "${vocabName}" from API`);
    // Use params object so axios URL-encodes the value correctly (handles spaces, special chars)
    const response = await axios.get('/api/bims', {
      params: {
        'populate': '*',
        'filters[Word][$containsi]': capitalized
      }
    });

    const data = response.data?.data || [];
    const filtered = data
      .map((item) => ({
        kumpulanKategori: item.category_group?.KumpulanKategori || `${item.Kumpulan}/${item.Kategori}`,
        groupCategory: item.category_group?.GroupCategory || `${item.Group}/${item.Category}`,
        word: item.Word || '',
        perkataan: item.Perkataan || '',
        video: item.Video || '',
        tag: item.Tag || '',
        new: item.New || 'No',
        order: item.Order || '',
        imgStatus: item.Image_Status || ''
      }))
      .filter(
        (entry) =>
          // Removed release filtering
          !formatString(entry.word).localeCompare(formatted)
      );

    return filtered.length > 0 ? filtered : null;
  } catch (error) {
    console.error("API error while fetching vocab:", error);
    return null;
  }
};

// Get vocab with caching
export const getVocabDetail = async (vocabName) => {
  if (!vocabName) return null;

  const now = Date.now();

  try {
    // Return cached if valid
    if (
      vocabCache.has(vocabName) &&
      vocabCacheTimestamps.has(vocabName) &&
      now - vocabCacheTimestamps.get(vocabName) < CACHE_DURATION
    ) {
      console.log(`Using cached vocab: "${vocabName}"`);
      return vocabCache.get(vocabName);
    }

    // Check alphabet cache
    const alphabetData = findVocabInAlphabetData(vocabName);
    if (alphabetData) {
      vocabCache.set(vocabName, alphabetData);
      vocabCacheTimestamps.set(vocabName, now);
      return alphabetData;
    }

    // Fetch from API
    console.log(`Cache miss for "${vocabName}", querying API...`);
    const fetched = await fetchVocabDetailFromAPI(vocabName);

    if (fetched) {
      vocabCache.set(vocabName, fetched);
      vocabCacheTimestamps.set(vocabName, now);
    }

    return fetched;
  } catch (err) {
    console.error(`Failed to get vocab: "${vocabName}"`, err);

    // Fallback to stale cache if available
    if (vocabCache.has(vocabName)) {
      console.log(`Using stale cache for "${vocabName}"`);
      return vocabCache.get(vocabName);
    }

    // Last-resort fallback to Store
    console.log(`Falling back to Store for "${vocabName}"`);
    return Store.getVocabDetail(vocabName);
  }
};

// Clear vocab cache
export const clearVocabCache = (vocabName = null) => {
  if (vocabName) {
    vocabCache.delete(vocabName);
    vocabCacheTimestamps.delete(vocabName);
    console.log(`Cleared cache for: "${vocabName}"`);
  } else {
    vocabCache.clear();
    vocabCacheTimestamps.clear();
    console.log("Cleared all vocab caches");
  }
};

// Find similar words based on the given vocab using Levenshtein distance
export const findSimilarWords = async (vocabName, limit = 5) => {
  if (!vocabName) return [];
  
  try {
    // Get the first letter of the vocab to check the alphabet cache
    const formatted = formatString(vocabName);
    const firstLetter = formatted.charAt(0);
    
    // Try to get words from the same alphabet first
    let wordsFromSameAlphabet = [];
    
    if (alphabetCache.has(firstLetter)) {
      wordsFromSameAlphabet = alphabetCache.get(firstLetter);
    } else {
      // If not in cache, fetch from API
      const { getVocabsByAlphabet } = require('./alphabetAPI');
      wordsFromSameAlphabet = await getVocabsByAlphabet(firstLetter);
    }
    
    // Calculate Levenshtein distance for each word
    const scoredWords = wordsFromSameAlphabet
      .filter(item => formatString(item.word) !== formatted) // Exclude the current word
      .map(item => ({
        ...item, // Keep all original properties
        score: levenshtein(formatString(item.word), formatted)
      }));

    // Sort by similarity score (lower is better)
    const similarWords = scoredWords
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
      
    return similarWords;
  } catch (err) {
    console.error(`Failed to find similar words for: "${vocabName}"`, err);
    return [];
  }
};
