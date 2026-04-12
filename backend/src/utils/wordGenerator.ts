// Default word list (deprecated, use wordLists.ts instead)
const DEFAULT_WORD_LIST = [
    "Apple", "Banana", "House", "Tree", "Car", "Dog", "Cat", "Sun", "Moon", "Star",
    "Computer", "Pizza", "Guitar", "Ocean", "Mountain", "River", "Snake", "Bird",
    "Airplane", "Train", "Bicycle", "Clock", "Camera", "Chair", "Table", "Shoe"
];

/**
 * Get random words from a provided list or default list
 * @param count Number of words to return (default: 3)
 * @param wordList Optional custom word list (if not provided, uses default)
 * @returns Array of random words
 */
export const getRandomWords = (count: number = 3, wordList?: string[]): string[] => {
    const words = wordList || DEFAULT_WORD_LIST;

    if (words.length === 0) {
        throw new Error("Word list cannot be empty");
    }

    // 1. Create a copy of the array so we don't mutate the original
    // 2. Shuffle it randomly
    const shuffled = [...words].sort(() => 0.5 - Math.random());

    // 3. Slice the first 'count' words
    return shuffled.slice(0, Math.min(count, shuffled.length));
};