module.exports= {
    ensureAuthenticated:(req,res,next)=>{
        if(req.isAuthenticated()){
            return next()
        }
        req.flash('error_msg','Please log in to view this page')
        res.redirect('/users/login')
    },
    notAuthenticated:(req,res,next)=>{
        if(!req.isAuthenticated()){
            return next()
        }
        req.flash('error_msg','You are already logged in')
        res.redirect('/users/dashboard')
    }
}