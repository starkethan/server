import express from 'express'
import bcrypt from 'bcrypt'
const router = express.Router();
import { User } from '../models/User.js'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import multer from 'multer'
import path from 'path'




router.post('/signup', async (req, res) => {
    const {username, email, password} = req.body;
    const user = await User.findOne({username})
    const mail = await User.findOne({email})
    
    if(user || mail){
        return res.json({message: "User already exists"})
    }

    const hashpassword = await bcrypt.hash(password, 10)
    const newUser = new User ({
        username,
        email,
        password:hashpassword
      
    })

    await newUser.save()
    return res.json({status: true, message: "record registered"})
    
    
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})
    if (!user) {
        return res.json({message: "user is not registered"})
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if(!validPassword) {
        return res.json({message: "password is incorrect"})
    }
    
    const token = jwt.sign({email:user.email, username: user.username, id: user._id}, process.env.KEY, {expiresIn: '24h'})
    res.cookie('token', token, { httpOnly: true, maxAge:24*60*60*1000})
    return res.json({status: true, message: "login successfully"})
    

})

router.post('/forgot-password', async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email})
        if(!user) {
            return res.json({message: "user not registered"})
        }

    const token = jwt.sign({id: user._id}, process.env.KEY, {expiresIn: '5m'})

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.MAIL,
              pass: process.env.PASS
            }
          });
          
          var mailOptions = {
            from: process.env.MAIL,
            to: email,
            subject: 'Reset Password',
            text: ` Below is your Reset password link valid for 5 min
            
            http://localhost:3000/resetPassword/${token}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              return res.json({message: "error sending email"})
            } else {
                return res.json({status: true, message: "email sent"})
            }
          });

    }catch(err) {
        console.log(err)
    }
})
router.post('/reset-password/:token', async (req, res) => {
    const {token} = req.params;
    const {password} = req.body
    try {
        const decoded =  jwt.verify(token, process.env.KEY);
        const id = decoded.id;
        const hashpassword = await bcrypt.hash(password, 10)
        await User.findByIdAndUpdate({_id: id}, {password: hashpassword})
        return res.json({status: true, message: "Updated Password"})
    } catch (err) {
        return res.json("invalid token")
    }
});

const verifyUser = async (req, res, next) => {
    try {
    const token = req.cookies.token;
    if(!token) {
        return res.json({status: false, message: "no token"})
    }
    const decoded =  jwt.verify(token, process.env.KEY);
    next()
} catch (err) {
    return res.json(err);
}
}

router.get('/verify', verifyUser, (req, res) => {
    return res.json( {status: true, message: "authorized"})

});

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({status: true})
})



router.get('/getusers', async(req, res) => {
    User.find()
    .then(users => res.json(users))
    .catch(err => res.json(err))
})


router.get('/getuser', (req, res) => {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.json({status: false, message: "no token"})
        }
        const decoded = jwt.verify(token, process.env.KEY);
        const id = decoded.id
    
    User.findById(id)
         
        .then(users => res.json(users))
        .catch(err => res.json(err))
    } catch (err) {
        return res.json(err);
    }
    })
    const storage = multer.diskStorage({
        destination: (req, pic, cb) => {
          cb(null, "public/profile");
        },
        
        limits: { fileSize: 5000000 }, // Set a limit on file size (5 MB)

        filename: (req, pic, cb) => {
          cb(
            null,
            pic.fieldname + "_" + Date.now() + path.extname(pic.originalname)
          );
        },
      });
      
      const upload = multer({
        storage: storage,
      });


      router.put("/editphoto/:id", upload.single("pic"),  async(req, res) => {
        const id = req.params.id;
        try {
         await User.findByIdAndUpdate({
          _id: id}, {
          pic: req.file.filename,
                })
        return res.json("Success")
    } catch (err) {
        return res.json("invalid token")
    }
      });

      
      router.put("/editprofile/:id", async(req, res) => {
        const id = req.params.id;
    
        try {
         await User.findByIdAndUpdate({
          _id: id}, {
          website: req.body.website,
          bio: req.body.bio,
          birthday: req.body.birthday,
          gender: req.body.gender
                })
        return res.json("Success")
    } catch (err) {
        return res.json("invalid token")
    }
      });

      router.put("/removephoto/:id", async(req, res) =>{
        try {
        await User.findByIdAndUpdate({_id: req.params.id}, {
          $unset: {pic: ""}
         })
       res.json("Success");
        } catch (error) {
         console.log(error);
        }  
     })


     router.put("/remove/:id", async(req, res) =>{
        try {
        await User.findByIdAndUpdate({_id: req.params.id}, {
          $unset: {notifications: ""}
         })
       res.json("Success");
        } catch (error) {
         console.log(error);
        }  
     })






export {router as UserRouter}