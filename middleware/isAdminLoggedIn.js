const isAdminLoggedIn = async (req, res, next) => {
    try {
        if(req.session.adminData){
            console.log("admin Data : ",req.session.adminData)
            return next()
        }else{
            console.log("admin session  empty")
            return res.redirect('/admin/')
        }
    } catch (error) {
        console.log(error);
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
