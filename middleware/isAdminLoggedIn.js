const isAdminLoggedIn = async (req, res, next) => {
    try {
        if(req.session.adminData){
            return next()
        }else{
            return res.redirect('/admin/')
        }
    } catch (error) {
        res.status(500).send("Internal Server Error.");
    }
};

const isAdminLogout = async(req,res,next)=>{
    try {
        if(req.session.adminData){
            res.redirect('/admin/home')
        }else{
            next()
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    isAdminLoggedIn,
    isAdminLogout
};
