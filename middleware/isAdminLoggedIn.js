const isAdminLoggedIn = async(req,res,next)=>{
    try{
        if(req.session && req.session.adminData){
            next()
        }else{
            res.redirect('/admin')
        }
    }catch(error){
        console.log(error.message)
    }
}

const isAdminLoggedOut = async(req,res,next)=>{
    try{
        if (req.session && req.session.adminData ) {
          res.redirect('/admin/home')
          } else {
          next()
          }

    }catch(error){
        console.log(error.message)
    }
}

module.exports = {
    isAdminLoggedIn , isAdminLoggedOut
}