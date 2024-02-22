const express = require('express')
const userRouter = express.Router()
const bodyParser = require('body-parser')
const uploadProfileImage = require('../middleware/userProfile')

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({extended:true}));

const userController = require('../controller/userController')

//To get home page
userRouter.get('/',userController.getHome)
//To get user register page
userRouter.get('/register',userController.getRegister)
//To post user registered data to otp page
userRouter.post('/register',userController.postRegister)
//To verify otp and get the login page
userRouter.post('/otpverify',userController.postRegisterOtp)
//To get the login page
userRouter.get('/login',userController.getLogin)
//To post the user login data and give access to user home page
userRouter.post('/login',userController.postLogin)
//To logout user
userRouter.get('/logout',userController.getLogout)
//To get the otp page
userRouter.get('/otp',userController.getotppage)
//To resend otp
userRouter.post('/resendotp',userController.resendOtp)
//To get user profile
userRouter.get('/userProfile',userController.getUserProfile)
//To post user updated info
userRouter.post('/updateUserInfo',userController.postUserUpdatedInfo)
//To add profile image
userRouter.post('/uploadProfileImage',uploadProfileImage.single('profileImg'),userController.postUserProfileImage)

module.exports = userRouter