import mongoose, { Document, Schema } from "mongoose";

export interface IWord extends Document {
    word: string
}

const WordsSchema = new Schema<IWord>({
    word: { type: String, required: true, unique: true, },
});

export const WordModel = mongoose.model<IWord>("Words", WordsSchema);
