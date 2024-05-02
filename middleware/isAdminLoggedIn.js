const isAdminLoggedIn = async (req, res, next) => {
    try {
        if(req.session && req.session.adminData){
            next()
        }else{
            console.log("admin session  empty")
            return res.redirect('/admin/')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error.");
    }
};



module.exports = {
    isAdminLoggedIn
};
