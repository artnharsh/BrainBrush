const WORD_LIST = [
    "Apple", "Banana", "House", "Tree", "Car", "Dog", "Cat", "Sun", "Moon", "Star",
    "Computer", "Pizza", "Guitar", "Ocean", "Mountain", "River", "Snake", "Bird",
    "Airplane", "Train", "Bicycle", "Clock", "Camera", "Chair", "Table", "Shoe"
];

export const getRandomWords = (count: number = 3): string[] => {
    // 1. Create a copy of the array so we don't mutate the original
    // 2. Shuffle it randomly
    const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
    
    // 3. Slice the first 'count' (3) words
    return shuffled.slice(0, count);
};