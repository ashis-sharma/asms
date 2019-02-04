const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')
const nodemailer = require("nodemailer");
const {ensureAuthenticated,notAuthenticated} = require('../config/auth');
const messagebird = require('messagebird')('QTgXWB8P2hYnz35orAhR6LTUW');
const User = require('../model/User');
const otpGenerator = require('otp-generator');
const {captchaValidation} = require('../config/captcha');
const credentials = require('../config/email');

var e_otp;

var transporter = nodemailer.createTransport({
    service:'Gmail',
  auth: {
    user: credentials.id,
    pass: credentials.password
  }
});
router.get('/login',notAuthenticated,(req,res)=>{
        res.render('login')
})
router.get('/registration',notAuthenticated,(req,res)=>{
        res.render('registration')
})

router.get('/dashboard',ensureAuthenticated,(req,res,next)=>{
    res.render('dashboard',{
        layout: 'login-layout',
        name:req.user.name,
        sendMessge:req.user.smsSent,
        sendEmail:req.user.emailSent
    })
})
router.get('/message',ensureAuthenticated,(req,res)=>{
    res.render('messages',{ 
        layout: 'login-layout' 
    });
})
router.get('/email',ensureAuthenticated,(req,res)=>{
    res.render('email',{ 
        layout: 'login-layout' 
    });
})
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','You are logged out')
    res.redirect('/users/login')
})
router.get('/termsandcondition',(req,res)=>{
    res.render('terms');
})

router.get('/forgotpassword',notAuthenticated,(req,res)=>{
        res.render('forgotpassword')
})

router.post('/mobileotp',(req,res)=>{
    m_otp = otpGenerator.generate(6,{ upperCase: false, specialChars: false,alphabets: false});
    var params = {
        'originator': 'MessageBird',
        'recipients': [`+91${req.body.number}`],
        'body': `Hey ${req.body.reciepent_name} please use this to One Time Password to verify your Phone No ${m_otp}`
      };
      
      messagebird.messages.create(params, function (err, response) {
        if (err) {
          req.flash('error_msg','Some Error Occured')
          res.redirect('back')
          return console.log(err);
        }
        req.flash('success_msg','Message Send Successful')
        console.log(response)
      });
})
router.post('/emailotp',(req,res)=>{
    e_otp = otpGenerator.generate(6,{ upperCase: false, specialChars: false,alphabets: false});
        var mailOptions = {
            from: 'ASMS',
            to: req.body.reciepent,
            subject: 'Email Verification OTP',
            text: `Hey ${req.body.reciepent_name} please use this to One Time Password to verify your Email ID ${e_otp}`,
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              req.flash('error_msg','Some Error Occured')
              console.log(error);
              res.redirect('back')
            } else {
              console.log('Email sent: ' + info.response);
              module.exports = m_otp
              res.redirect('back')
            }
          });
    })
router.post('/registration',captchaValidation,(req,res)=>{
    const {name ,email,phone,password,password2,checkbox,email_otp} = req.body;
    let errors=[];
    if(!name || !email || !phone || !password || !password2 || !email_otp){
        errors.push({msg:"Enter all fields"});
    }
    if(!email_otp){
        errors.push({msg:"Please Confirm Email OTP"});
    }
    if(email_otp!=e_otp){
        errors.push({msg:"Email OTP either Incorrect or Not Entered"});
    }
    if(checkbox){
        errors.push({msg:"Accept Terms and Condition"});
    }
    if(password != password2){
        errors.push({msg:"Password and Confirm password dosn't match"})
    }
    if(password.length < 6){
        errors.push({msg:"Password length should be atleast 6 characters"})
    }
    if(errors.length > 0){
        res.render('registration',{
            errors,
            name,
            email,
            phone,
            password,
            password2
        })
    }
    else{
        User.findOne({email:email})
        .then(user => {
            if(user){
            errors.push({msg:"Email is already registered"})
            res.render('back',{
                errors,
                name,
                email,
                phone,
                password,
                password2
                })
            }
            else{
                const newUser = new User ({
                    name,
                    email,
                    phone,
                    password,
                })
                bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(newUser.password,salt,(err,hash)=>{
                    if(err) throw err;
                    newUser.password =hash;
                    newUser.save()
                    req.flash('success_msg','You are now Registered')
                    res.redirect('/users/login')
                }))
           }
        })
    }
})

router.post('/forgotpassword',captchaValidation,(req,res)=>{
    let newPassword= otpGenerator.generate(8, { upperCase: false, specialChars: false,alphabets: false });
    User.findOne({email:req.body.forgot_email})
    .then(user =>{
        if(user){
            bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(newPassword,salt,(err,hash)=>{
                if(err) throw err;
                user.password =hash;
                user.save()
                .then(user =>{
                    
                    var mailOptions = {
                      from: 'ASMS',
                      to: user.email,
                      subject: 'New Password for your Forgot Password Request',
                      text: `Hey ${user.name} your new password is  ${newPassword} from ASMS`,
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          req.flash('error_msg','Some Error Occured')
                          console.log(error);
                          res.redirect('back')
                        } else {
                          req.flash('success_msg','Your new Password has been Send to Email Successful use the new password to login')
                          res.redirect('/users/login')                   
                        }
                      });
                })
                .catch(err => console.log(err))
            }))
        }
        else{
            req.flash('error_msg','Your Email is not Found')
            res.redirect('back')
        }
    })
    .catch((err)=>{
        console.log(err)
    })
})

router.post('/newpassword',(req,res)=>{
    const {newPassword,newConfirmPassword}= req.body;
    if(newPassword != newConfirmPassword){
        errors.push({msg:"Password and Confirm password dosn't match"})
    }
    else{
        bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(newPassword,salt,(err,newhash)=>{
            if(err) throw err;
            else{
                User.findOne({email:returned}).exec((err,result)=>{
                    if(err) throw err;
                    if(result){
                        result.password=newPassword;
                        result.save();
                    }
                })
            }
        }))
    }
})
router.post('/login',captchaValidation,(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/users/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true
        })(req,res,next);
})
router.post('/message',captchaValidation,(req,res,next)=>{
    const {to,text} = req.body;
    var params = {
        'originator': 'MessageBird',
        'recipients': [`+91${to}`],
        'body': text
      };
      
      messagebird.messages.create(params, function (err, response) {
        if (err) {
          req.flash('error_msg','Some Error Occured')
          res.redirect('back')
          return console.log(err);
        }
        User.findOne({email:req.user.email}).exec((err,result)=>{
            if(err) throw err;
            if(result){
                result.smsSent++;
                result.save();
            }
        })
        req.flash('success_msg','Message Send Successful')
        console.log(response);
        res.redirect('back')
      });
})
router.post('/email',captchaValidation,(req,res)=>{
    const {to,subject,body}= req.body;
    var mailOptions = {
      from: 'ASMS',
      to: to,
      subject: subject,
      text: body,
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        req.flash('error_msg','Some Error Occured')
        console.log(error);
        res.redirect('back')
      } else {
        User.findOne({email:req.user.email}).exec((err,result)=>{
            if(err) throw err;
            if(result){
                result.emailSent++;
                result.save();
            }
        })
        req.flash('success_msg','Email Send Successful')
        console.log('Email sent: ' + info.response);
        res.redirect('back')
      }
    });
})

module.exports = router;