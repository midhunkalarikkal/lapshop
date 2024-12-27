const isAdminLoggedIn = async (req, res, next) => {
    try {
        if(req.session.adminData){
            return next()
        }else{
            return res.redirect(`/admin/`)
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
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
        return res.redirect('/admin/adminErrorPage')
    }
}

module.exports = {
    isAdminLoggedIn,
    isAdminLogout
};
