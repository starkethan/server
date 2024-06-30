import express from 'express'
const router  = express.Router()
import { Message } from '../models/Message.js';
import multer from 'multer'
import path from 'path'

  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/message");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + "_" + Date.now() + path.extname(file.originalname)
      );
    },
  });
  
  const upload = multer({
    storage: storage,
  });
  
router.post('/file', upload.single("file"),  async(req, res) => {
       
        Message.create({
          chatId: req.body.chatId,
          senderId: req.body.senderId,
          file: req.file.filename,
          caption: req.body.caption
            
        })
        .then((result) => res.json("Success"))
        .catch((err) => res.json(err));
        
    }
)



router.post('/', async(req, res) => {
    const {chatId, senderId, text} = req.body
    
    const message = new Message ({
        chatId,
        senderId,
        text, 
        
    });
    
    try {
        const result = await message.save();
        res.status(200).json(result);
        
    } catch (error) {
        res.status(500).json(error)
        
    }
})


router.get('/:chatId', async(req, res) => {
    const {chatId} = req.params;

    try {
        const result = await Message.find({chatId});
        res.status(200).json(result);
        
    } catch (error) {
        res.status(500).json(error);
        
    }
})





export {router as MessageRoute}