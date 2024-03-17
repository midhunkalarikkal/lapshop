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

userRouter.get('/addAddress/:userId',userAuth.isUserLoggedIn,userController.getUserNewAddress)

userRouter.post('/saveNewAddress/:userId',userAuth.isUserLoggedIn,userController.postUserAddress)

userRouter.delete('/deleteAddress/:addressId',userAuth.isUserLoggedIn,userController.postAddressDelete)

userRouter.get('/editAddress/:addressId',userAuth.isUserLoggedIn,userController.getUserEditAddress)

userRouter.post('/updateAddress/:addressId',userAuth.isUserLoggedIn,userController.postUpdateUserAddress)

userRouter.post('/sendOtpForPass',userAuth.isUserLoggedIn,userController.postOtpForChangePass)

userRouter.post('/submitOtp',userAuth.isUserLoggedIn,userController.checkOtpForChangePass)

userRouter.post('/updatePassword',userAuth.isUserLoggedIn,userController.postUserNewPass)

userRouter.get('/forgotPassword',userAuth.isUserLoggedOut,userController.getForgotPassword)

userRouter.post('/fpassPostEmail',userAuth.isUserLoggedOut,userController.postForgotPasswordEmail)

userRouter.post('/fpassPostOtp',userAuth.isUserLoggedOut,userController.postForgotPasswordOtp)

userRouter.post('/fpassPostPassword',userAuth.isUserLoggedOut,userController.postForgotPasswordNewPass)

userRouter.get('/productDetail/:productId',userController.getProductDetail)

//To get the shop page , this have a page query from the shop pagination
userRouter.get('/shop',userController.getUserShop)

//To get the categorizes products in shop page
userRouter.post('/shopCategoryId',userController.getCatProduct)

//To get the wishlist page
userRouter.get('/wishlist',userAuth.isUserLoggedIn,userController.getWishlistPage)

//To add a produt to wishlist
userRouter.post('/addToWishlist',userAuth.isUserLoggedIn,userController.AddToWishlist)

//To delete a product from wishlist
userRouter.post('/deleteProductFromWishlist',userAuth.isUserLoggedIn,userController.deleteProductFromWishlist)

//To get the cart page
userRouter.get('/cart',userAuth.isUserLoggedIn,userController.getCartPage)

//To add a product to cart
userRouter.post('/addProductToCart',userController.postProductToCart)

//To increment cart item quantity
userRouter.post('/incrementCartProduct',userController.postCartProductQtyInc)

//To decrement cart item quantity
userRouter.post('/decrementCartProduct',userController.postCartProductQtyDec)

//To delete a product from cart
userRouter.post('/deleteProductFromCart',userController.deleteProductFromCart)

module.exports = userRouter