const express = require('express')
const userRouter = express.Router()
const bodyParser = require('body-parser')
const uploadProfileImage = require('../middleware/userProfile')
const userAuth = require('../middleware/isUserLoggedIn')

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({extended:true}));

const userController = require('../controller/userController')
const cartController = require('../controller/cartController')
const wishlistController = require('../controller/wishlistController')
const orderController = require('../controller/orderController')
const couponController = require('../controller/couponController')
const walletController = require('../controller/walletController')

//To get home page
userRouter.get('/',userController.getHome)
//To get the login page
userRouter.get('/login',userController.getLogin)
//To post the user login data and give access to user home page
userRouter.post('/login',userController.postLogin)
//To get user register page
userRouter.get('/register',userController.getRegister)
//To post user registered data to otp page
userRouter.post('/register',userController.postRegister)
//To verify otp and get the login page
userRouter.post('/otpverify',userController.postRegisterOtp)
//To logout user
userRouter.get('/logout',userAuth.isUserLoggedIn,userController.getLogout)
//To get the otp page
userRouter.get('/otp',userController.getotppage)
//To resend otp
userRouter.post('/resendotp',userController.resendOtp)

//To get user profile
userRouter.get('/userProfile',userAuth.isUserLoggedIn,userController.getUserProfile)
//To post user updated info
userRouter.post('/updateUserInfo',userAuth.isUserLoggedIn,userController.postUserUpdatedInfo)
//To add profile image
userRouter.post('/uploadProfileImage',userAuth.isUserLoggedIn,uploadProfileImage.single('profileImg'),userController.postUserProfileImage)
//To get userAddress adding page from profile
userRouter.get('/addAddress/:userId',userAuth.isUserLoggedIn,userController.getUserNewAddress)
//To save new address from profile
userRouter.post('/saveNewAddress/:userId',userAuth.isUserLoggedIn,userController.postUserAddress)
//To delete address from profile
userRouter.delete('/deleteAddress/:addressId',userAuth.isUserLoggedIn,userController.postAddressDelete)
//To edit user address from profile
userRouter.get('/editAddress/:addressId',userAuth.isUserLoggedIn,userController.getUserEditAddress)
//To update the edited address from profile
userRouter.post('/updateAddress/:addressId',userAuth.isUserLoggedIn,userController.postUpdateUserAddress)
//To send otp for password changing from profile
userRouter.post('/sendOtpForPass',userAuth.isUserLoggedIn,userController.postOtpForChangePass)
//To submit otp for password changing from profile
userRouter.post('/submitOtp',userAuth.isUserLoggedIn,userController.checkOtpForChangePass)
//To update the changed password from profile
userRouter.post('/updatePassword',userAuth.isUserLoggedIn,userController.postUserNewPass)


//To get the forgot password page from login form
userRouter.get('/forgotPassword',userController.getForgotPassword)
//To send the email to server for sending the opt to the email from login
userRouter.post('/fpassPostEmail',userController.postForgotPasswordEmail)
//To send the otp to email from login
userRouter.post('/fpassPostOtp',userController.postForgotPasswordOtp)
//To update the new password from forgot password from login
userRouter.post('/fpassPostPassword',userController.postForgotPasswordNewPass)

//To get the product detailed page
userRouter.get('/productDetail/:productId',userController.getProductDetail)
//To get the shop page , this have a page query from the shop pagination
userRouter.get('/shop',userController.getUserShop)
//To get the categorizes products in shop page
userRouter.post('/shopCategoryId',userController.getCatProduct)


//To get the wishlist page
userRouter.get('/wishlist',userAuth.isUserLoggedIn,wishlistController.getWishlistPage)
//To add a produt to wishlist
userRouter.post('/addToWishlist',userAuth.isUserLoggedIn,wishlistController.AddToWishlist)
//To delete a product from wishlist
userRouter.post('/deleteProductFromWishlist',userAuth.isUserLoggedIn,wishlistController.deleteProductFromWishlist)
//To add a product to cart from wishlist
userRouter.post('/addProductToCartFromWishlist',userAuth.isUserLoggedIn,wishlistController.postProductToCart)


//To get the cart page
userRouter.get('/cart',userAuth.isUserLoggedIn,cartController.getCartPage)
//To add a product to cart from shop or product detail page
userRouter.post('/addProductToCartFromShop',userAuth.isUserLoggedIn,cartController.postProductToCartFromShop)
//To increment cart item quantity
userRouter.post('/incrementCartProduct',userAuth.isUserLoggedIn,cartController.postCartProductQtyInc)
//To decrement cart item quantity
userRouter.post('/decrementCartProduct',userAuth.isUserLoggedIn,cartController.postCartProductQtyDec)
//To delete a product from cart
userRouter.post('/deleteProductFromCart',userAuth.isUserLoggedIn,cartController.deleteProductFromCart)


//To get the checkout page
userRouter.get('/checkout',userAuth.isUserLoggedIn,userController.getCheckout)
//To add new address from checkout page
userRouter.get('/addAddressFromCheckout',userAuth.isUserLoggedIn,userController.getUserNewAddressFromCheckout)
//To edit address from checkout page
userRouter.get('/editAddressFromCheckout/:addressId',userAuth.isUserLoggedIn,userController.getUserEditAddressFromCheckout)
//To update address from checkout
userRouter.post('/updateAddressFromCheckout/:addressId',userAuth.isUserLoggedIn,userController.updateAddressFromCheckout)

//To get the payment page
userRouter.get('/payment/:selectedAddressId',userAuth.isUserLoggedIn,userController.getPaymentPage)
//To confirm order by paymnet
userRouter.post('/orderConfirmation',userAuth.isUserLoggedIn,orderController.orderConfirmation)
//To place order after payment or cod
userRouter.get('/placeOrder',userAuth.isUserLoggedIn,orderController.placeOrder)
//To get payment success page
userRouter.get('/paymentSuccess',userAuth.isUserLoggedIn,userController.getPaymentSuccess)

//To get the order page
userRouter.get('/orders',userAuth.isUserLoggedIn,orderController.getOrders)
// To get the order detail page
userRouter.get('/orderDetail/:orderId',userAuth.isUserLoggedIn,orderController.getOrderDetail)
//To cancel an order
userRouter.post('/cancelOrder',userAuth.isUserLoggedIn,orderController.userCancelOrder)
//To apply coupon from payment page
userRouter.post('/applyCoupon',userAuth.isUserLoggedIn,couponController.applyCoupon)
//To cancel applied coupon from payment page
userRouter.post('/cancelCoupon',userAuth.isUserLoggedIn,couponController.cancelCoupon)


//To place order with wallet and razorpay
userRouter.post('/orderConfirmWithWalletAndRazorpay',userAuth.isUserLoggedIn,orderController.orderConfirmWithWalletAndRazorpay)
//To get the wallet page
userRouter.get('/wallet',userAuth.isUserLoggedIn,walletController.getUserWallet)

//To get the 505 error page
userRouter.get('/errorPage',userAuth.isUserLoggedIn,userController.getErrorPage)

module.exports = userRouter