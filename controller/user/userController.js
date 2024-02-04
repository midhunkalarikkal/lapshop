require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../../models/userModel')

const getLogin = async(req,res)=>{
    try{
        res.render('user/login',{title : "LapShop login",type : "",message : ""})
    }catch(error){
        console.log(error)
    }
}

const getRegister = async(req,res)=>{
    try{
        res.render('user/registration',{title : "LapShop Register",type : "",message : ""})
    }catch(error){
        console.log(error)
    }
}

const postRegister = async(req,res)=>{
    try{

        const existingUser = await User.findOne({email : req.body.email})
        if(existingUser){
            return res.render('user/registration',{title : "LapShop Register", type : "danger",message : "User already exists"})
        }

        if(req.body.password !== req.body.confirmpassword){
            return res.render('user/registration',{title : "LapShop Register",type : "danger", message : 'Password is not matching'})
        }

        const user = new User({
            fullname:req.body.fullname,
            email:req.body.email,
            phone:req.body.phone,
            password:req.body.password,
            isblocked:0,
        })

        const userData = await user.save();

        if(userData){
            console.log("User added succesfully")
            return res.render("user/login",{title : "LapShop login",type : "success",message : "Registered successfully"})
        }else{
            console.log("User is not added")
            return res.render("user/registration",{title : "LapShop register",type : "danger",message : error.message})
        }
    }catch(error){
        console.log(error.message)
        return res.render("user/registration", { title: "LapShop register", type: "danger", message: error.message });
    }
}

const getOtp = async(req,res)=>{
    try{
        res.render('user/otpvalidation',{title : "LapShop otp"})
    }catch(error){
        console.log(error.message)
    }
}

const getNavbar = async(req,res)=>{
    try{
        res.render("userpartials/Navbar")
    }catch(error){
        console.log(error.message)
    }
}

module.exports = {
    getLogin,
    getRegister,
    postRegister,
    getOtp,
    getNavbar,
}