require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Address = require('../models/addressModel')
const Brand = require('../models/brandModel')
const Category = require('../models/categoryModel')
const HomeCarousel = require('../models/homeCarousel')
const AdCarousel = require('../models/adCarousel')
const nodemailer = require('nodemailer')
const crypto = require("crypto")
const bodyParser = require('body-parser');
const path = require('path')
const fs = require('fs')
const session = require('express-session')
const express = require('express')
const { error } = require('console')
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
        const homeCarousel = await HomeCarousel.find({ isBlocked: false });
        return res.render('user/home',{userDetails , homeCarousel})
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
        const address = await Address.find({userId : userId})
        console.log(address)
        const formattedDate = createdDate.toISOString().split('T')[0];
        res.render('user/profile',{userData, formattedDate , userDetails, address})
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
        const productData = await Product.find({ isBlocked: false });
        const adCarousel = await AdCarousel.find({ isBlocked: false });
        console.log(adCarousel)
        res.render('user/shop',{productData , userDetails , adCarousel})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error"})
    }
}

//To get the add address page
const getUserNewAddress = async(req,res)=>{
    try{
        const userId = req.params.userId
        console.log(userId)
        return res.render('user/addAddress',{userDetails , userId})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error"})
    }
}

//To add user address
const postUserAddress = async(req,res)=>{
    try{
        const { name, addressLine, phone, city, district, state, pincode, country} = req.body
        console.log("req.body : ",name, addressLine, phone, city, district, state, pincode, country)
        const userId = req.params.userId
        console.log(userId)

        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({ message : "User not found"})
        }
        
            const newAddress = new Address({
                userId: userId,
                name: name,
                addressLine: addressLine,
                phone: phone,
                city: city,
                district: district,
                state: state,
                pincode: pincode,
                country: country
            })
            await newAddress.save()
            return res.status(200).json({ message: "Address added successfully" })
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: "Internal server error" })
        }
    }

//To delete address from user profile
const postAddressDelete = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        console.log(addressId);

        const deletedAddress = await Address.findByIdAndDelete(addressId);
        if (!deletedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }else{
            return res.status(200).json({ message: "Address deleted successfully" });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

//To get the edit address page
const getUserEditAddress = async(req,res)=>{
    try{
        const addressId = req.params.addressId
        console.log(addressId)
        const userAddress = await Address.findById(addressId)
        console.log(userAddress)
        return res.render('user/updateAddress',{userAddress, userDetails})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To post the updated address
const postUpdateUserAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        console.log(addressId , req.body)
        
        // Extract form data from req.body
        const newaddress = {
            name: req.body.name,
            addressLine: req.body.addressLine,
            phone: req.body.phone,
            city: req.body.city,
            district: req.body.district,
            state: req.body.state,
            pincode: req.body.pincode,
            country: req.body.country
        };

        // Update the address using the extracted form data
        const updatedAddress = await Address.findOneAndUpdate(
            { _id: addressId },
            newaddress,
            { new: true }
        );

        if (updatedAddress) {
            return res.status(200).json({ message: "Address updated successfully" });
        } else {
            return res.status(500).json({ message: "Failed to update address" });
        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//To send the otp for changing password from user profile
const postOtpForChangePass = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateOtp();
        saveOtp = otp;
        console.log("SaveOtp before =", saveOtp);

        function clearSaveOtp() {
            saveOtp = "";
            console.log("SaveOtp after =", saveOtp);
        }
        setTimeout(clearSaveOtp, 30000);

        sendOtpMail(email, saveOtp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//To pot the otp from forgot password for verifying
const checkOtpForChangePass = async(req,res)=>{
    try{
        const enteredOtp = req.body.otp
        if (enteredOtp === saveOtp) {
            return res.status(200).json({ message: "OTP matched" });
        } else {
            return res.status(400).json({ message: "Incorrect OTP" });
        }
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error"})
    }
}

//To change the password from user profile
const postUserNewPass = async (req, res) => {
    try {
        const { newPass, userId } = req.body;
        console.log(newPass , userId)
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashpassword = await bcrypt.hash(newPass, 10);

        user.password = hashpassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//To get the forgot password page from login page
const getForgotPassword = async(req,res)=>{
    try{
        return res.render('user/forgotPassword',{userDetails})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To post the email for forgot password
const postForgotPasswordEmail = async(req,res)=>{
    try{
        const email = req.body.email
        console.log("Email :",email)
        enteredEmail = email
        const user = await User.findOne({ email : email})
        if(!user){
            return res.status(400).json({ message : "Email is not registered" })
        }else{
            const otp = generateOtp();
            saveOtp = otp;
            console.log("SaveOtp before =", saveOtp);

            function clearSaveOtp() {
                saveOtp = "";
                console.log("SaveOtp after =", saveOtp);
            }
            setTimeout(clearSaveOtp, 30000);

            sendOtpMail(email, saveOtp);

            res.status(200).json({ message: "OTP has been sent to your email." });
        }
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Intrnal server error" })
    }
}

//To post the otp for forgot password and checking th the otp
const postForgotPasswordOtp = async(req,res)=>{
    try{
        const enteredOtp = req.body.otp
        if(!enteredOtp){
            return res.status(400).json({ message : "Otp sending error"})
        }else{
            if(enteredOtp === saveOtp){
                return res.status(200).json({ message : "Otp is verified" })
            }else{
                return res.status(400).json({ message : "Invalid Otp" })
            }
        }
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To post the new password
const postForgotPasswordNewPass = async (req, res) => {
    try {
        const { newPassword } = req.body; // Assuming enteredEmail is sent in the request body
        console.log("Email :", enteredEmail);
        console.log("newPassword :", newPassword);
        
        const user = await User.findOne({ email: enteredEmail });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        } else {
            const hashpassword = await bcrypt.hash(newPassword, 10);
            if (!hashpassword) {
                return res.status(500).json({ message: "Error hashing password" });
            }
            
            const updatePassword = await User.findOneAndUpdate(
                { email: enteredEmail },
                { password: hashpassword },
                { new: true }
            );
            if (updatePassword) {
                enteredEmail = ""
                return res.status(200).json({ message: "Password reset successfully" });
            } else {
                return res.status(400).json({ message: "Error in password reset" });
            }
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//To get the product detail page
const getProductDetail = async(req,res)=>{
    try{
        const productId = req.params.productId
        const productData = await Product.findById(productId).populate([ {path : "category"},{path : "brand"}])
        console.log("ProdutData : ",productData)
        const productCategory = productData.category
        console.log("ProdutCategory : ",productCategory)
        const sameCategoryProduct = await Product.find({category : productCategory._id})
        console.log("Same category products : ",sameCategoryProduct)
        return res.render('user/productDetail',{userDetails , productData , sameCategoryProduct})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ success : false, message : "Internal server error" })
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
    getUserShop,
    postUserAddress,
    postAddressDelete,
    getUserEditAddress,
    postUpdateUserAddress,
    getUserNewAddress,
    postOtpForChangePass,
    checkOtpForChangePass,
    postUserNewPass,
    getForgotPassword,
    postForgotPasswordEmail,
    postForgotPasswordOtp,
    postForgotPasswordNewPass,
    getProductDetail
}

