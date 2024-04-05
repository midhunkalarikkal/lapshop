const User = require('../models/userModel')

const isUserLoggedIn = async (req, res, next) => {
    try {
        if (req.session.user) {
            console.log("isUserLoggedIn middleware calling")
            const data = await User.findById(req.session.user._id).lean();
            console.log("User blocked status :", data.isblocked)
            console.log("req.session.NC :",req.session.userNC)
            if (data && !data.isblocked) {
                next();
            } else {
                req.session.user = ""
                req.session.userNC = ""
                res.render('user/login',{ message : "Your account is blocked." , type : "danger" , userDetails : ""});
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error.");
    }
};

module.exports = {
    isUserLoggedIn
};
