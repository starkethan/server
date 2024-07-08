import express from "express";
const router = express.Router();
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import multer from "multer";
import path from "path";
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

router.get("/", verifyUser, (req, res) => {
  return res.json({ email: req.email, username: req.username });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/posts");
  },
  limits: { fileSize: 10000000 }, // Set a limit on file size (10 MB)
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
router.post(
  "/create/:id",
  verifyUser,
  upload.single("file"),
  async (req, res) => {
    const post = await Post.create({
      description: req.body.description,
      file: req.file.filename,
      email: req.body.email,
      username: req.body.username,
      userId: req.body.userId,
    });
    await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          posts: {
            post: req.file.filename,
            caption: req.body.description,
            id: post._id,
          },
        },
      },
      { new: true }
    )
      .then((result) => res.json("Success"))
      .catch((err) => res.json(err));
  }
);

router.get("/getposts", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10; // Default limit of 5 posts per page
  const skip = Math.max(0, (page - 1) * limit) || 0; // Starting index (defaults to 0)

  Post.find()
    .limit(limit)
    .skip(skip)
    .then((posts) => res.json(posts))
    .catch((err) => res.json(err));
});



router.get("/getpost/:id", (req, res) => {
  Post.findById({ _id: req.params.id })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

router.put("/deletepost/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete({ _id: req.params.id });
    await User.findByIdAndUpdate(
      { _id: req.body.userId },
      {
        $pull: { posts: { post: req.body.file, caption: req.body.caption } },
      },
      { new: true }
    );
    await User.findByIdAndUpdate(
      { _id: req.body.userId },
      {
        $pull: { likes: { id: req.params.id } },
      },
      { new: true }
    );

    res.json("Success");
  } catch (error) {
    console.log(error);
  }
});

router.put("/like/:id", verifyUser, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $addToSet: { like: { username: req.username, email: req.email } },
      },
      { new: true }
    );
    const currentUserId = req.id;
    const userId = req.body.userId;
    if (userId !== currentUserId) {
      await User.findByIdAndUpdate(
        { _id: req.body.userId },
        {
          $addToSet: {
            likes: {
              username: req.username,
              email: req.email,
              id: req.params.id,
            },
          },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(
        { _id: req.body.userId },
        {
          $addToSet: {
            notifications: {
              username: req.username,
              email: req.email,
              id: req.params.id,
              notification: "liked your post",
            },
          },
        },
        { new: true }
      );
    }
    res.json("Success");
  } catch (error) {
    console.log(error);
  }
});

router.put("/unlike/:id", verifyUser, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $pull: { like: { username: req.username, email: req.email } },
      },
      { new: true }
    );
    await User.findByIdAndUpdate(
      { _id: req.body.userId },
      {
        $pull: {
          likes: {
            username: req.username,
            email: req.email,
            id: req.params.id,
          },
        },
      },
      { new: true }
    );
    await User.findByIdAndUpdate(
      { _id: req.body.userId },
      {
        $pull: {
          notifications: {
            username: req.username,
            email: req.email,
            id: req.params.id,
          },
        },
      },
      { new: true }
    );

    res.json("Success");
  } catch (error) {
    console.log(error);
  }
});

router.put("/comments/:id", verifyUser, async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          comment: {
            comment: req.body.comment,
            created: Date.now(),
            username: req.username,
            email: req.email,
            pic: req.body.pic,
          },
        },
      },
      { new: true }
    );
    const currentUserId = req.id;
    const userId = req.body.userId;
    if (userId !== currentUserId) {
      await User.findByIdAndUpdate(
        { _id: req.body.userId },
        {
          $push: {
            notifications: {
              created: Date.now(),
              username: req.username,
              email: req.email,
              notification: "commented on your post",
              id: req.params.id,
            },
          },
        },
        { new: true }
      );
    }
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

router.put("/deletecomment/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $pull: { comment: { _id: req.body.comment } },
      },
      { new: true }
    );
    res.json(post);
  } catch (error) {
    console.log(error);
  }
});

export { router as post };
