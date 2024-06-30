import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    website: { type: String},
    bio: { type: String},
    birthday: { type: String},
    gender: { type: String},
    pic: {type:String},
    posts: [
        {
         post: String,
         caption: String,
         id: { type: mongoose.Schema.Types.ObjectId, ref: "posts"},  
        }
    ],
    likes: [
        {
            username: String,
            email: String,
            id: String,
        }
    ],
    chats: [
        {
         chat: String,
         created: {type: Date, defualt: Date.now},
        }
    ],
    friends: [
        {
         friend: String,
         friendId: String,
         pic: String,
         created: {type: Date, defualt: Date.now},
        }
    ],



    notifications: [
        {
            username: String,
            email: String,
            id: String,
            notification: String,
            createdAt: {
                type: Date,
                default: Date.now,
              }
        }
    ],
    status: [
    { 
            statusId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Story"},
            createdAt: {
                type: Date,
                default: Date.now,
              }
 }
 

    ]
},
{
    timestamps: true

}

)



const UserModel = mongoose.model("User", UserSchema)

export {UserModel as User}