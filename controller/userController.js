require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const nodemailer = require('nodemailer')
const crypto = require("crypto")
const bodyParser = require('body-parser');
const path = require('path')
const fs = require('fs')
const session = require('express-session')
const express = require('express')
const app = express()

app.use(session({
    secret: 'userkey',
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: true }));

//for storing otp
let saveOtp;
let enteredFullname;
let enteredEmail;
let enteredPhone;
let enteredPassword;
let userDetails;

//Generating otp function
const generateOtp = () => {
    const crypto = require('crypto');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = "";
    for (let i = 0; i < 6; i++) {
        const index = crypto.randomInt(0, chars.length);
        otp += chars[index];
    }
    console.log(otp)
    return otp;
}

//Send otp through email
const sendOtpMail = async(email,otp)=>{
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "lapshopotp@gmail.com",
                pass: "nyxnnbafpfqznvvh",
            },
      });
      const mailOptions= {
        from: 'lapshopotp@gmail.com',
        to: email,
        subject: "OTP for register in LapShop Ecommerce",
        html:'<p>Hi, Your One Time Password to Login is '+ otp +'</p>'
      }

      transporter.sendMail(mailOptions,function(error,info){
        if(error){
          console.log(error);
        }
        else{
          console.log("Email has been sent: ",info.response);
        }
      })       
    } catch (error) {
      res.status(500).send('Error sending Otp password');
    }
  }

//Sending the register data to otp validation page
const postRegister = async (req, res) => {
    try {
        const otp = generateOtp()
        saveOtp = otp;
        console.log("SaveOtp before =",saveOtp)
        
        function clearSaveOtp() {
            saveOtp = ""; 
            console.log("SaveOtp after =",saveOtp)
        }
        setTimeout(clearSaveOtp, 30000);

        enteredFullname = req.body.fullname;
        enteredEmail = req.body.email;
        enteredPhone = req.body.phone;
        enteredPassword = req.body.password;

        const userEmail =  await User.findOne({email:enteredEmail}); 

        if (!userEmail){
            sendOtpMail(enteredEmail,otp);
            return res.render('user/otpvalidation', { type: "success", message: "Check your email for otp", userDetails})
        } else {
            return res.render('user/registration', { type: "danger", message: "Email already registered.", userDetails})
        }
    } catch (error) {
        console.log(error.message)
        return res.render("user/registration", { type: "danger", message: error.message, userDetails});
    }
}

// Verifying the otp and saving the user in db
const postRegisterOtp = async (req, res) => {
    try {
        const enteredOtp = req.body
        const otp1 = enteredOtp.otp;
        const otp2 = enteredOtp.otp2;
        const otp3 = enteredOtp.otp3;
        const otp4 = enteredOtp.otp4;
        const otp5 = enteredOtp.otp5;
        const otp6 = enteredOtp.otp6;
        const concatenatedOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
        console.log(concatenatedOTP)

        
        if(concatenatedOTP === saveOtp){

            const hashpassword = await bcrypt.hash(enteredPassword, 10)

            const user = new User({
                fullname : enteredFullname,
                email : enteredEmail,
                phone : enteredPhone,
                password : hashpassword
            })

            const userEmail = await User.findOne({email : enteredEmail})
            const userPhone = await User.findOne({phone : enteredPhone})

            if(!userEmail && !userPhone){
                const userData = await user.save()
                if(userData){
                    res.render('user/login',{type : "success" , message : "Registration has been successfull.", userDetails})
                }else{
                    res.render('user/registration',{type : "danger" , message : "Registration has been failed.", userDetails})
                }
            }else{
                res.render('user/registration',{type : "danger" , message : "User already exist.", userDetails})
              }   
            }else{
              res.render("user/otpvalidation",{type : "danger" , message : "Invalid OTP", userDetails});
            }
        
    } catch (error) {
        console.log("postRegisterotp error")
        console.log(error.message)
    }
}

//Checking the email and password for user from login page
const postLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        const { email, password } = req.body;

        if (user) {
            if (user.isblocked) {
                return res.render("user/login", { type: "danger", message: "Account is blocked, please contact us", userDetails})
            }
            
            //password matching
            bcrypt.compare(password, user.password, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).send('An error occurred while comparing the passwords.');
                } if (result) {
                        req.session.user = user;
                        userDetails = req.session.user
                        console.log(userDetails)
                        return res.render('user/home',{userDetails})
                } else {
                    // Passwords don't match    
                    return res.render("user/login", {type: "danger", message: "Incorrect password", userDetails})
                }
            });
        } else {
            return res.render("user/login", { type: "danger", message: "No user found", userDetails})
        }
    } catch (error) {
        console.log(error.message)
    }
}

// To get the user login page
const getLogin = async (req, res) => {
    try {
        return res.render('user/login', {type: "", message: "", userDetails})
    } catch (error) {
        console.log(error)
    }
}


//To get the user logout function
const getLogout = async(req,res)=>{
    try{
        req.session.user = null 
        userDetails = ""
        res.redirect('/')
    }catch(error){
        console.log(error.message)
    }
}


//To get the user home
const getHome = async (req, res) => {
    try {
        return res.render('user/home',{userDetails})
    } catch (error) {
        console.log(error)
    }
}

//To get the user register page
const getRegister = async (req, res) => {
    try {
        res.render('user/registration', { type: "", message: "" , userDetails})
    } catch (error) {
        console.log(error)
    }
}

//To get the user otp page
const getotppage = async(req,res)=>{
    try{
        res.render('user/otpvalidation',{type : "", message : "" , userDetails})
    }catch(error){
        console.log(error.message)
    }
}


// For resending the otp
const resendOtp = async(req,res)=>{
    try{
        const otp = generateOtp()
        saveOtp = otp;
        sendOtpMail(enteredEmail,otp);
        function clearSaveOtp() {
            saveOtp = ""; 
            console.log("SaveOtp after resend =",saveOtp)
        }
        setTimeout(clearSaveOtp, 30000);
    }catch(error){
        console.log(error.message)
    }
}

//To get the user profile page
const getUserProfile = async(req,res)=>{
    try{
        const userId = req.session?.user?._id
        const userData = await User.findById(userId)
        const createdDate = new Date(userData.created);
        const formattedDate = createdDate.toISOString().split('T')[0];
        res.render('user/profile',{userData, formattedDate , userDetails})
    }catch(error){
        console.log(error.message)
        res.status(500).json({ message : "Internal server error"})
    }
}

// To update the user information
const postUserUpdatedInfo = async(req,res)=>{
    try{
        const { userName, phone, userId } = req.body;

        const updateUser = await User.findByIdAndUpdate(userId, { fullname: userName, phone: phone },
            { new: true } );
        
        if (!updateUser) {
            return res.status(404).json({ message: "User not found" });
        } else {
            return res.status(200).json({ message: "User updated successfully", user: updateUser });
        }

    }catch(error){
        console.log(error.message)
        res.status(500).json({ message : "Internal server error "})
    }
}

//To upload profile image
const postUserProfileImage = async(req,res)=>{
    try{
        const userId = req.body.userId
        const user = await User.findById(userId)

        if(user.profileimage){
            existingimage = user.profileimage
            console.log(user.profileimage)
            const imagePath = path.join(__dirname, "../public/images/UserProfile", existingimage);
            fs.unlinkSync(imagePath);
        }

        if(!req.file){
            res.status(400).json({ message : "Image is not uploaded correctly"})
        }

        const updateUserImage = await User.findByIdAndUpdate(userId, {profileimage : req.file.filename})
        if (updateUserImage) {
            return res.status(200).json({ message: "Profile image uploaded successfully" });
        } else {
            return res.status(500).json({ message: "Failed to update profile image" });
        }
        
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error"})
    }
}

//To get the shop page
const getUserShop = async(re,res)=>{
    try{
        const productData = await Product.find()
        res.render('user/shop',{productData , userDetails})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error"})
    }
}





module.exports = {
    getHome,
    getLogin,
    getLogout,
    getRegister,
    postRegister,
    postRegisterOtp,
    postLogin,
    getotppage,
    resendOtp,
    getUserProfile,
    postUserUpdatedInfo,
    postUserProfileImage,
    getUserShop
}

