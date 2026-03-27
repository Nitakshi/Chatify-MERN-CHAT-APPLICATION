import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',   
        required: true,         
    },
    text:{
        type: String,
        trim: true,
        maxlength: 2000,
    },
    image:{
        type: String,
    },
}, {timestamps: true});

//COMPOUND INDEXES: These indexes are created on the combination of senderId and receiverId fields. They allow for efficient querying of messages based on both the sender and receiver, which is a common pattern when retrieving chat messages between two users. By indexing these fields together, MongoDB can quickly locate relevant messages without having to scan the entire collection, improving query performance for chat-related operations.
//This index will optimize queries that filter messages based on both the sender and receiver, which is a common pattern when retrieving chat messages between two users. By indexing these fields together, MongoDB can quickly locate relevant messages without having to scan the entire collection, improving query performance for chat-related operations.
messageSchema.index({senderId: 1, receiverId: 1,createdAt: -1}); 
messageSchema.index({receiverId: 1, senderId: 1, createdAt: -1}); 

const Message = mongoose.model("Message",messageSchema);
export default Message;