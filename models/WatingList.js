import mongoose from "mongoose";

const WatingListSchema = new mongoose.Schema({

    SenderId: {
        type: String,
    },
    FriendId: {
        type: String,
    },
    Sender: {
        type: String,
    },
    Friend: {
        type: String,
    },
    Spic: {
        type: String,
    },
    Fpic: {
        type: String,
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
      }
},
{
    timestamps: true

}
);

const WatingListModel = mongoose.model("WatingList", WatingListSchema)

export {WatingListModel as WatingList}