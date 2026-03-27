import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const {MONGO_URI } = process.env;
        if(!MONGO_URI) throw new Error("MONGO_URI is not set");
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDb connected: ${conn.connection.host}`);
    }
    catch(err){
        console.log("MongoDb connection error: "+err);
        process.exit(1);  //1 status code means fail
    }
}