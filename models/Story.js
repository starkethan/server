import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({



  stories: [{
     story: String,
     userId: String,
     username: String, 
     profile: String,
      createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400
    }
    
  }]
     
});

const StoryModel = mongoose.model("Story", StorySchema)

export {StoryModel as Story}