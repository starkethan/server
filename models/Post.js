import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    description: {type: String, required: true},
    file: {type: String, required: true},
    email: String,
    username: String,
    userId: String,
    
    like: [
        {
            username: {type: String},
            email: {type: String},
        }
    ],
    comment: [
        {
            comment: String, 
            created: {type: Date, defualt: Date.now},
            username: String,
            email: String,
        

        }
    ]
   
    
},
{
timestamps: true
})

const PostModel = mongoose.model('posts', PostSchema)

export {PostModel as Post}