import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js"; 

export const getAllContacts = async (req,res) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId }}).select('-password');

        return res.status(200).json(filteredUsers);
    }
    catch(error){
        console.error("Error in getAllContacts: ",error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getMessagesByUserId = async (req,res) => {
    try{
        const userId = req.user._id;
        const {id: userToChatId} = req.params;

        const messages = await Message.find({
            $or: [
                {senderId: userId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: userId},
            ]
        });

        return res.status(200).json(messages);
    }
    catch(error){
        console.error("Error in getMessages controller: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

export const sendMessages = async (req,res) => {
    try{
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        if(!text && !image){
            return res.status(400).json({error: "Message text or image is required"});
        }
        // Prevent users from sending messages to themselves
        if(senderId.toString() === receiverId.toString()){
            return res.status(400).json({error: "You cannot send message to yourself"});
        }
        //Check if receiver exists
        const receiverExists = await User.exists({_id: receiverId});
        if(!receiverExists){
            return res.status(404).json({error: "Receiver not found"});
        }

        let imageUrl;
        if(image){
            //upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();
        //TODO: implement real time functionality (send message in real time if user is online)
        return res.status(200).json(newMessage);
    }
    catch(error){
        console.error("Error in sendMessage controller: ",error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

export const getChatPartners = async (req,res) => {
    try{
        const loggedInUserId = req.user._id;

        //find all the messages where the logged in user is either sender or receiver
        const messages = await Message.find({
            $or: [
                {senderId: loggedInUserId},
                {receiverId: loggedInUserId},
            ]
        });

        const chatPartnersId = [
            ...new Set(
                messages.map((msg) => 
                msg.senderId.toString() === loggedInUserId.toString() ? msg.receiverId.toString() : msg.senderId.toString())
            )
        ];

        const chatPartners = await User.find({ _id : {$in : chatPartnersId}}).select("-password");
        return res.status(200).json(chatPartners);
    }
    catch(error){
        console.error("Error in get chat partner controller: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}