import { isSpoofedBot } from "@arcjet/inspect";
import aj from "../lib/arcjet.js";

export const arcjetProtection = async (req, res, next) => {
    try{
        const decision = await aj.protect(req); // This will return a decision object with the following structure: { action: "ALLOW" | "BLOCK", reason: "string" }

        if(decision.isDenied()){ // If the request is blocked, you can check the reason and respond accordingly
            if(decision.reason.isRateLimit()){
                return res.status(429).json({ message: "Too many requests. Please try again later." });
            }
            else if(decision.reason.isBot()){
                return res.status(403).json({ message: "Access denied. Bot traffic is not allowed." });
            }
            else{
                return res.status(403).json({ message: "Access denied by security policy." });
            }
        }

        //check for spoofed bots
        //results is an array of all the checks that were performed on the request. If any of them indicate that the request is from a spoofed bot, we block it.
        //some() is an array method that checks if at least one element in the array satisfies the provided testing function. In this case, we check if any of the results indicate a spoofed bot.
        if(decision.results.some(isSpoofedBot)){ 
            return res.status(403).json({error:"Spoofed bot detected", message: "Access denied. Malicious bot activity detected." });
        }
        
        next(); // If the request is allowed, proceed to the next middleware or route handler
    }
    catch(error){
        console.error("Arcjet Protection error: ",error);
        next();
    }
}