import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    profilePic: {
        type: String,
        default: "",
    }
}, {timestamps: true});

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

//Middleware: to hash password before saving
userSchema.pre("save", async function(next){
    if(!this.isModified('password')){ return (next);}
    try{
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        }
        catch(error){
            next(error);
        }
})

const User = mongoose.model("User", userSchema);
export default User;