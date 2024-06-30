import express from 'express'
const router = express.Router();
import { User } from '../models/User.js'
import nodemailer from 'nodemailer'
router.post('/contactus', async (req, res) => {
    const {name, email, message} = req.body;
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
            subject: 'Contact Us',
            text: `From:  ${name}
Email:  ${email} 
Message:  ${message}`
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
export {router as UserForm}