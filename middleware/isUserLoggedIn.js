const isUserLoggedIn = async (req, res, next) => {
    try {
        if (req.session.user) {
            next();
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const isUserLoggedOut = async (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error"); 
    }
};

module.exports = {
    isUserLoggedIn,
    isUserLoggedOut
};
