require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Address = require('../models/addressModel')
const Brand = require('../models/brandModel')
const Category = require('../models/categoryModel')
const HomeCarousel = require('../models/homeCarousel')
const AdCarousel = require('../models/adCarousel')
const Wishlist = require('../models/wishlistModel')
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')
const Wallet = require('../models/walletModel')
const nodemailer = require('nodemailer')
const crypto = require("crypto")
const path = require('path')
const fs = require('fs')

//for storing otp
let registerOtp;
let cpOtp;
let fpOtp;
let enteredFullname;
let enteredEmail;
let enteredPhone;
let enteredPassword;
let enteredReferal
let cartItemCount;

//Generate referal code
const generateReferralCode = (fullname, phone) =>{
    let name = fullname.replace(/\s/g, '');
    let firstNameThree = name.substring(0, 4);
    let phoneLastFour = phone.substring(phone.length - 4);
    let referralCode = firstNameThree + phoneLastFour;
    return referralCode;
}

//Generating otp function
const generateOtp = () => {
    const crypto = require('crypto');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = "";
    for (let i = 0; i < 6; i++) {
        const index = crypto.randomInt(0, chars.length);
        otp += chars[index];
    }
    return otp;
}

//Send otp through email
const sendOtpMail = async(email,otp,subject,message)=>{
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.AUTH_EMAIL,
                    pass: process.env.AUTH_PASS,
                },
        });
        const mailOptions= {
            from: 'lapshopotp@gmail.com',
            to: email,
            subject: subject,
            html: `
                <p>Dear Valued Customer,</p>
                <p>${message}</p>
                <p><strong>${otp}</strong></p>
                <p>This OTP is valid for the next 3 minutes. Please do not share this OTP with anyone for security reasons.</p>
                <p>If you did not request this OTP, please ignore this email or contact our support team immediately.</p>
                <p>Best regards,<br>The LapShop Team</p>`
        }

        await transporter.sendMail(mailOptions)
        return true;
    } catch (error) {
        return false;
    }
  }

//Sending the register data to otp validation page
const postRegister = async (req, res) => {
    try {
        let userDetails = req.session.userNC
        registerOtp = generateOtp()

        function clearSaveOtp() {
            registerOtp = ""; 
        }
        setTimeout(clearSaveOtp, 180000);

        enteredFullname = req.body.fullname;
        enteredEmail = req.body.email;
        enteredPhone = req.body.phone;
        enteredPassword = req.body.password;
        enteredReferal = req.body.referalCode

        const userEmail =  await User.findOne({email:enteredEmail}); 
        const userPhone = await User.findOne({phone : enteredPhone})

        if (!userEmail){
            if(!userPhone){
                const subject = "Your OTP for Registration at LapShop Ecommerce";
                const message = "Thank you for choosing LapShop Ecommerce. To complete your registration, please use the following One Time Password (OTP):"
                const sendOtp = await sendOtpMail(enteredEmail ,registerOtp ,subject , message);
                if(sendOtp){
                    return res.render('user/otpValidation', { type: "success", message: "Check your email for otp", userDetails})
                }else{
                    return res.render('user/registration', { type: "danger", message: "Otp sending failed , please try again.", userDetails})
                }
            }else{
                return res.render('user/registration', { type: "danger", message: "Phone number already registered.", userDetails})                
            }
        } else {
            return res.render('user/registration', { type: "danger", message: "Email already registered.", userDetails})
        }
    } catch (error) {
        return res.redirect('/errorPage')
    }
}

// Verifying the otp and saving the user in db
const postRegisterOtp = async (req, res) => {
    try {
        const enteredOtp = req.body.otp
        if(!enteredOtp){
            return res.status(400).json({ success : false, message : "Otp fetching error."})
        }
        
        if(enteredOtp == registerOtp){
            const hashpassword = await bcrypt.hash(enteredPassword, 10)
            if(!hashpassword){
                return res.status(400).json({ success : false, message : "Something went wrong."})
            }
            const referalCode = await generateReferralCode(enteredFullname , enteredPhone)
            if(!referalCode){
                return res.status(400).json({ success : false, message : "Something went wrong."})
            }

            const user = new User({
                fullname : enteredFullname,
                email : enteredEmail,
                phone : enteredPhone,
                password : hashpassword,
                referalCode : referalCode
            })

            const referedUser = await User.findOne({ referalCode : enteredReferal})
            if(referedUser){
                const walletOne = new Wallet({
                    user: referedUser._id,
                    type: "credit",
                    amount: 300,
                    updatedAt : new Date()
                });
                await walletOne.save();
            }

            const userData = await user.save()
            if(userData){
                enteredFullname = ''
                enteredEmail = ''
                enteredPhone = ''
                enteredReferal = ''
                enteredPassword = ''
                return res.status(200).json({ success : true , message : "Registration has been successfull." })
            }else{
                return res.status(400).json({ success : false , message : "Registration has been failed."})
            }
        }else{
            return res.status(400).json({ success : false , message : "Please enter the correct otp." , invalidOtp : true })
        } 
    } catch (error) {
        return res.redirect('/errorPage')
    }
}

//Checking the email and password for user from login page
const postLogin = async (req, res) => {
    try {
        let userDetails = req.session.userNC
        const user = await User.findOne({ email: req.body.email });
        if(!user || user === null){
            return res.render("user/login", {type: "danger", message: "No user found with this email.", userDetails , cartItemCount})
        }

        const userId = user._id
        const cart = await Cart.find({ userId : userId})
        if(cart != ""){
            cartItemCount = cart[0].items.length
        }
        
        const password  = req.body.password

            if (user.isblocked) {
                return res.render("user/login", { type: "danger", message: "Account is blocked, please contact us", userDetails})
            }
            
            bcrypt.compare(password, user.password, function (err, result) {
                if (err) {
                    return res.status(500).send('An error occurred while comparing the passwords.');
                } if (result) {
                    req.session.user = user;
                    req.session.userNC = { userName : user.fullname , cartItemCount , userId : req.session.user._id}
                    res.redirect('/')
                } else {  
                    return res.render("user/login", {type: "danger", message: "Incorrect password", userDetails})
                }
            });
    } catch (error) {
        return res.redirect('/errorPage')
    }
}

// To get the user login page
const getLogin = async (req, res) => {
    try {
        if(req.session && req.session.user && req.session.user !== null){
            res.redirect('/')
        }else{
            let userDetails = '';
            let type = req.query.type || '';
            let message = req.query.message || '';
            return res.render('user/login',{type, message, userDetails})
        }
    } catch (error) {
        return res.redirect('/errorPage')
    }
}


//To get the user logout function
const getLogout = async(req,res)=>{
    try{
        req.session.destroy((err) => {
            if (err) {
                return res.redirect('/errorPage');
            }
            cartItemCount = ""
            const message = "Logged out successfully"
            const type = "success"
            res.redirect(`/login?message=${encodeURIComponent(message)}&type=${type}`);
        });
    }catch(error){
        return res.redirect('/errorPage')
    }
}


//To get the user home
const getHome = async (req, res) => {
    try {
        const homeCarousel = await HomeCarousel.find({ isBlocked: false });
        const category = await Category.find({isBlocked : false})
        const coupon = await Coupon.find({ isBlocked : false})
        const brands = await Brand.find({ isBlocked : false})

        const bestSellingProducts = await Order.aggregate([
            { 
                $match: { status: "Delivered" }
            },
            {
                $unwind: "$orderedItems"
            },
            {
                $group: {
                    _id: "$orderedItems.product",
                    totalOrdered: { $sum: "$orderedItems.quantity" } 
                }
            },
            {
                $sort: { totalOrdered: -1 } 
            },
            {
                $lookup: {
                    from: "products", 
                    localField: "_id",
                    foreignField: "_id",
                    as: "product" 
                }
            },
            {
                $unwind: "$product" 
            },
            {
                $addFields: {
                    firstImage: { $arrayElemAt: ["$product.images", 0] }
                }
            },
            {
                $project: {
                    _id: "$product._id",
                    name: "$product.name",
                    discount: "$product.discountPercentage",
                    totalOrdered: "$totalOrdered",
                    imagePath: { $concat: ["/static/images/ProductImages/", "$firstImage"] }
                }
            }
        ])

        let validCoupons = coupon
        let newValidCoupons = []
        let userDetails = req.session.userNC
        if (req.session.user) {
            const user = req.session.user;
        
            coupon.forEach((c, i) => {
                const valid = c.appliedUsers.map(u => u._id.toString()).includes(user._id.toString());
                if (!valid) {
                    newValidCoupons.push(c)
                }
            });
            validCoupons = newValidCoupons
        }
        return res.render('user/home',{userDetails , homeCarousel , bestSellingProducts , category  , coupon : validCoupons , brands})

    } catch (error) {
        return res.redirect('/errorPage')
    }
}

//To get the user register page
const getRegister = async (req, res) => {
    try {
        let userDetails = req.session.userNC
        return res.render('user/registration', { type: "", message: "" , userDetails , cartItemCount})
    } catch (error) {
        return res.redirect('/errorPage')
    }
}

// For resending the otp
const resendOtp = async(req,res)=>{
    try{
        registerOtp = generateOtp()
        
        function clearSaveOtp() {
            registerOtp = ""; 
        }
        setTimeout(clearSaveOtp, 180000);

        const subject = "Your OTP for Registration at LapShop Ecommerce";
        const message = "Thank you for choosing LapShop Ecommerce. To complete your registration, please use the following One Time Password (OTP):"
        const sendOtp = await sendOtpMail(enteredEmail, registerOtp, subject, message);
        if(sendOtp){
            return res.stauts(200).json({ success : true, message : "Otp resented succesfully."})
        }else{
            return res.stauts(400).json({ success : true, message : "Otp resenting failed."})
        }
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To get the user profile page
const getUserProfile = async(req,res)=>{
    try{
        const userId = req.session?.user?._id
        const userData = await User.findById(userId)
        const createdDate = new Date(userData.created);
        const address = await Address.find({userId : userId})
        const formattedDate = createdDate.toISOString().split('T')[0];
        let userDetails = req.session.userNC
        
        return res.render('user/profile',{userData, formattedDate , userDetails, address})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

// To update the user information
const postUserUpdatedInfo = async(req,res)=>{
    try{
        const { userName, phone, userId } = req.body;

        if(!userName || !phone || !userId){
            return res.status(400).json({ success : false, message : "User data submiting failed"})
        }

        const updateUser = await User.findByIdAndUpdate(userId, { fullname: userName, phone: phone },
            { new: true } );
        
        if (!updateUser) {
            return res.status(404).json({ success : false, message: "User not found" });
        } else {
            return res.status(200).json({ success : true, message: "User updated successfully", user: updateUser });
        }
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To upload profile image
const postUserProfileImage = async(req,res)=>{
    try{
        const userId = req.body.userId
        if(!userId){
            return res.status(400).json({ success : false, message : "userId fething failed."})
        }

        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({ success : false, message : "User not found."})
        }

        if(!req.file){
            return res.status(400).json({ success : false, message : "Image is not uploaded correctly"})
        }

        if(user.profileimage){
            existingimage = user.profileimage
            const imagePath = path.join(__dirname, "../public/images/UserProfile", existingimage);
            fs.unlinkSync(imagePath);
        }

        const updateUserImage = await User.findByIdAndUpdate(userId, {profileimage : req.file.filename})
        if (updateUserImage) {
            return res.status(200).json({ success : true, message: "Profile image uploaded successfully" });
        } else {
            return res.status(500).json({ success : false, message: "Failed to update profile image" });
        }
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To delete user profile image
const delteUserProfileImage = async(req,res)=>{
    try{
        const userId = req.session.user._id
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (!user.profileimage) {
            return res.status(400).json({ success: false, message: 'User does not have a profile image.' });
        }

        const existingImage = user.profileimage;
        const imagePath = path.join(__dirname, "../public/images/UserProfile", existingImage);

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ success: false, message: 'Profile image not found.' });
        }

        try {
            fs.unlinkSync(imagePath);
            if (fs.existsSync(imagePath)) {
                throw new Error('Failed to delete profile image');
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Failed to delete profile image.' });
        }

        const updateUserImage = await User.findByIdAndUpdate(userId, { profileimage: "" });
        if (updateUserImage) {
            return res.status(200).json({ success: true, message: 'Profile image deleted successfully.' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to update user profile.' });
        }
        
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To get the shop page
const getUserShop = async(req,res)=>{
    try{
        const productData = await Product.find({ $and : [ { isBlocked : false},{ noOfStock : { $gt : 0} } ] }).populate("brand")
        const totalProducts = await Product.countDocuments({ isBlocked: false }); 
        const adCarousel = await AdCarousel.find({ isBlocked: false });
        const category = await Category.find({ isBlocked : false})
        const brand = await Brand.find({ isBlocked : false})

        let categoryId = []
        let brandId = []
        let wishlistProdId = []
        let cartProdId = []
        let userDetails = req.session.userNC

        if(!req.session.user){
            prodId =[]
            cartProdId = []
        }else{
            const user = req.session.user
            const wishlist = await Wishlist.find({ userId : user._id})
            if(wishlist != ""){
                wishlistProdId = wishlist[0].products.map(item => item.product);
            }
            const cart = await Cart.find({ userId : user._id }) 
            if(cart != ""){
                cartProdId = cart[0].items.map(item => item.product)
            }
        }

        const page = parseInt(req.query.page) || 1;  
        const limit = 6; 
        
        return res.render('user/shop',{productData , userDetails , adCarousel , category , brand , categoryId , brandId , currentPage: page, wishlistProdId, cartProdId, totalPages: Math.ceil(totalProducts / limit) })
        
    }catch(error){
        return res.redirect('/errorPage')
    }
}


// To get the categorized products
const getCatProduct = async(req,res)=>{
    try{
        let productData;
        let prodId = []
        let cartProdId = []

        if(req.session.user){
            const user = req.session.user
            const wishlist = await Wishlist.find({ userId : user._id})
            if(wishlist != ""){
                const wishlistProducts = wishlist[0].products
                const productsId = wishlistProducts.map(item => item.product);
                prodId = productsId
            }
            const cart = await Cart.find({ userId : user._id }) 
            if(cart){
                cartProdId = cart[0].items.map(item => item.product)
            }
        }
        

        if(req.body){
            const categories = req.body.categories.filter(category => category !== null);
            const brands = req.body.brands.filter(brand => brand !== null);
            
            const sortCriteria = req.body.sortCriteria
            const currentPage = req.body.currentPage

            const searchInput = req.body.inputValue

            const perPage = 6;
            const skip = (currentPage - 1) * perPage;

            let query = { isBlocked: false };
            if (categories.length > 0 && brands.length > 0 && searchInput) {
                query = {
                    $and: [
                        { category: { $in: categories } },
                        { brand: { $in: brands } },
                        { name: {$regex : ".*"+searchInput+".*", $options : "i"} }
                    ],
                    isBlocked: false
                };
            } else if (categories.length > 0 && brands.length === 0 && !searchInput) {
                query = {
                    category: { $in: categories },
                    isBlocked: false
                };
            } else if (brands.length > 0 && categories.length === 0 && !searchInput) {
                query = {
                    brand: { $in: brands },
                    isBlocked: false
                };
            } else if ( searchInput && categories.length === 0 && brands.length === 0){
                query = {
                    name : { $regex : ".*"+searchInput+".*", $options : "i"},
                    isBlocked: false
                };
            } else if (searchInput && categories.length > 0 && brands.length === 0) {
                query = {
                    $and: [
                        { category: { $in: categories } },
                        { name: { $regex : ".*"+searchInput+".*", $options : "i"} }
                    ],
                    isBlocked: false
                };
            } else if (searchInput && brands.length > 0 && categories.length === 0) {
                query = {
                    $and: [
                        { brand: { $in: brands } },
                        { name: { $regex : ".*"+searchInput+".*", $options : "i"} }
                    ],
                    isBlocked: false
                };
            } else if (brands.length > 0 && categories.length > 0 && !searchInput) {
                query = {
                    $and: [
                        { brand: { $in: brands } },
                        { category: { $in: categories } }
                    ],
                    isBlocked: false
                };
            }

            productData = await Product.find(query).skip(skip).limit(perPage)
            const totalProducts = productData.length
            const totalPages = Math.ceil(totalProducts / perPage);
                
            if(sortCriteria === "highToLow"){
                productData.sort((a,b) => b.offerPrice - a.offerPrice)
            }else if(sortCriteria === "lowToHigh"){
                productData.sort((a,b) => a.offerPrice - b.offerPrice)
            }else if(sortCriteria === "ascending"){
                productData.sort((a,b) => a.name.localeCompare(b.name))
            }else if(sortCriteria === "descending"){
                productData.sort((a,b) => b.name.localeCompare(a.name))
            }

            return res.status(200).json({ message : "Categorized products", productData , totalPages , prodId , cartProdId})
        }else{
            return res.status(400).json({ message : "No categorized found" })
        }
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To get the add address page
const getUserNewAddress = async(req,res)=>{
    try{
        const userId = req.params.userId
        let userDetails = req.session.userNC
        return res.render('user/addAddress',{userDetails , userId})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To add user address
const postUserAddress = async(req,res)=>{
    try{
        const { name, addressLine, phone, city, district, state, pincode, country} = req.body
        const userId = req.params.userId

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
            return res.redirect('/errorPage')
        }
    }

//To delete address from user profile
const postAddressDelete = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        if(!addressId){
            return res.status(400).json({ success : false, message : "Address fetching error."})
        }

        const deletedAddress = await Address.findByIdAndDelete(addressId);
        if (deletedAddress) {
            return res.status(200).json({ success : true, message: "Address deleted successfully" });
        }else{
            return res.status(404).json({ success : false, message: "Address not found" });
        }
    } catch (error) {
        return res.redirect('/errorPage')
    }
}

//To get the edit address page
const getUserEditAddress = async(req,res)=>{
    try{
        const addressId = req.params.addressId
        const userAddress = await Address.findById(addressId)
        let userDetails = req.session.userNC
        return res.render('user/updateAddress',{userAddress, userDetails})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To post the updated address
const postUpdateUserAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        if(!addressId){
            return res.status(400).json({ success : false, message : "Address fetching error."})
        }
        
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

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: addressId },
            newaddress,
            { new: true }
        );

        if (updatedAddress) {
            return res.status(200).json({ success : true, message: "Address updated successfully" });
        } else {
            return res.status(500).json({ success : false, message: "Failed to update address" });
        }

    } catch (error) {
        return res.redirect('/errorPage')
    }
};

//To send the otp for changing password from user profile
const postOtpForChangePass = async (req, res) => {
    try {
        const { email } = req.body;
        cpOtp = generateOtp();

        function clearSaveOtp() {
            cpOtp = "";
        }
        setTimeout(clearSaveOtp, 180000);

        const subject = "Your OTP for updating your password at LapShop Ecommerce";
        const message = "Thank you for choosing LapShop Ecommerce. To update your password, please use the following One Time Password (OTP):"
        const sendOtp = await sendOtpMail(email, cpOtp, subject, message);
        if(sendOtp){
            return res.status(200).json({ success : true, message : "OTP sent successfully." });
        }else{
            return res.status(400).json({ message : false, message : "OTP sending failed, please try again." });
        }
    } catch (error) {
        return res.redirect('/errorPage')
    }
};

//To psot the otp from forgot password for verifying
const checkOtpForChangePass = async(req,res)=>{
    try{
        const enteredOtp = req.body.otp
        if(!enteredOtp){
            return res.status(400).json({ success : false, message : "Otp submition failed." });
        }

        if (enteredOtp === cpOtp) {
            return res.status(200).json({ success : true, message : "Otp verified successfully" });
        } else {
            return res.status(400).json({ success : false, message : "Please enter the correct otp." });
        }
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To change the password from user profile
const postUserNewPass = async (req, res) => {
    try {
        const { newPass, userId } = req.body;

        if (!newPass) {
            return res.status(400).json({ success : false, message: "Password submition failed." });
        }

        if (!userId) {
            return res.status(400).json({ success : false, message: "User not found" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success : false, message: "User not found" });
        }

        const hashpassword = await bcrypt.hash(newPass, 10);

        user.password = hashpassword;
        const saveUser = await user.save();

        if(saveUser){
            return res.status(200).json({ success : true, message: "Password updated successfully" });
        }else{
            return res.status(500).json({ succes : false, message: "Password updation failed." });
        }
    } catch (error) {
        return res.redirect('/errorPage')
    }
};

//To get the forgot password page from login page
const getForgotPassword = async(req,res)=>{
    try{
        let userDetails = req.session.userNC
        return res.render('user/forgotPassword',{userDetails})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To post the email for forgot password
const postForgotPasswordEmail = async(req,res)=>{
    try{
        const email = req.body.email
        if(!email){
            return res.status(400).json({ success :false, message : "Email fetching error." })
        }
        enteredEmail = email
        const user = await User.findOne({ email : email})

        if(!user){
            return res.status(400).json({ success :false, message : "Email is not registered" })
        }else{
            fpOtp = generateOtp();
            console.log("fpotp : ",fpOtp)

            function clearSaveOtp() {
                fpOtp = "";
            }
            setTimeout(clearSaveOtp, 180000);

            const subject = "Your OTP for changing password at LapShop Ecommerce";
            const message = "Thank you for choosing LapShop Ecommerce. To change your password, please use the following One Time Password (OTP):"
            const sendOtp = await sendOtpMail(email, fpOtp, subject, message);
            if(sendOtp){
                return res.status(200).json({ success : true, message: "OTP has been sent to your email." });
            }else{
                return res.status(400).json({ success : false, message : "Otp sending falied, please try again"})
            }
        }
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To post the otp for forgot password and checking th the otp
const postForgotPasswordOtp = async(req,res)=>{
    try{
        const enteredOtp = req.body.otp

        if(!enteredOtp){
            return res.status(400).json({ success : false, message : "Otp sending error"})
        }else{
            if(enteredOtp === fpOtp){
                return res.status(200).json({ success : true, message : "Otp is verified" })
            }else{
                return res.status(400).json({ success : false , message : "Please enter the correct otp." , invalidOtp : true })
            }
        }
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To post the new password
const postForgotPasswordNewPass = async (req, res) => {
    try {
        const { newPassword } = req.body; 
        if(!newPassword){
            return res.status(400).json({ success : false, message : "Password fetching error."})
        }
     
        const user = await User.findOne({ email: enteredEmail });
        if (!user) {
            return res.status(400).json({success : false, message : "User not found" });
        } else {
            const hashpassword = await bcrypt.hash(newPassword, 10);
            if (!hashpassword) {
                return res.status(500).json({ success : false, message : "Error hashing password" });
            }
            
            const updatePassword = await User.findOneAndUpdate(
                { email: enteredEmail },
                { password: hashpassword },
                { new: true }
            );
            if (updatePassword) {
                enteredEmail = ""
                return res.status(200).json({ success : true, message : "Password is reseted successfully" });
            } else {
                return res.status(400).json({ success : false, message : "Error in password reset" });
            }
        }
    } catch (error) {
        return res.redirect('/errorPage')
    }
};

//To get the product detail page
const getProductDetail = async(req,res)=>{
    try{
        let cartProdId = []
        const productId = req.params.productId
        const productData = await Product.findById(productId).populate([ {path : "category"},{path : "brand"}])
        const productCategory = productData.category
        const sameCategoryProduct = await Product.find({category : productCategory._id})
        let userDetails = req.session.userNC
        if(userDetails && userDetails !== undefined && userDetails !== ""){
            let userId = userDetails.userId
            let cart = await Cart.find({ userId : userId})
            cartProdId = cart[0].items.map(item => item.product)
        }
        
        return res.render('user/productDetail',{userDetails , productData , sameCategoryProduct , cartProdId})
    }catch(error){
        return res.redirect('/errorPage')
    }
}


//To go to checkout
const getCheckout = async(req,res)=>{
    try{
        let userId = req.session.user._id
        let userCart = await Cart.find({ userId : userId})
        let userAddress = await Address.find({ userId : userId})
        return res.render('user/checkout' , { userCart , userAddress })
    }catch(error){
        return res.redirect('/errorPage')
    }
}

const getUserNewAddressFromCheckout = async(req,res)=>{
    try{
        const userId = req.session.user._id
        let userDetails = req.session.userNC
        return res.render('user/addAddressFromCheckout',{userDetails , userId})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

// To get the payment page
const getPaymentPage = async(req,res)=>{
    try{
        const addressId = req.params.selectedAddressId
        let userAddress = await Address.find({ _id : addressId})
        let userId = req.session.user._id
        let cart = await Cart.find({ userId : userId}).populate({
            path: "items.product",
            populate: { path: "brand" }
          });
        const userCart = cart[0]
        let coupon = await Coupon.find({isBlocked : false })

        return res.render('user/payment' , {userAddress , userCart , coupon })
    }catch(error){
        return res.redirect('/errorPage')
    }
}

// To get the order confirm page
const getPaymentSuccess = async(req,res)=>{
    try{
        let userDetails = req.session.userNC
        const userId = req.session.user._id
        const order = await Order.find({userId : userId})
        const latestOrder = order.sort((a, b) => b.orderDate - a.orderDate)[0];
        const addressId = latestOrder.address
        const deliveryAddress = await Address.findById(addressId)
        let paymentMethod = latestOrder.paymentMethod
        if(paymentMethod === "cod"){
            paymentMethod = "Cash on delivery."
        }else if( paymentMethod === "wallet"){
            paymentMethod = "Wallet payment."
        }else if(paymentMethod === "razorpay"){
            paymentMethod = "Online razorpay payment."
        }
        const orderTotal = latestOrder.orderTotal
        const orderedDate = latestOrder.orderDate
        const walletDebitedAmount = latestOrder.walletDebitedAmount
        const expectedDelivery = new Date(orderedDate);
            expectedDelivery.setDate(expectedDelivery.getDate() + 4);
        const data = {
            address : deliveryAddress,
            paymentMethod : paymentMethod,
            paymentStatus : latestOrder.paymentStatus,
            walletDebitedAmount : walletDebitedAmount,
            orderTotal : orderTotal,
            orderedDate : orderedDate,
            expectedDelivery : expectedDelivery
        }
        return res.render('user/orderConfirmation',{userDetails , data})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

// To get the address edit page from checout
const getUserEditAddressFromCheckout = async(req,res)=>{
    try{
        const addressId = req.params.addressId
        const address = await Address.findById(addressId)
        let userDetails = req.session.userNC
        return res.render('user/editAddressFromCheckout',{ userDetails, address})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To update the address from checkout page
const updateAddressFromCheckout = async(req,res)=>{
    try{
        const addressId = req.params.addressId
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
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To get the contact page
const getContactPage = async(req,res)=>{
    try{
        let userDetails = req.session.userNC
        return res.render('user/contact',{ userDetails })
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To get the error page
const getErrorPage = async(req,res)=>{
    try{
        return res.render('user/errorPage')
    }catch(error){
        console.log(error.message)
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
    resendOtp,
    getUserProfile,
    postUserUpdatedInfo,
    postUserProfileImage,
    delteUserProfileImage,
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
    getProductDetail,
    getCatProduct,
    getCheckout,
    getUserNewAddressFromCheckout,
    getUserEditAddressFromCheckout,
    updateAddressFromCheckout,
    getPaymentPage,
    getPaymentSuccess,
    getContactPage,
    getErrorPage
}

