import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import {connectDB} from "./lib/db.js";
import path from "path";

dotenv.config();
const app = express();
const __dirname = path.resolve();

//Middlewares
app.use(express.json()); //Enables your Express application to read and process JSON data sent from clients (e.g., via POST, PUT, or PATCH requests)

app.use("/api/auth", authRoutes);

//make ready for deployment (Servalla)
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../client/dist"))); //“Serve all files inside client/dist as static files”
    //For ANY route not handled above, send index.html (Any other routes other than above)
    app.get("*", (req,res) => {
        res.sendFile(path.join(__dirname, "../client","dist","index.html"));
    })
}

const PORT = process.env.PORT || 3000;
connectDB()
    .then(() => {
        app.listen(PORT, () => {console.log("Server running on port:",PORT)})
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB: ",err);
        process.exit(1);
    })
