import express from 'express'
const router  = express.Router()
import { Chat } from '../models/Chat.js';
import { User } from '../models/User.js';



router.post('/', async(req, res) => {
    const newChat = new Chat({
        members: [req.body.senderId, req.body.receiverId]
    })
    try {
        const result = await newChat.save();
        await User.findByIdAndUpdate({_id: req.body.senderId},{
            $addToSet: {chats: {chat: req.body.receiverId, created: Date.now()}}
          }, {new: true})
        await User.findByIdAndUpdate({_id: req.body.receiverId},{
            $addToSet: {chats: {chat: req.body.senderId, created: Date.now()}}
          }, {new: true})
        console.log(result)
        res.status(200).json(result);
        
    } catch (error) {
        res.status(500).json(error);
        
    }
});


router.get('/:userId', async(req, res) => {
    try {
        const chat = await Chat.find({
            members: {$in: [req.params.userId]}
        })

        res.status(200).json(chat)
        
    } catch (error) {
        res.status(500).json(error);
        
    }
})


router.get('/find/:firstId/:secondId', async(req, res) => {
    try {

    const chat = await Chat.findOne({
        members: {$all: [req.params.firstId, req.params.secondId]}
    })
    res.status(200).json(chat)
        
    } catch (error) {
        
        res.status(500).json(error)
    }
})


export {router as ChatRoute}