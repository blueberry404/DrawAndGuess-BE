import { gameWords } from "./words";
import { WordModel } from "./words.interface";
import { deleteWords, insertWords } from "./words.repository";

export const seedWords = async () => {
    await deleteWords();
    const words = gameWords.map(word => new WordModel({
        word
    }));
    await insertWords(words);
};