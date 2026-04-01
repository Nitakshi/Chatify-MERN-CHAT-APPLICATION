import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import { registerValidation, loginValidation } from "../validators/auth.validator.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import {ENV} from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";

// Signup controller
export const signup = async (req,res) => {
    const {error, value} = registerValidation(req.body);
    if(error){
       return res.status(400).json({message: error.details[0].message});
    }

    try{
        const {email, fullName, password, profilePic} = value;

        // check if user already exists
        const user = await User.findOne({email});
        if(user) return res.status(400).json({message: "User already exists"});
        
        // create a new user
        const newUser = new User({
            email,
            fullName,
            password,
            profilePic,
        })

        if(newUser){
            const savedUser = await newUser.save(); //save new user in database
            generateToken(newUser._id,res); 

            //send a welcome email to user
            sendWelcomeEmail(savedUser.fullName, savedUser.email, ENV.CLIENT_URL).catch((err) => {
                console.error("Error sending welcome email: ", err);
            });

            return res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
            });
        }

    }
    catch(error){
        console.error("Error in signup: "+ error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

//Login Handler
export const login = async (req,res) => {
    const {error,value} = loginValidation(req.body);
    if(error){
       return res.status(400).json({message: error.details[0].message});
    }

    try{
        const {email, password} = value;
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: "Invalid Credentials"});

        const isPasswordCorrect = await user.matchPassword(password);
        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid Credentials"});

        generateToken(user._id,res);
        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    }catch(error){
        console.error("Error in login controller: "+ error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

//Logout Handler
export const logout = (req,res) => {
    try{
        if(!req.cookies?.jwt){ // Check if the JWT cookie exists in the request. If it doesn't, it means the user is not logged in.
            return res.status(400).json({message: "No user logged in"});
        }
        res.cookie("jwt", "",{maxAge:0});
        return res.status(200).json({message: "Logged out successfully"});
    }
    catch(error){
        console.error("Error in logout handler: ", error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const updateProfile = async (req,res) => {
    try{
        const {profilePic} = req.body;
        if(!profilePic) return res.status(400).json({message: "Profile Pic is required"});

        const userId = req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePic,{
            folder: "profile_pics", //Organizes uploaded images into a folder named "profile_pics" in your Cloudinary account, making it easier to manage and retrieve profile pictures.
            transformation: [
                {width: 500, height: 500, crop: "limit"},
                {quality: "auto"}, //Automatic compression to optimize image size without compromising quality.
                {fetch_format: "auto"}, //Automatic format selection to serve the most efficient image format based on the client's browser capabilities.
            ]
        }); // Upload the new profile picture to Cloudinary and get the secure URL of the uploaded image.
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url},{new:true}).select("-password"); // Update the user's profile picture in the database with the new URL and return the updated user document.   
        return res.status(200).json(updatedUser);
    }
    catch(error){
        console.log("Error in update profile: ",error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const checkAuth = async (req,res) => {
    try{
        return res.status(200).json(req.user); //This is used to verify that the user is logged in and to retrieve their profile information.
    }
    catch(error){
        console.error("Error in checkAuth: ", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

//Delete Account Handler
export const deleteAccount = async (req,res) => {
    try{
        const userId = req.user._id;
        
        // Delete all messages where user is sender or receiver
        await Message.deleteMany({
            $or: [
                {senderId: userId},
                {receiverId: userId}
            ]
        });
        
        // Delete user from database
        await User.findByIdAndDelete(userId);
        
        // Clear the JWT cookie
        res.cookie("jwt", "",{maxAge:0});
        
        return res.status(200).json({message: "Account deleted successfully"});
    }
    catch(error){
        console.error("Error in deleteAccount: ", error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}