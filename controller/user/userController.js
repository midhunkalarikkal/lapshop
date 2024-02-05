require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../../models/userModel')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service : "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "lapshopotp@gmail.com",
      pass: "nyxnnbafpfqznvvh",
    // user : "blckchainmedicine@gmail.com",
    // pass : "shggbhblxfkmvbbo"
    },
  });

  const mailOptions = {
    from: 'lapshopotp@gmail.com', // sender address
    to: "midhunkalarikkalp@gmail.com", // list of receivers
    subject: "Hello ✔ from nodemailer", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  }

  const sendMail = async (transporter, mailOptions)=>{
    try{
        await transporter.sendMail(mailOptions)
        console.log("Email sended succesfullly")
    }catch(err){
        console.log(err)
    }
  }

  sendMail(transporter, mailOptions)

  const getHome = async(req,res)=>{
    try{
        res.render('user/home',{title : "LapShop home"})
    }catch(error){
        console.log(error)
    }
  }


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
        // for if the user is exist or not
        const existingUser = await User.findOne({email : req.body.email})
        if(existingUser){
            return res.render('user/registration',{title : "LapShop Register", type : "danger",message : "User already exists"})
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
            return res.render("user/otpvalidation",{title : "LapShop otp",type : "success",message : "An otp has been sent to your email"})
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
        res.render('user/otpvalidation',{title : "LapShop otp",type: " ",message : ""})
    }catch(error){
        console.log(error.message)
    }
}

const getNavbar = async(req,res)=>{
    try{
        res.render("user/test")
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
    getHome
}