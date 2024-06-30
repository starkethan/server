import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({


    chatId: {
        type: String,
    },
    senderId: {
        type: String,
    },
    text: {
        type: String,
    }, 
    file: {
        type: String,
    },
    caption: {
        type: String,
        default: ""
    }
},
{
timestamps: true
})

const MessageModel = mongoose.model('Message', MessageSchema)

export {MessageModel as Message}