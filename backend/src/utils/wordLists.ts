// Word lists organized by difficulty and category
// Each list has 20-30 words for moderate variety

// ==========================================
// DIFFICULTY LEVELS
// ==========================================

export const EASY_WORDS = [
  "Apple", "Ball", "Cat", "Dog", "Egg", "Fish", "Hat", "Ice", "Kite", "Lion",
  "Monkey", "Nose", "Orange", "Pig", "Queen", "Rain", "Sun", "Tiger", "Umbrella", "Van",
  "Water", "Xylophone", "Yak", "Zebra", "Star", "Moon"
];

export const MEDIUM_WORDS = [
  "Bicycle", "Camera", "Dinosaur", "Elephant", "Firefighter", "Guitar", "Hospital", "Iceberg", "Jellyfish", "Keyboard",
  "Lighthouse", "Microphone", "Ninja", "Octopus", "Pyramid", "Rainbow", "Skateboard", "Telescope", "Volcano", "Whistle",
  "Yacht", "Zodiac", "Anchor", "Butterfly", "Computer", "Dragon"
];

export const HARD_WORDS = [
  "Archaeology", "Biomechanics", "Catastrophe", "Demographic", "Entrepreneur", "Fossil", "Geometry", "Hemisphere", "Interrogate", "Jurisdiction",
  "Kaleidoscope", "Lacrosse", "Metropolis", "Necromancer", "Onomatopoeia", "Palindrome", "Quintessential", "Renaissance", "Silhouette", "Tranquility",
  "Unbelievable", "Vocabulary", "Wanderlust", "Xenophobic", "Yielding", "Zealous"
];

// ==========================================
// CATEGORY LISTS
// ==========================================

export const ANIMALS_WORDS = [
  "Ant", "Bear", "Cheetah", "Dolphin", "Eagle", "Flamingo", "Giraffe", "Hippo", "Iguana", "Jaguar",
  "Koala", "Lemur", "Moose", "Newt", "Ostrich", "Penguin", "Quail", "Raccoon", "Sloth", "Tapir",
  "Urchin", "Vulture", "Walrus", "Xenops", "Yak", "Zebra"
];

export const FOOD_WORDS = [
  "Apple", "Bread", "Carrot", "Donut", "Egg", "Fries", "Grapes", "Hamburger", "Ice cream", "Jello",
  "Ketchup", "Lasagna", "Muffin", "Nachos", "Olive", "Pizza", "Quesadilla", "Rice", "Sandwich", "Taco",
  "Udon", "Vanilla", "Waffle", "Xylophone", "Yogurt", "Zucchini"
];

export const SPORTS_WORDS = [
  "Archery", "Baseball", "Cricket", "Darts", "Equestrian", "Football", "Golf", "Hockey", "Ice skating", "Judo",
  "Kayaking", "Lacrosse", "Martial arts", "Netball", "Olympic", "Polo", "Quarterback", "Rugby", "Skiing", "Tennis",
  "Ultimate frisbee", "Volleyball", "Water polo", "Xtreme", "Yatching", "Zumba"
];

export const TECH_WORDS = [
  "Algorithm", "Blockchain", "Cybersecurity", "Database", "Encryption", "Firewall", "GPU", "Hardware", "Internet", "Javascript",
  "Kernel", "Laptop", "Modem", "Network", "Operating system", "Protocol", "Query", "Router", "Server", "Token",
  "Upload", "Virtual", "Wifi", "XML", "YouTube", "Zip"
];

// ==========================================
// CATEGORY MAPPING
// ==========================================

export type WordCategory = 'random' | 'animals' | 'food' | 'sports' | 'tech' | 'custom';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

const categoryMap: Record<WordCategory, string[]> = {
  random: [...EASY_WORDS, ...MEDIUM_WORDS, ...HARD_WORDS],
  animals: ANIMALS_WORDS,
  food: FOOD_WORDS,
  sports: SPORTS_WORDS,
  tech: TECH_WORDS,
  custom: [] // Will be provided by user
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

/**
 * Get word list by difficulty level
 */
export const getWordsByDifficulty = (difficulty: DifficultyLevel): string[] => {
  switch (difficulty) {
    case 'easy':
      return EASY_WORDS;
    case 'medium':
      return MEDIUM_WORDS;
    case 'hard':
      return HARD_WORDS;
    default:
      return MEDIUM_WORDS;
  }
};

/**
 * Get word list by category
 * If custom category with customWords provided, use those instead
 */
export const getWordsByCategory = (category: WordCategory, customWords?: string[]): string[] => {
  if (category === 'custom' && customWords && customWords.length > 0) {
    return customWords;
  }
  return categoryMap[category] || categoryMap.random;
};

/**
 * Get word list by both difficulty and category
 * Uses intersection of both filters (or defaults to category if difficulty doesn't apply)
 */
export const getWordsByDifficultyAndCategory = (
  difficulty: DifficultyLevel,
  category: WordCategory,
  customWords?: string[]
): string[] => {
  // If custom category, use that (with custom words if provided)
  if (category === 'custom') {
    return getWordsByCategory('custom', customWords);
  }

  // For specific categories, select difficulty-appropriate subset
  const categoryWords = getWordsByCategory(category);

  // If not enough words in category, mix in words from difficulty level
  if (categoryWords.length < 5) {
    const difficultyWords = getWordsByDifficulty(difficulty);
    return [...categoryWords, ...difficultyWords].slice(0, 30);
  }

  return categoryWords;
};

/**
 * Validate custom words: ensure at least 3 words provided
 */
export const validateCustomWords = (words: string[]): { valid: boolean; error?: string } => {
  if (!words || words.length < 3) {
    return { valid: false, error: 'At least 3 custom words required' };
  }
  return { valid: true };
};
