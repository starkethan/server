import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({

    members: {
        type: Array
    }
 
    // chatName: { type: String, trim:true },
    // isGroupChat: {type: Boolean, default: false },
    // users: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: User
    //     }
    // ],
    // latestMessage: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Message"
    // },
    // groupAdmin: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User"
    // }   
},
{
timestamps: true
})

const ChatModel = mongoose.model('Chat', ChatSchema)

export {ChatModel as Chat}