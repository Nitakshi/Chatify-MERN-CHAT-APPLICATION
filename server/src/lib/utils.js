import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId,res) => {
    const {JWT_SECRET} = ENV;
    if(!JWT_SECRET){
        throw new Error("JWT_SECRET is not configured");
    }
    // generate a jwt token with the userId as payload and a secret key from environment variables
    const token = jwt.sign({userId}, ENV.JWT_SECRET, {
        expiresIn: "4d",
    });
   
    res.cookie("jwt", token, { // Set the JWT token in an HTTP-only cookie with appropriate options for security and expiration
        maxAge: 4*24*60*60*1000, //4 days in ms
        httpOnly: true, // cookie cannot be accessed by client-side scripts
        sameSite: "strict", // cookie will only be sent in requests from the same site
        secure: ENV.NODE_ENV === "production", // cookie will only be sent over https in production
    });

    return token;
};