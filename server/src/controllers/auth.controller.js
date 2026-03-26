import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Signup controller
export const signup = async (req,res) => {
    const {email, fullName, password} = req.body;
    try{
        // validate the input
        if(!email || !fullName || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password must be atleast 6 characters long"});
        }
        // check if user already exists
        const user = await User.findOne({email});
        if(user) return res.status(400).json({message: "User already exists"});
    
        // create a new user
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt); // hash the password before saving to database

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        })

        if(newUser){
            await newUser.save(); //save new user in database
            generateToken(newUser._id,res); 
            return res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
            })
        }
        else{
            console.log("Error in signup controller"+ error.message);
            return res.status(400).json({ message: "Invalid user data"});
        }
    }
    catch(error){
        return res.status(500).json({message: "Internal Server Error"});
    }
};

//Login Handler
export const login = async (req,res) => {
    const {email, password} = req.body;
    try{
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: "Invalid Credentials"});

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid Credentials"});

        generateToken(user._id,res);
        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    }catch(error){
        console.log("Error in login controller: "+ error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

//Logout Handler
export const logout = (req,res) => {
    try{
        res.cookie("jwt", "",{maxAge:0});
        return res.status(200).json({message: "Logged out successfully"});
    }
    catch(error){
        console.log("Error in logout handler: ", error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const updateProfile = (req,res) => {
    
}