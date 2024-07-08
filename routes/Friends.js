import express from 'express'
const router  = express.Router()
import { User } from '../models/User.js';
import { WatingList } from '../models/WatingList.js';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();


const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.json("The token is missing");
    } else {
      jwt.verify(token, process.env.KEY, (err, decoded) => {
        if (err) {
          return res.json("The token is wrong");
        } else {
          req.email = decoded.email;
          req.username = decoded.username;
          req.id = decoded.id;
          next();
        }
      });
    }
  };
 


// for sending friend request

router.post('/', async(req, res) => {
    const newRequest = new WatingList({
        SenderId: req.body.senderId,
        FriendId: req.body.friendId,
        Sender: req.body.sender,
        Friend: req.body.friend,
        Spic: req.body.sPic,
        Fpic: req.body.fPic

        
    })
    try {
        const result = await newRequest.save();
        res.status(200).json(result);
        
    } catch (error) {
        res.status(500).json(error);
        
    }
});

// for accepting friend request

router.put('/f', async(req, res) => {
    
    try {
        await User.findByIdAndUpdate({_id: req.body.sId},{
            $addToSet: {friends: {friend: req.body.friend, friendId: req.body.fId, pic:req.body.fPic, created: Date.now()}}
          }, {new: true})
        await User.findByIdAndUpdate({_id: req.body.fId},{
            $addToSet: {friends: {friend: req.body.sender, friendId: req.body.sId, pic:req.body.sPic, created: Date.now()}}
          }, {new: true})  
        await WatingList.findByIdAndDelete({_id: req.body.rId})
        res.json("Success");        
    } catch (error) {
        res.status(500).json(error);
        
    }
});

// for rejecting friend request
router.put('/r', async(req, res) => {
    
    try {
       
        await WatingList.findByIdAndDelete({_id: req.body.rId})
        res.json("Success");        
    } catch (error) {
        res.status(500).json(error);
        
    }
});




// for getting requests

router.get('/requests', verifyUser, async(req, res) => {
    const userId = req.id
    WatingList.find({FriendId: userId})
      .then((requests) => res.json(requests))
      .catch((err) => res.json(err));
})


//requests sent by user
router.get('/requestSent', verifyUser, async(req, res) => {
    const userId = req.id
    WatingList.find({SenderId: userId})
      .then((requests) => res.json(requests))
      .catch((err) => res.json(err));
})








export {router as Friends}