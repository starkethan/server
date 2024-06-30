import express from 'express'
const router = express.Router();
import { User } from '../models/User.js'
import nodemailer from 'nodemailer'
router.post('/', async (req, res) => {
    const {username, reason, sender, email, postUrl, comment} = req.body;
    try {
        const user = await User.findOne({email})
        if(!user) {
            return res.json({message: "user not registered"})
        }


        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.MAIL,
              pass: process.env.PASS
            }
          });
          
          var mailOptions = {
            from: process.env.MAIL,
            to: process.env.MAIL1,
            subject: 'Report',
            text: `From:  ${sender}
Email:  ${email}
Post:  ${postUrl}
Post Username:  ${username}
Reason:  ${reason}
Comment: ${comment}
`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              return rs.json({message: "error sending email"})
            } else {
                return res.json({status: true, message: "email sent"})
            }
          });

    }catch(err) {
        console.log(err)
    }
})
export {router as Report}