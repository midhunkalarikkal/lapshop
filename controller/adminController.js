

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
            req.session.admin = adminData;
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
            return res.render("admin/adminhome",{title : "LapShop Admin"})
        }catch(error){
            console.log(error.message)
        }
    }



module.exports = {
    getadminlogin,
    postadminlogin,
    getAdminHome
}