import { WordModel } from "./words.interface";

export const deleteWords = async () => {
    await WordModel.deleteMany({});
}; 

export const insertWords = async (words: InstanceType<typeof WordModel>[]) => {
    await WordModel.insertMany(words);
};

export const getRandomWords = async(count: number) => {
    return await WordModel.aggregate(
        [ { $sample: { size: count } } ]
    ).exec() as InstanceType<typeof WordModel>[];
}