import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import {connectDB} from "./lib/db.js";

dotenv.config();

const app = express();
//Middlewares
app.use(express.json()); //Enables your Express application to read and process JSON data sent from clients (e.g., via POST, PUT, or PATCH requests)

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log("Server is running on port: "+PORT),
connectDB());