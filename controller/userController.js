const HomeCarousel = require('../models/homeCarousel');
const Review = require('../models/reviewModel');
const Category = require('../models/categoryModel');
const Wishlist = require('../models/wishlistModel');
const AdCarousel = require('../models/adCarousel');
const Product = require('../models/productModel');
const Address = require('../models/addressModel');
const Coupon = require('../models/couponModel');
const Wallet = require('../models/walletModel');
const Order = require('../models/orderModel');
const Brand = require('../models/brandModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const path = require('path');
require('dotenv').config();
const fs = require('fs');

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
const generateReferralCode = async(fullname, phone) =>{
    let name = fullname.replace(/\s/g, '');
    let firstNameThree = name.substring(0, 4);
    let phoneLastFour = phone.substring(phone.length - 4);

    const createReferralCode = () => {
        const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
        const randomInt = Math.floor(1000 + Math.random() * 9000);
        return `LP${firstNameThree}${phoneLastFour}${randomString}${randomInt}`;
    };

    let referralCode;
    let isUnique = false;

    while (!isUnique) {
        referralCode = createReferralCode();

        const existingUser = await User.findOne({ referalCode : referralCode });

        if (!existingUser) {
            isUnique = true;
        }
    }

    return referralCode;
}

//Generating otp function
const generateOtp = () => {
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
                <!DOCTYPE html>
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #1b1b1b;">
                        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                            <div style="background-color: #50c878; text-align: center; padding: 20px;">
                                <h1 style="color: #1b1b1b; font-size: 24px; margin: 0; font-weight: bold; letter-spacing: 1px;">LapShop</h1>
                            </div>

                            <div style="padding: 20px; color: #333333; line-height: 1.6;">
                                <p style="margin: 0 0 16px;">Dear Valued Customer,</p>
                                <p style="margin: 0 0 16px;">${message}</p>
                                <p style="margin: 0 0 16px; font-size: 18px; font-weight: bold; text-align: center;">${otp}</p>
                                <p style="margin: 0 0 16px;">This OTP is valid for the next 3 minutes. Please do not share this OTP with anyone for security reasons.</p>
                                <p style="margin: 0 0 16px;">If you did not request this OTP, please ignore this email or contact our support team immediately.</p>
                                <p style="margin: 0 0 16px;">Best regards,<br><strong>The LapShop Team</strong></p>
                            </div>

                            <div style="background-color: #50c878; text-align: center; padding: 10px; color: #ffffff; font-size: 14px;">
                                <p style="margin: 0;">Visit us: <a href="https://lapshop.site" style="color: #ffffff; text-decoration: none;">lapshop.site</a></p>
                                <p style="margin: 0;">Contact: lapshopsite@gmail.com</p>
                            </div>
                        </div>
                    </body>
                </html>`
        }

        await transporter.sendMail(mailOptions)
        return true;
    } catch (error) {
        return false;
    }
  }

  //To get the user home
const getHome = async (req, res) => {
    try {
        const currentDate = new Date();
        const homeCarousel = await HomeCarousel.find({ isBlocked: false });
        const category = await Category.find({isBlocked : false})
        const coupon = await Coupon.find({ 
            isBlocked: false, 
            startDate: { $lte: currentDate }})
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
                    realPrice: "$product.realPrice",
                    imagePath: { $concat: ["/static/images/ProductImages/", "$firstImage"] }
                }
            }
        ])

        let validCoupons = coupon
        let newValidCoupons = []
        let userDetails = req.session.userNC
        if (req.session.user) {
            let user = req.session.user;
        
            coupon.forEach((c, i) => {
                let valid = c.appliedUsers.map(u => u._id.toString()).includes(user._id.toString());
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

//Sending the register data to otp validation page
const postRegister = async (req, res) => {
    try {
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

        let referrel;
        if(enteredReferal && enteredReferal !== "" && enteredReferal !== null){
            referrel = await User.findOne({referalCode : enteredReferal})
            if(!referrel){
                return res.status(401).json({ success : false, message : "Please check the Referrel.."});
            }
        }

        if (!userEmail){
            if(!userPhone){
                return res.status(200).json({ success : true, message : "Redirecting to verification.", redirectUrl : "/getOtpPage"});
            }else{
                return res.status(401).json({ success : false, message : "Phone number is aleary in use."});
            }
        } else {
            return res.status(401).json({ success : false, message : "Email is aleary in use."});
        }
    } catch (error) {
        return res.redirect('/errorPage')
    }
}

const getOtpPage = async(req,res) => {
    try{
        let userDetails = req.session.userNC
        return res.render('user/otpValidation', { type: "", message: "", userDetails});
    }catch(error){
        return res.redirect('/errorPage');
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

//Checking the email and password for user from login page
const postLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(!user || user === null){
            return res.status(401).json({
                success : false,
                message: "Invalid credentials",
            })
        }

        const userId = user._id
        const cart = await Cart.findOne({ userId : userId})
        if(cart){
            cartItemCount = cart.items.length
        }
        
        const password  = req.body.password

        if (user.isblocked) {
            return res.status(401).json({
                success : false,
                message: "Your account is blocked, Please contact our support team.",
            })
        }
            
        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                return res.status(500).json({
                    success : false,
                    message: "Server busy, please try again.",
                })
            } if (result) {
                req.session.user = user;
                req.session.userNC = { userName : user.fullname , cartItemCount , userId : req.session.user._id, userProfile : user.profileimage}
                user.loggedIn = true
                user.save()
                return res.status(200).json({
                    success : true,
                    message: "Login successfull.",
                    redirectUrl: "/"
                })
            } else {  
                return res.status(401).json({
                    success : false,
                    message: "Invalid credentials",
                })
            }
        });
    } catch (error) {
        return res.redirect('/errorPage');
    }
}


//To get the user logout function
const getLogout = async(req,res)=>{
    try{
        const userId = req.session.user._id
        const user = await User.findOne({ _id : userId })
        req.session.destroy((err) => {
            if (err) {
                return res.redirect('/errorPage');
            }
            user.loggedIn = false
            user.save()
            cartItemCount = ""
            const message = "Logged out successfully"
            const type = "success"
            res.redirect(`/login?message=${encodeURIComponent(message)}&type=${type}`);
        });
    }catch(error){
        return res.redirect('/errorPage')
    }
}


// For sending the otp
const sendOtp = async(req,res)=>{
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
            return res.status(200).json({ success : true, message : "An OTP has been sent to your email address."})
        }else{
            return res.status(400).json({ success : false, message : "Otp senting failed."})
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
        const { userName, phone} = req.body;
        const userId = req.session.user._id;

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
        const productData = await Product.find({ $and : [ { isBlocked : false},{ noOfStock : { $gt : 0} } ] }).populate([{ path: "brand" }, { path: "category" }]);
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
        const limit = 12; 
        return res.render('user/shop',{productData , userDetails , adCarousel , category , brand , categoryId , brandId , currentPage: page, wishlistProdId, cartProdId, totalPages: Math.ceil(totalProducts / limit) })
        
    }catch(error){
        return res.redirect('/errorPage')
    }
}


// To get the categorized products
const getCatProduct = async(req,res)=>{
    try{
        let productData;
        let wishlistProdId = [];
        let cartProdId = [];

        if(req.session.user){
            const user = req.session.user
            const wishlist = await Wishlist.find({ userId : user._id})
            if(wishlist){
                const wishlistProducts = wishlist[0].products
                const productsId = wishlistProducts.map(item => item.product);
                wishlistProdId = productsId;
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

            const perPage = 12;
            const skip = (currentPage - 1) * perPage;

            let query = { isBlocked: false };

            if (categories.length > 0 || brands.length > 0 || searchInput) {
                query = {
                    $and: [
                        ...(categories.length > 0 ? [{ category: { $in: categories } }] : []),
                        ...(brands.length > 0 ? [{ brand: { $in: brands } }] : []),
                        ...(searchInput
                            ? [
                                  {
                                      $or: [
                                          { name: { $regex: ".*" + searchInput + ".*", $options: "i" } },
                                          { "brand.name": { $regex: ".*" + searchInput + ".*", $options: "i" } },
                                          { "category.name": { $regex: ".*" + searchInput + ".*", $options: "i" } },
                                          { description: { $regex: ".*" + searchInput + ".*", $options: "i" } },
                                      ],
                                  },
                              ]
                            : []),
                    ],
                    isBlocked: false,
                };
            }

            productData = await Product.find(query).populate({path : "brand"});
            
            if(sortCriteria === "highToLow"){
                productData.sort((a,b) => b.offerPrice - a.offerPrice)
            }else if(sortCriteria === "lowToHigh"){
                productData.sort((a,b) => a.offerPrice - b.offerPrice)
            }else if(sortCriteria === "ascending"){
                productData.sort((a,b) => a.name.localeCompare(b.name))
            }else if(sortCriteria === "descending"){
                productData.sort((a,b) => b.name.localeCompare(a.name))
            }

            let totalProducts = productData.length;
            if(productData.length > 12){
                productData = productData.slice(skip, skip + perPage);
            }
            const totalPages = Math.ceil(totalProducts / perPage);
            
            return res.status(200).json({ message : "Categorized products", productData , totalPages , wishlistProdId , cartProdId})
        }else{
            return res.status(400).json({ message : "No products found" })
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
        const { name, addressLine, phone, city, district, state, pincode, country} = req.body;
        const userId = req.session.user._id;

        if(!/^[a-zA-Z][a-zA-Z\s]*[a-zA-Z]$/.test(name)){
            return res.status(400).json({ success : false, message : "Invalid name." });
        }
        
        if(!/^\d{10}$/.test(phone)){
            return res.status(400).json({ success : false, message : "Invalid phone number." });
        }
        
        if(addressLine.length < 5){
            return res.status(400).json({ success : false, message : "Address should be a propper one." });
        }else if(addressLine.length > 40){
            return res.status(400).json({ success : false, message : "Address charater limit exceeds." });
        }
        
        if(!/^[1-9]\d{5}$/.test(pincode)){
            return res.status(400).json({ success : false, message : "Invalid pincode." });
        }
        
        if(!/^[a-zA-Z\s]+$/.test(city)){
            return res.status(400).json({ success : false, message : "Invalid city." });
        }
        
        if(!/^[a-zA-Z\s]+$/.test(district)){
            return res.status(400).json({ success : false, message : "Invalid district name." });
        }else if(district.length < 4 || district.length > 15){
            return res.status(400).json({ success : false, message : "Invalid district name." });
        }

        if(!/^[a-zA-Z\s]+$/.test(state)){
            return res.status(400).json({ success : false, message : "Invalid state name." });
        }else if(state.length < 3 || state.length > 15){
            return res.status(400).json({ success : false, message : "Invalid state name." });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(400).json({ success : false, message : "User not found" });
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
        await newAddress.save();
        return res.status(200).json({ success : true,  message: "Address added successfully" });
    } catch (error) {
        return res.redirect('/errorPage');
    }
}

//To delete address from user profile
const postAddressDelete = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        const userId = req.session.user._id;
        if(!addressId){
            return res.status(400).json({ success : false, message : "Address fetching error."})
        }

        const ordersWithCurrentAddress = await Order.find({userId : userId, address : addressId});
        if(ordersWithCurrentAddress.length > 0){
            return res.status(400).json({ success : false, message: "This address is used for your purchase." });
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

        if(!/^[a-zA-Z][a-zA-Z\s]*[a-zA-Z]$/.test(req.body.name)){
            return res.status(400).json({ success : false, message : "Invalid name." });
        }
        
        if(!/^\d{10}$/.test(req.body.phone)){
            return res.status(400).json({ success : false, message : "Invalid phone number." });
        }
        
        if(req.body.addressLine.length < 5){
            return res.status(400).json({ success : false, message : "Address should be a propper one." });
        }else if(req.body.addressLine.length > 40){
            return res.status(400).json({ success : false, message : "Address charater limit exceeds." });
        }
        
        if(!/^[1-9]\d{5}$/.test(req.body.pincode)){
            return res.status(400).json({ success : false, message : "Invalid pincode." });
        }
        
        if(!/^[a-zA-Z\s]+$/.test(req.body.city)){
            return res.status(400).json({ success : false, message : "Invalid city." });
        }
        
        if(!/^[a-zA-Z\s]+$/.test(req.body.district)){
            return res.status(400).json({ success : false, message : "Invalid district name." });
        }else if(req.body.district.length < 4 || req.body.district.length > 15){
            return res.status(400).json({ success : false, message : "Invalid district name." });
        }

        if(!/^[a-zA-Z\s]+$/.test(req.body.state)){
            return res.status(400).json({ success : false, message : "Invalid state name." });
        }else if(req.body.state.length < 3 || req.body.state.length > 15){
            return res.status(400).json({ success : false, message : "Invalid state name." });
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
        let cartProdId = [];
        let wishlistProdId = [];
        let productDelivered = false;
        const productId = req.params.productId;
        const productData = await Product.findById(productId).populate([ {path : "category"},{path : "brand"}]);
        const productCategory = productData.category;
        const sameCategoryProduct = await Product.find({category : productCategory._id, _id : {$ne : productId }});
        const mostPopular = await Product.find({category : productCategory.id, noOfStock : {$gt : 0}, _id : {$ne : productId}}).populate([{path : "brand"}]).limit(5);
        const reviews = await Review.find({ productId }).populate([ {path : "userId" } ]).sort({ createdAt : -1});
        let userDetails = req.session.userNC
        if(userDetails && userDetails !== undefined && userDetails !== ""){
            let userId = userDetails.userId
            let cart = await Cart.find({ userId : userId})
            if(cart.length > 0){
                cartProdId = cart[0].items.map(item => item.product)   
            }
        }

        if(req.session.user){
            const user = req.session.user;
            const wishlist = await Wishlist.find({ userId : user._id});
            if(wishlist != ""){
                wishlistProdId = wishlist[0].products.map(item => item.product);
            }

            productDelivered = await Order.findOne({
                userId: user._id,
                status: "Delivered",
                "orderedItems.product": productId,
            });        
        }
        return res.render('user/productDetail',{userDetails , productData , sameCategoryProduct , cartProdId, wishlistProdId, mostPopular, reviews, productDelivered})
    }catch(error){
        return res.redirect('/errorPage')
    }
}


//To go to checkout
const getCheckout = async(req,res)=>{
    try{
        let userId = req.session.user._id
        let userCart = await Cart.findOne({ userId : userId}).populate({
            path: 'items.product',
            populate: { path: 'brand' }
        })
        .exec();
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

//To send the purchase details to use email
const sendPurchaseDetails = async (mailData) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.OFFICIAL_EMAIL,
                pass: process.env.OFFICIALEMAIL_PASS,
            },
        });

        // Helper function to format dates in a readable format like "07 Jan 2025"
        const formatDate = (date) => {
            const options = { year: 'numeric', month: 'short', day: '2-digit' };
            return new Intl.DateTimeFormat('en-IN', options).format(new Date(date));
        };

        // Helper function to generate the payment status message
        const getPaymentMessage = (paymentStatus) => {
            return paymentStatus
                ? "Your order has been confirmed. Thank you for your payment!"
                : "Your order has been created and is awaiting payment. Please complete the payment to confirm your order.";
        };

        // Helper function to generate the wallet debited section
        const generateWalletDebitedSection = (walletDebitedAmount) => {
            return walletDebitedAmount > 0
                ? `<p style="margin: 0 0 12px;"><strong>Wallet Debited Amount:</strong> ₹${walletDebitedAmount}</p>`
                : "";
        };

        // Extract and format the address
        const formatAddress = (address) => {
            return `
                <p style="margin: 0 0 12px;"><strong>Name:</strong> ${address.name}</p>
                <p style="margin: 0 0 12px;"><strong>Address:</strong> ${address.addressLine}</p>
                <p style="margin: 0 0 12px;"><strong>Phone:</strong> ${address.phone}</p>
                <p style="margin: 0 0 12px;"><strong>City:</strong> ${address.city}</p>
                <p style="margin: 0 0 12px;"><strong>District:</strong> ${address.district}</p>
                <p style="margin: 0 0 12px;"><strong>State:</strong> ${address.state}</p>
                <p style="margin: 0 0 12px;"><strong>Pincode:</strong> ${address.pincode}</p>
                <p style="margin: 0 0 12px;"><strong>Country:</strong> ${address.country}</p>
            `;
        };

        const orderedDate = formatDate(mailData.orderedDate);
        const expectedDelivery = formatDate(mailData.expectedDelivery);
        const paymentMessage = getPaymentMessage(mailData.paymentStatus);
        const walletDebitedSection = generateWalletDebitedSection(mailData.walletDebitedAmount);

        const mailOptions = {
            from: "lapshopsite@gmail.com",
            to: mailData.email,
            subject: `Thank You for Your Purchase! Order ID: ${mailData.orderId}`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; color: #1b1b1b;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <div style="background-color: #50c878; text-align: center; padding: 20px;">
                            <h1 style="color: #1b1b1b; font-size: 24px; margin: 0; font-weight: bold; letter-spacing: 1px;">LapShop</h1>
                            <p style="color: #ffffff; margin: 10px 0 0;">Thank you for shopping with us!</p>
                        </div>

                        <!-- Order Details -->
                        <div style="padding: 20px; color: #333333; line-height: 1.6;">
                            <h3 style="margin-bottom: 16px; color: #50c878;">Order Details</h3>
                            <p style="margin: 0 0 12px;"><strong>Order ID:</strong> ${mailData.orderId}</p>
                            <p style="margin: 0 0 12px;"><strong>Ordered Date:</strong> ${orderedDate}</p>
                            <p style="margin: 0 0 12px;"><strong>Expected Delivery:</strong> ${expectedDelivery}</p>
                            <p style="margin: 0 0 12px;"><strong>Payment Method:</strong> ${mailData.paymentMethod}</p>
                            <p style="margin: 0 0 12px;"><strong>Payment Status:</strong> ${mailData.paymentStatus ? "Paid" : "Pending"}</p>
                            ${walletDebitedSection}
                            <p style="margin: 0 0 12px;"><strong>Order Total:</strong> ₹${mailData.orderTotal}</p>
                            <h3 style="margin-top: 24px; color: #50c878;">Delivery Address</h3>
                            ${formatAddress(mailData.address)}
                            <p style="margin: 20px 0; background-color: #f4f4f4; padding: 10px; border-radius: 4px; color: #1b1b1b;">${paymentMessage}</p>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #50c878; text-align: center; padding: 20px; color: #ffffff; font-size: 14px;">
                            <p style="margin: 0;">If you have any questions, contact us at <a href="mailto:lapshopsite@gmail.com" style="color: #1b1b1b; text-decoration: none;">lapshopsite@gmail.com</a>.</p>
                            <p style="margin: 0;">Check your order or visit us at: <a href="https://lapshop.site" style="color: #1b1b1b; text-decoration: none;">LapShop</a></p>
                        </div>
                    </div>
                </body>
                </html>`,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error in sendPurchaseDetails:", error);
        return { success: false, error: error.message };
    }
};


// To get the order confirm page
const getPaymentSuccess = async(req,res)=>{
    try{
        const userDetails = req.session.userNC;
        const userId = req.session.user._id;

        const user = await User.findById(userId);

        const orders = await Order.find({ userId: userId });
        const latestOrder = orders.sort((a, b) => b.orderDate - a.orderDate)[0];

        if (!latestOrder) {
            throw new Error("No orders found for the user.");
        }

        const deliveryAddress = await Address.findById(latestOrder.address);

        const paymentMethodMap = {
            cod: "Cash on delivery.",
            wallet: "Wallet payment.",
            razorpay: "Online razorpay payment.",
        };
        const paymentMethod = paymentMethodMap[latestOrder.paymentMethod] || "Unknown method";

        const expectedDelivery = new Date(latestOrder.orderDate);
        expectedDelivery.setDate(expectedDelivery.getDate() + 4);

        const sharedData = {
            orderId: latestOrder.orderId,
            orderedDate: latestOrder.orderDate,
            expectedDelivery,
            paymentMethod,
            paymentStatus: latestOrder.paymentStatus,
            walletDebitedAmount: latestOrder.walletDebitedAmount,
            orderTotal: latestOrder.orderTotal,
            address: deliveryAddress,
        };

        sendPurchaseDetails({
            ...sharedData,
            name: userDetails.userName,
            email: user.email,
        }).catch((err) => console.error("Failed to send email:", err));

        return res.render("user/orderConfirmation", { userDetails, data: sharedData });
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
        const addressId = req.params.addressId;
        if(!addressId){
            return res.status(400).json({ success : false, message : "Address not found." });
        }

        if(!/^[a-zA-Z][a-zA-Z\s]*[a-zA-Z]$/.test(req.body.name)){
            return res.status(400).json({ success : false, message : "Invalid name." });
        }
        
        if(!/^\d{10}$/.test(req.body.phone)){
            return res.status(400).json({ success : false, message : "Invalid phone number." });
        }
        
        if(req.body.addressLine.length < 5){
            return res.status(400).json({ success : false, message : "Address should be a propper one." });
        }else if(req.body.addressLine.length > 40){
            return res.status(400).json({ success : false, message : "Address charater limit exceeds." });
        }
        
        if(!/^[1-9]\d{5}$/.test(req.body.pincode)){
            return res.status(400).json({ success : false, message : "Invalid pincode." });
        }
        
        if(!/^[a-zA-Z\s]+$/.test(req.body.city)){
            return res.status(400).json({ success : false, message : "Invalid city." });
        }
        
        if(!/^[a-zA-Z\s]+$/.test(req.body.district)){
            return res.status(400).json({ success : false, message : "Invalid district name." });
        }else if(req.body.district.length < 4 || req.body.district.length > 15){
            return res.status(400).json({ success : false, message : "Invalid district name." });
        }

        if(!/^[a-zA-Z\s]+$/.test(req.body.state)){
            return res.status(400).json({ success : false, message : "Invalid state name." });
        }else if(req.body.state.length < 3 || req.body.state.length > 15){
            return res.status(400).json({ success : false, message : "Invalid state name." });
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

//To send the contact form response
const sendContactMail = async (name, email, phone, message) => {
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

        const mailOptions = {
            from: 'lapshopsite@gmail.com',
            to: 'lapshopsite@gmail.com',
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; color: #1b1b1b;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <div style="background-color: #50c878; text-align: center; padding: 20px;">
                            <h1 style="color: #1b1b1b; font-size: 24px; margin: 0; font-weight: bold; letter-spacing: 1px;">LapShop Contact Form</h1>
                        </div>

                        <!-- Content -->
                        <div style="padding: 20px; color: #333333; line-height: 1.6;">
                            <h3 style="margin-bottom: 16px; color: #50c878;">New Contact Form Submission</h3>
                            <p style="margin: 0 0 12px;"><strong>Name:</strong> ${name}</p>
                            <p style="margin: 0 0 12px;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 0 0 12px;"><strong>Phone:</strong> ${phone}</p>
                            <p style="margin: 0 0 12px;"><strong>Message:</strong></p>
                            <p style="margin: 0; background-color: #f4f4f4; padding: 10px; border-radius: 4px; color: #1b1b1b;">${message}</p>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #50c878; text-align: center; padding: 10px; color: #ffffff; font-size: 14px;">
                            <p style="margin: 0;">This message was submitted through the LapShop contact form.</p>
                        </div>
                    </div>
                </body>
                </html>`,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
};

const postContact = async(req,res) => {
    try{
        const { name, email, phone, message } = req.body;
        
        if (!name || !email || !phone || !message) {
            return res.status(400).json({ success : false, message: "All fields are required." });
        }

        const emailSent = await sendContactMail(name, email, phone, message);

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send your response. Please try again later.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Form submitted successfully. We will get back to you shortly.",
        });
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To get the error page
const getErrorPage = async(req,res)=>{
    res.render('user/errorPage', {
        status: 500,
        message: "An unexpected error occurred.",
    });
}

module.exports = {
    getHome,
    getLogin,
    getLogout,
    getRegister,
    postRegister,
    postRegisterOtp,
    postLogin,
    sendOtp,
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
    postContact,
    getErrorPage,
    getOtpPage
}

