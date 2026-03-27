import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import { registerValidation, loginValidation } from "../validators/auth.validator.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

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
            try{
                await sendWelcomeEmail(savedUser.fullName,savedUser.email,process.env.CLIENT_URL);
            }
            catch(err){
                console.error("Failed to send welcome email: ", err);
            }
        }

        return res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
        });
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
        res.cookie("jwt", "",{maxAge:0});
        return res.status(200).json({message: "Logged out successfully"});
    }
    catch(error){
        console.error("Error in logout handler: ", error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const updateProfile = (req,res) => {
    
}