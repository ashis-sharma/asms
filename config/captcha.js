const express = require('express');
const session = require('express-session');
const expressCaptcha = require('express-svg-captcha');

const app = express();
const captcha = new expressCaptcha({
  isMath: false,
  useFont: null,
  size: 6,
  ignoreChars: '0o1i',
  noise: 3,
  color: true,
  background: null,
  width: 150,
  height: 50,
  fontSize: 56,
  charPreset: null,
})
app.use(session({
  secret: 'your secret',
  resave: false,
  saveUninitialized: true,
}))
app.get('/captcha', captcha.generate())

module.exports= {
  captchaValidation:(req,res,next)=>{
    if(captcha.validate(req, req.body.captcha)==false){
      req.flash('error_msg','Captcha Incorrect')
      res.redirect('back')
      return false;
    }
    if(!captcha){
      req.flash('error_msg','Captcha Not Filled')
      res.redirect('back')
      return false;
    }
    else{
      return next()
    }

  }

}

