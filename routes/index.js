const express = require('express');
const router = express.Router();
const passport =require("passport")

router.get('/',(req,res,next)=>{
    if(req.isAuthenticated()==true){
        res.render("index",{
            layout: 'login-layout'
        })
    }
    else{
        res.render("index")
    }
})

router.get('/about',(req,res,next)=>{
    if(req.isAuthenticated()==true){
        res.render("about",{
            layout: 'login-layout'
        })
    }
    else{
        res.render("about")
    }
})

module.exports = router;