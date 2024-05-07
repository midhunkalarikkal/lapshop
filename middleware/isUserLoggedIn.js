const User = require('../models/userModel')

const isUserLoggedIn = async (req, res, next) => {
    try {
        if(req.session && req.session.user){
            User.findById({_id :req.session.user._id}).lean()
            .then((data)=>{
                if(!data.isblocked){
                    console.log("user is not blocked")
                    next()
                }else{
                    console.log("user is blocked")
                    // let userDetails = ""
                    // return res.render('user/login',{message : "Your account is blocked, please contact us.", type : "danger", userDetails})
                    res.redirect('/login')
                    // const message = "Your account is blocked, please contact us";
                    // const type = "danger";
                    // return res.redirect(`/login?message=${encodeURIComponent(message)}&type=${type}`)
                }
            })
        }else{
            return res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error.");
    }
};

const isUserLogout = async(req,res,next)=>{
    try {
        if(req.session.user){
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
