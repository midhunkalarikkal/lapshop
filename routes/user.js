const express = require('express')
const userRouter = express.Router()
const bodyParser = require('body-parser')

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({extended:true}));

const userController = require('../controller/user/userController')

userRouter.get('/',userController.getHome)
userRouter.get('/home',userController.getHome)

userRouter.get('/register',userController.getRegister)
userRouter.post('/register',userController.postRegister)

userRouter.get('/otp',userController.getRegisterOtp)
userRouter.post('/otpverify',userController.postRegisterOtp)

userRouter.get('/login',userController.getLogin)
userRouter.post('/login',userController.postLogin)

module.exports = userRouter