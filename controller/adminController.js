const User = require('../models/userModel')

const getadminlogin = async (req, res) => {
    try {
        return res.render("admin/adminlogin", { title: "Lapshop admin", type: "", message: "" })
    } catch (error) {
        console.log(error.message)
    }
}

const postadminlogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(req.body)
        const adminData = {
          email : "admin@gmail.com",
          password: "admin123"
        }; 
        if(email==adminData.email && password==adminData.password){
            req.session.adminData = adminData
            return res.render('admin/adminhome',{title : "LapShop Admin"});
        }else{
            return res.render("admin/adminlogin", { title: "Lapshop admin", type: "danger", message: "Invalid credentials" })
        }
      } catch (error) {
        console.log(error.message)
      }
    }

    const getAdminHome = async(req,res)=>{
        try{
            if(req.session.adminData){
                return res.render("admin/adminhome",{title : "LapShop Admin"})
            }else{
                res.redirect('/admin')
            }
        }catch(error){
            console.log(error.message)
        }
    }

    const getadminLogout = async(req,res)=>{
        try{
            req.session.adminData = false
            res.render('admin/adminlogin',{title : "Lapdhop Admin", type : "success" , message : "Logout successfully"})
        }catch(error){
            console.log(error.message)
        }
    }

    const getadminusers = async(req,res)=>{
        try{
            if(req.session.adminData){
                const userData = await User.find();       
                    return res.render('admin/adminuserslist',{title : "LapShop Admin",type : "", message : "", users : userData})
            }else{
                res.redirect('/admin')
            }
        }catch(error){
            console.log(error.message)
        }
    }

    const adminblockuser = async(req,res)=>{
        try{
            let user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isblocked = req.body.blockStatus === 'block';
        await user.save();
        res.json({ success: true });            
        }catch(error){
            console.log(error.message)
        }
    }



module.exports = {
    getadminlogin,
    postadminlogin,
    getAdminHome,
    getadminLogout,
    getadminusers,
    adminblockuser
}