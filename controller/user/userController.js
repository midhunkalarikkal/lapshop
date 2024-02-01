require('dotenv').config()
const User = require('../../models/userModel')

const getLogin = async(req,res)=>{
    try{
        res.render('user/login',{title : "LapShop login"})
    }catch(error){
        console.log(error)
    }
}

const getRegister = async(req,res)=>{
    try{
        res.render('user/registration',{title : "LapShop Register"})
    }catch(error){
        console.log(error)
    }
}

const postRegister = async(req,res)=>{
    try{
        const user = new User({
            fullname:req.body.fullname,
            email:req.body.email,
            phone:req.body.phone,
            password:req.body.password,
            isblocked:0,
        })

        const userData = await user.save();

        if(userData){
            res.render("user/login",{title : "LapShop login"})
            console.log("User added succesfully")
        }else{
            res.render("user/registration",{title : "LapShop register"})
            console.log("User is not added")
        }
    }catch(error){
        console.log(error.message)
    }
}

const getOtp = async(req,res)=>{
    try{
        res.render('user/otpvalidation',{title : "LapShop otp"})
    }catch(error){
        console.log(error)
    }
}

module.exports = {
    getLogin,
    getRegister,
    postRegister,
    getOtp,
}