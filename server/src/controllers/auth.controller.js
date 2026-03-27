import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import { registerValidation, loginValidation } from "../validators/auth.validator.js";

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
            await newUser.save(); //save new user in database
            generateToken(newUser._id,res); 
            return res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
            })
        }

        //todo: send a welcome email to user
    }
    catch(error){
        console.log("Error in signup: "+ error);
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