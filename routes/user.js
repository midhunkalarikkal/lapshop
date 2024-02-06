const express = require('express')
const userRouter = express.Router()
const bodyParser = require('body-parser')

userRouter.use(bodyParser.json())
userRouter.use(bodyParser.urlencoded({extended : true}))

const userController = require('../controller/user/userController')

userRouter.get('/login',userController.getLogin)
userRouter.get('/register',userController.getRegister)
userRouter.post('/register',userController.postRegister)
userRouter.get('/otp',userController.getOtp)
userRouter.post('/registerotp',userController.postOtp)
userRouter.get('/navbar',userController.getNavbar)
userRouter.get('/home',userController.getHome)
userRouter.post('/login',userController.postLogin)

module.exports = userRouter