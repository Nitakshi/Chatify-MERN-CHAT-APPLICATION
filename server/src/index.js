import express from "express";
import authRoutes from "./routes/auth.route.js";
import {connectDB} from "./lib/db.js";
import path from "path";
import { ENV } from "./lib/env.js";
import cookieParser from "cookie-parser";

const app = express();
const __dirname = path.resolve();

//Middlewares
app.use(express.json({limit: "5mb"})); //Enables your Express application to read and process JSON data sent from clients (e.g., via POST, PUT, or PATCH requests)
app.use(express.urlencoded({limit:"5mb",extended: true})); //Enables your Express application to read and process URL-encoded data sent from clients (e.g., form submissions). The extended: true option allows for rich objects and arrays to be encoded into the URL-encoded format, using the qs library.
app.use(cookieParser()); //Enables your Express application to read and process cookies sent from clients. It parses the Cookie header and populates req.cookies with an object keyed by the cookie names. This is essential for handling authentication tokens, session IDs, and other data stored in cookies.

app.use("/api/auth", authRoutes); 

//make ready for deployment 
if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../client","dist"))); //“Serve all files inside client/dist as static files”
    //__dirname means the current directory of the server, and we are joining it with "../client/dist" to get the absolute path to the client/dist directory. This allows Express to serve the static files (like index.html, CSS, JS) from that directory when the application is running in production mode.
    //For ANY route not handled above, send index.html (Any other routes other than above)
    app.get("*", (req,res) => {
        res.sendFile(path.join(__dirname, "../client","dist","index.html")); //This means that for any route that is not handled by the above routes (like /api/auth), the server will respond by sending the index.html file from the client/dist directory. This is important for client-side routing in single-page applications (SPAs) where the client-side JavaScript handles routing and needs to receive index.html for all routes to work properly.
    })
}

const PORT = ENV.PORT || 3000;
connectDB()
    .then(() => {
        app.listen(PORT, () => {console.log("Server running on port:",PORT)})
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB: ",err);
        process.exit(1);
    })
