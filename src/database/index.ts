import mongoose from "mongoose";
import { seedWords } from "../words/words.service";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_CONNECTION_LOCAL as string);
        await seedWords();
        return connection;
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export const closeDB = async () => {
    await mongoose.disconnect();
}
