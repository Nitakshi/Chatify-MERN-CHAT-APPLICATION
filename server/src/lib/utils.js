import jwt from "jsonwebtoken";

export const generateToken = (userId,res) => {
    const {JWT_SECRET} = process.env;
    if(!JWT_SECRET){
        throw new Error("JWT_SECRET is not configured");
    }
    // generate a jwt token with the userId as payload and a secret key from environment variables
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "4d",
    });
   
    res.cookie("jwt", token, {
        maxAge: 4*24*60*60*1000, //4 days in ms
        httpOnly: true, // cookie cannot be accessed by client-side scripts
        sameSite: "strict", // cookie will only be sent in requests from the same site
        secure: process.env.NODE_ENV === "production", // cookie will only be sent over https in production
    });

    return token;
};