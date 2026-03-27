import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
    try{
        if(!ENV.MONGO_URI) throw new Error("MONGO_URI is not set");
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log(`MongoDb connected: ${conn.connection.host}`);
    }
    catch(err){
        console.log("MongoDb connection error: "+err);
        process.exit(1);  //1 status code means fail
    }
}