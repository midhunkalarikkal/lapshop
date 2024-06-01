const User = require('../models/userModel')

const isLoggedIn = async (req, res, next) => {
    try {
        if (req.session && req.session.user) {
            next();
        } else {
            const message = "Your account is blocked, Please contact us"
            const type = "danger"
            res.redirect(`/login?message=${encodeURIComponent(message)}&type=${type}`);
        }
    } catch (error) {
        return res.redirect('errorPage')
    }
};


const isBlocked = async (req, res, next) => {
    try {
        if (req.session && req.session.user) {
            const user = await User.findById({ _id: req.session.user._id }).lean();
            if (user.isblocked) {
                console.log("user blocked: ", user.isblocked);
                console.log("rendering login page");
                const message = "Your account is blocked, Please contact us"
                const type = "danger"
                req.session.user = null
                req.session.userNC = null
                res.redirect(`/login?message=${encodeURIComponent(message)}&type=${type}`);
            } else {
                next();
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        return res.redirect('/errorPage')
    }
};

module.exports = {
    isLoggedIn,
    isBlocked
};
