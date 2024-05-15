const User = require('../models/userModel')

const isUserLoggedIn = async (req, res, next) => {
    try {
        if(req.session && req.session.user){
            User.findById({_id :req.session.user._id}).lean()
            .then((data)=>{
                if(data.isblocked == false){
                    console.log("req.session.user",req.session.user)
                    console.log("user is not blocked")
                    next()
                }else{
                    console.log("user blocked : ",data.isblocked)
                    console.log("rendering login page")
                    req.session.destroy()
                    res.redirect('/login')
                }
            })
        }else{
            console.log("no user in session and redirecting to login")
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error.");
    }
};

const isUserLogout = async(req,res,next)=>{
    try {
        if(req.session.user){
            console.log("user session is not null")
            res.redirect('/')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isUserLoggedIn,
    isUserLogout
};
