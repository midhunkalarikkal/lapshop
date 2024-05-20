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
let saveOtp;
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
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASS,
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
        return res.redirect('/errorPage')
    }
  }

//Sending the register data to otp validation page
const postRegister = async (req, res) => {
    try {
        let userDetails = req.session.userNC
        const otp = generateOtp()
        saveOtp = otp;
        
        function clearSaveOtp() {
            saveOtp = ""; 
        }
        setTimeout(clearSaveOtp, 30000);

        enteredFullname = req.body.fullname;
        enteredEmail = req.body.email;
        enteredPhone = req.body.phone;
        enteredPassword = req.body.password;
        enteredReferal = req.body.referalCode

        const userEmail =  await User.findOne({email:enteredEmail}); 

        if (!userEmail){
            sendOtpMail(enteredEmail,otp);
            return res.render('user/otpvalidation', { type: "success", message: "Check your email for otp", userDetails})
        } else {
            return res.render('user/registration', { type: "danger", message: "Email already registered.", userDetails})
        }
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

// Verifying the otp and saving the user in db
const postRegisterOtp = async (req, res) => {
    try {
        let userDetails = req.session.userNC
        const enteredOtp = req.body
        const otp1 = enteredOtp.otp;
        const otp2 = enteredOtp.otp2;
        const otp3 = enteredOtp.otp3;
        const otp4 = enteredOtp.otp4;
        const otp5 = enteredOtp.otp5;
        const otp6 = enteredOtp.otp6;
        const concatenatedOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
        
        if(concatenatedOTP === saveOtp){
            console.log("otp is okkkkkkkkkkkkkkkkkk")
            const hashpassword = await bcrypt.hash(enteredPassword, 10)
            const referalCode = await generateReferralCode(enteredFullname , enteredPhone)

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

            const userEmail = await User.findOne({email : enteredEmail})
            const userPhone = await User.findOne({phone : enteredPhone})

            if(!userEmail && !userPhone){
                const userData = await user.save()
                if(userData){
                    return res.render('user/login',{type : "success" , message : "Registration has been successfull.", userDetails})
                }else{
                    return res.render('user/registration',{type : "danger" , message : "Registration has been failed.", userDetails})
                }
            }else{
                return res.render('user/registration',{type : "danger" , message : "User already exist.", userDetails})
            }   
        }else{
            return res.render("user/otpvalidation",{type : "danger" , message : "Invalid OTP", userDetails});
        }
        
    } catch (error) {
        console.log(error.message)
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
                    console.log(err);
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
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

// To get the user login page
const getLogin = async (req, res) => {
    try {
        if(!req.session.user || !req.session.user.isBlocked){
            console.log("get login")
            let userDetails = ''
            const type = req.query.type || ""
            const message = req.query.message || ""
            return res.render('user/login',{type, message, userDetails})
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error)
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
            return res.redirect('/login')
        });
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}


//To get the user home
const getHome = async (req, res) => {
    try {
        console.log("Home api start")
        const currentDate = new Date();
        const homeCarousel = await HomeCarousel.find({ isBlocked: false });

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

        console.log("bestSelingProducts : ",bestSellingProducts)
        const category = await Category.find({isBlocked : false})
        const coupon = await Coupon.find({ isBlocked : false})
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

        return res.render('user/home',{userDetails , homeCarousel , bestSellingProducts , category  , coupon : validCoupons })
    } catch (error) {
        console.log(error)
        return res.redirect('/errorPage')
    }
}

//To get the user register page
const getRegister = async (req, res) => {
    try {
        let userDetails = req.session.userNC
        return res.render('user/registration', { type: "", message: "" , userDetails , cartItemCount})
    } catch (error) {
        console.log(error)
        return res.redirect('/errorPage')
    }
}

//To get the user otp page
const getotppage = async(req,res)=>{
    try{
        userDetails = req.session.userNC
        return res.render('user/otpvalidation',{type : "", message : "" , userDetails})
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
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
        }
        setTimeout(clearSaveOtp, 30000);
    }catch(error){
        console.log(error.message)
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
        console.log(error.message)
        return res.redirect('/errorPage')
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
        return res.redirect('/errorPage')
    }
}

//To upload profile image
const postUserProfileImage = async(req,res)=>{
    try{
        const userId = req.body.userId
        const user = await User.findById(userId)

        if(user.profileimage){
            existingimage = user.profileimage
            const imagePath = path.join(__dirname, "../public/images/UserProfile", existingimage);
            fs.unlinkSync(imagePath);
        }

        if(!req.file){
            return res.status(400).json({ message : "Image is not uploaded correctly"})
        }

        const updateUserImage = await User.findByIdAndUpdate(userId, {profileimage : req.file.filename})
        if (updateUserImage) {
            return res.status(200).json({ message: "Profile image uploaded successfully" });
        } else {
            return res.status(500).json({ message: "Failed to update profile image" });
        }
        
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

//To get the shop page
const getUserShop = async(req,res)=>{
    try{
        const productData = await Product.find({ $and : [ { isBlocked : false},{ noOfStock : { $gt : 0} } ] });
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
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}


// To get the categorized products
const getCatProduct = async(req,res)=>{
    try{
        let productData
        let prodId =[]
        let cartProdId = []

        if(!req.session.user){
            prodId = []
            cartProdId = []
        }else{
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
                console.log("cartProductId :",cartProdId)
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
                }
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

            productData = await Product.find(query).skip(skip).limit(perPage);
            const totalProducts = await Product.countDocuments(query);
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

            console.log(productData)

            return res.status(200).json({ message : "Categorized products", productData , totalPages , prodId , cartProdId})
        }else{
            return res.status(400).json({ message : "No categorized found" })
        }
    }catch(error){
        console.log(error.message)
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
        console.log(error.message)
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
            console.log(error.message);
            return res.redirect('/errorPage')
        }
    }

//To delete address from user profile
const postAddressDelete = async (req, res) => {
    try {
        const addressId = req.params.addressId;

        const deletedAddress = await Address.findByIdAndDelete(addressId);
        if (!deletedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }else{
            return res.status(200).json({ message: "Address deleted successfully" });
        }
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

//To post the updated address
const postUpdateUserAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        
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

    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')
    }
};

//To send the otp for changing password from user profile
const postOtpForChangePass = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateOtp();
        saveOtp = otp;

        function clearSaveOtp() {
            saveOtp = "";
        }
        setTimeout(clearSaveOtp, 30000);

        sendOtpMail(email, saveOtp);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')
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
        return res.redirect('/errorPage')
    }
}

//To change the password from user profile
const postUserNewPass = async (req, res) => {
    try {
        const { newPass, userId } = req.body;
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
        return res.redirect('/errorPage')
    }
};

//To get the forgot password page from login page
const getForgotPassword = async(req,res)=>{
    try{
        let userDetails = req.session.userNC
        return res.render('user/forgotPassword',{userDetails})
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

//To post the email for forgot password
const postForgotPasswordEmail = async(req,res)=>{
    try{
        const email = req.body.email
        enteredEmail = email
        const user = await User.findOne({ email : email})
        if(!user){
            return res.status(400).json({ message : "Email is not registered" })
        }else{
            const otp = generateOtp();
            saveOtp = otp;

            function clearSaveOtp() {
                saveOtp = "";
            }
            setTimeout(clearSaveOtp, 30000);

            sendOtpMail(email, saveOtp);

            return res.status(200).json({ message: "OTP has been sent to your email." });
        }
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
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
        return res.redirect('/errorPage')
    }
}

//To post the new password
const postForgotPasswordNewPass = async (req, res) => {
    try {
        const { newPassword } = req.body; 
     
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
        console.log(error.message)
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
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

const getUserNewAddressFromCheckout = async(req,res)=>{
    try{
        const userId = req.session.user._id
        let userDetails = req.session.userNC
        return res.render('user/addAddressFromCheckout',{userDetails , userId})
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

// To get the payment page
const getPaymentPage = async(req,res)=>{
    try{
        const currentDate = new Date();
        const addressId = req.params.selectedAddressId
        let userAddress = await Address.find({ _id : addressId})
        let userId = req.session.user._id
        let cart = await Cart.find({ userId : userId}).populate({
            path: "items.product",
            populate: { path: "brand" }
          });
        const userCart = cart[0]
        let coupon = await Coupon.find({isBlocked : false })

        return res.render('user/payment' , {userAddress , userCart , coupon})
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

// To get the order confirm page
const getPaymentSuccess = async(req,res)=>{
    try{
        let userDetails = req.session.userNC
        const userId = req.session.user._id
        const order = await Order.find({userId : userId})
        console.log("order :",order)
        const latestOrder = order.sort((a, b) => b.orderDate - a.orderDate)[0];
        console.log("latest order :",latestOrder)
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
        console.log(error.message)
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
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

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
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

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
    getProductDetail,
    getCatProduct,
    getCheckout,
    getUserNewAddressFromCheckout,
    getUserEditAddressFromCheckout,
    updateAddressFromCheckout,
    getPaymentPage,
    getPaymentSuccess,
    getErrorPage
}

