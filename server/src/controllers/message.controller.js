import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId } from "../lib/socket.js"; 
import { io } from "../lib/socket.js";

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
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const sendMessages = async (req,res) => {
    try{
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        if(!text && !image){
            return res.status(400).json({message: "Message text or image is required"});
        }
        // Prevent users from sending messages to themselves
        if(senderId.toString() === receiverId.toString()){
            return res.status(400).json({message: "You cannot send message to yourself"});
        }
        //Check if receiver exists
        const receiverExists = await User.exists({_id: receiverId});
        if(!receiverExists){
            return res.status(404).json({message: "Receiver not found"});
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

        //Implemented real time functionality (send message in real time if user is online)
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(200).json(newMessage);
    }
    catch(error){
        console.error("Error in sendMessage controller: ",error);
        return res.status(500).json({message: "Internal Server Error"});
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
        }).sort({ createdAt: -1 });

        const chatPartnersId = [
            ...new Set(
                messages.map((msg) => 
                msg.senderId.toString() === loggedInUserId.toString() ? msg.receiverId.toString() : msg.senderId.toString())
            )
        ];

        const chatPartners = await User.find({ _id : {$in : chatPartnersId}}).select("-password");
        
        // Add latest message for each chat partner
        const chatPartnersWithMessages = await Promise.all(
            chatPartners.map(async (partner) => {
                const latestMessage = await Message.findOne({
                    $or: [
                        {senderId: loggedInUserId, receiverId: partner._id},
                        {senderId: partner._id, receiverId: loggedInUserId},
                    ]
                }).sort({ createdAt: -1 });

                return {
                    ...partner.toObject(),
                    latestMessage: latestMessage
                };
            })
        );

        return res.status(200).json(chatPartnersWithMessages);
    }
    catch(error){
        console.error("Error in get chat partner controller: ", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Only allow sender to delete their own message
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        await Message.findByIdAndDelete(messageId);

        // Emit deletion event to both users in real-time
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        const senderSocketId = getReceiverSocketId(message.senderId);
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", { messageId });
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("messageDeleted", { messageId });
        }

        return res.status(200).json({ message: "Message deleted successfully", messageId });
    } catch (error) {
        console.error("Error in deleteMessage: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const { userId: otherUserId } = req.params;
        const loggedInUserId = req.user._id;

        // Check if other user exists
        const userExists = await User.exists({ _id: otherUserId });
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete all messages between the two users
        const result = await Message.deleteMany({
            $or: [
                { senderId: loggedInUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: loggedInUserId },
            ]
        });

        // Emit deletion event to both users
        const receiverSocketId = getReceiverSocketId(otherUserId);
        const senderSocketId = getReceiverSocketId(loggedInUserId);
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("chatDeleted", { userId: loggedInUserId });
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("chatDeleted", { userId: otherUserId });
        }

        return res.status(200).json({ message: "Chat deleted successfully", deletedCount: result.deletedCount });
    } catch (error) {
        console.error("Error in deleteChat: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};