const User = require('../models/userModel')

const isUserLoggedIn = async (req, res, next) => {
    try {
        if (!req.session.user || req.session.user == undefined || req.session.user == "") {
            console.log("isUserLoggedIn middleware calling , req.session.user not is there")
            return res.redirect('/login')
        }

        const data = await User.findById(req.session.user._id).lean();
        if (data && !data.isblocked) {
            next();
        } else {
            console.log("user is blocked")
            const message = "Your account is blocked, please contact us";
            const type = "danger";
            req.session.user = "";
            req.session.userNC = "";
            return res.redirect(`/login?message=${encodeURIComponent(message)}&type=${type}`)
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error.");
    }
};



module.exports = {
    isUserLoggedIn
};
