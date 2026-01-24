import mongoose from "mongoose";

const connectDB = async () => {
//    const DB = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.cvwkho7.mongodb.net/Connectly?retryWrites=true&w=majority`;

    const DB = "mongodb://localhost:27017/Connectly"
    if (!DB) {
        console.error("MongoDB URI is not defined in environment variables.");
         process.exit(1);
    }
    try {
        await mongoose.connect(DB)
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log(error);
         process.exit(1);
    }
}
export default connectDB
