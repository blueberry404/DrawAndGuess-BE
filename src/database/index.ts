import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        return mongoose.connect(process.env.DATABASE_CONNECTION_LOCAL as string);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export const closeDB = async () => {
    await mongoose.disconnect();
}
