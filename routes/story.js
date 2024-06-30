import express from 'express'
const router = express.Router();
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
dotenv.config();
import { Story } from '../models/Story.js'
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';

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
        next();
      }
    });
  }
};

router.get("/", verifyUser, (req, res) => {
  return res.json({ email: req.email, username: req.username });
});

const storage = multer.diskStorage({
  destination: (req, story, cb) => {
    cb(null, "public/stories");
  },
  filename: (req, story, cb) => {
    cb(
      null,
      story.fieldname + "_" + uuidv4() + path.extname(story.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limit: { fileSize: 1000000 * 25 }
});

router.post("/s", verifyUser,
upload.array("story", 12), async(req, res) => {
  try {
    const uploadedFiles = new Set();
    await Promise.all(req.files.map(async (file) => {
    uploadedFiles.add(file.filename);
    }));
 
    const storyData = [];
    for (const filename of uploadedFiles) {
      storyData.push({ story: filename, userId: req.body.userId, username: req.body.username, profile: req.body.profile });
    }
    const newStory = await Story.create({
      stories: storyData,
    });
    await User.findByIdAndUpdate(
      { _id: req.body.userId },
      {
        $addToSet: { status: { statusId: newStory._id, createdAt: Date.now() } },
      },
      { new: true });

    res.json("Success");
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong ', error: e });
  }
});

router.get("/getstory", (req, res) => {
  Story.find()
    .then(stories => res.json(stories))
    .catch(err => res.json(err))
})

router.put("/delete", async(req, res) => {
    try {
     await User.findByIdAndUpdate(

      { _id: req.body.userId },
    {
      $unset: { status: "" },
    },
    { new: true });
    res.json("Success")
 
    } catch (error) {
      console.log(error);
      
    }
  })



  // const currentTime = new Date(Date.now()-24*60*60*1000);
  // const t = Date.now()-24*60*60*1000
  // console.log(t);
  // console.log(t-24*60*60*1000)

  // console.log(currentTime);
  // console.log(currentTime.toString());
  // console.log(24*60*60*1000);



const threshold = Date.now() - 24 * 60 * 60 * 1000;

async function findUsers() {
  const users = await User.find({
    status: { $elemMatch: { createdAt: { $lt: threshold } } }
  });

  // Filter users with statuses older than 24 hours
  const usersToDeleteStatuses = users.filter(user => user.status.length > 0);

  // Update users with filtered statuses
  const updatePromises = usersToDeleteStatuses.map(user => {
    user.status = user.status.filter(status => status.createdAt.getTime() >= threshold);
    return user.save(); 
  });

  await Promise.all(updatePromises); 
}

findUsers();
const intervalId = setInterval(findUsers, 5* 60 * 1000);

 
export {router as Story}