const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const expressCaptcha = require('express-svg-captcha');
const bodyParser = require('body-parser');


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

require('./config/passport')(passport)

const db= require('./config/keys').mongoURI;
mongoose.connect(db,{useNewUrlParser:true})
.then(()=> console.log('MongoDB Connected'))
.catch(err => console.log(err))


app.use(fileUpload());
app.use(expressLayouts);
app.set('view engine','ejs');
app.use(bodyParser.json());

app.use(express.urlencoded({extended:true}))
app.use('/public', express.static(__dirname + '/public' ));

app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash())

app.use(function(req,res,next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

app.use('/',require('./routes/index'))
app.use('/users',require('./routes/users'))
app.get('/captcha',captcha.generate())

app.use(function(req, res, next){
  res.status(404);

  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }
  res.type('txt').send('Not found');
});
const PORT = process.env.PORT || 3000;

app.listen(PORT,console.log(`Server Started on PORT ${PORT}`));