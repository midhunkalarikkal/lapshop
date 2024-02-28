const express = require('express')
const userRouter = express.Router()
const bodyParser = require('body-parser')
const uploadProfileImage = require('../middleware/userProfile')
const userAuth = require('../middleware/isUserLoggedIn')

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({extended:true}));

const userController = require('../controller/userController')

//To get home page
userRouter.get('/',userController.getHome)
//To get the login page
userRouter.get('/login',userAuth.isUserLoggedOut,userController.getLogin)
//To post the user login data and give access to user home page
userRouter.post('/login',userController.postLogin)
//To get user register page
userRouter.get('/register',userAuth.isUserLoggedOut,userController.getRegister)
//To post user registered data to otp page
userRouter.post('/register',userController.postRegister)
//To verify otp and get the login page
userRouter.post('/otpverify',userAuth.isUserLoggedOut,userController.postRegisterOtp)
//To logout user
userRouter.get('/logout',userAuth.isUserLoggedIn,userController.getLogout)
//To get the otp page
userRouter.get('/otp',userAuth.isUserLoggedOut,userController.getotppage)
//To resend otp
userRouter.post('/resendotp',userAuth.isUserLoggedOut,userController.resendOtp)
//To get user profile
userRouter.get('/userProfile',userAuth.isUserLoggedIn,userController.getUserProfile)
//To post user updated info
userRouter.post('/updateUserInfo',userAuth.isUserLoggedIn,userController.postUserUpdatedInfo)
//To add profile image
userRouter.post('/uploadProfileImage',userAuth.isUserLoggedIn,uploadProfileImage.single('profileImg'),userController.postUserProfileImage)

userRouter.get('/shop',userController.getUserShop)

userRouter.post('/addAddress',userAuth.isUserLoggedIn,userController.postUserAddress)

userRouter.delete('/deleteAddress/:addressId',userAuth.isUserLoggedIn,userController.postAddressDelete)

userRouter.get('/editAddress/:addressId',userAuth.isUserLoggedIn,userController.getUserEditAddress)

userRouter.post('/updateAddress/:addressId',userAuth.isUserLoggedIn,userController.postUpdateUserAddress)

module.exports = userRouter