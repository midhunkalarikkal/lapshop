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
const reviewController = require('../controller/reviewController')

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
//To get otp page
userRouter.get('/getOtpPage',userController.getOtpPage);
//To verify otp and get the login page
userRouter.post('/otpverify',userController.postRegisterOtp)
//To logout user
userRouter.get('/logout',userAuth.isLoggedIn,userController.getLogout)
//To send otp for registration
userRouter.post('/sendotp',userController.sendOtp)

//To get user profile
userRouter.get('/userProfile',userAuth.isLoggedIn,userAuth.isBlocked,userController.getUserProfile)
//To post user updated info
userRouter.post('/updateUserInfo',userAuth.isLoggedIn,userAuth.isBlocked,userController.postUserUpdatedInfo)
//To add profile image
userRouter.post('/uploadProfileImage',userAuth.isLoggedIn,userAuth.isBlocked,uploadProfileImage.single('profileImg'),userController.postUserProfileImage)
//To get userAddress adding page from profile
userRouter.get('/addAddress/:userId',userAuth.isLoggedIn,userAuth.isBlocked,userController.getUserNewAddress)
//To save new address from profile
userRouter.post('/saveNewAddress',userAuth.isLoggedIn,userAuth.isBlocked,userController.postUserAddress)
//To delete address from profile
userRouter.delete('/deleteAddress/:addressId',userAuth.isLoggedIn,userAuth.isBlocked,userController.postAddressDelete)
//To get the address for updation
userRouter.get('/editAddress/:addressId',userAuth.isLoggedIn,userAuth.isBlocked,userController.getUserEditAddress)
//To update the edited address from profile
userRouter.post('/updateAddress/:addressId',userAuth.isLoggedIn,userAuth.isBlocked,userController.postUpdateUserAddress)
//To send otp for password changing from profile
userRouter.post('/sendOtpForPass',userAuth.isLoggedIn,userAuth.isBlocked,userController.postOtpForChangePass)
//To submit otp for password changing from profile
userRouter.post('/submitOtp',userAuth.isLoggedIn,userAuth.isBlocked,userController.checkOtpForChangePass)
//To update the changed password from profile
userRouter.post('/updatePassword',userAuth.isLoggedIn,userAuth.isBlocked,userController.postUserNewPass)
//To delete the profile image
userRouter.delete('/deleteUserProfileImage',userAuth.isLoggedIn,userAuth.isBlocked,userController.delteUserProfileImage)


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
//To get the contact page
userRouter.get('/contact',userController.getContactPage)
//To post contact formData
userRouter.post('/contactForm',userController.postContact);

//To get the wishlist page
userRouter.get('/wishlist',userAuth.isLoggedIn,userAuth.isBlocked,wishlistController.getWishlistPage)
//To add a produt to wishlist
userRouter.post('/addToWishlist',userAuth.isLoggedIn,userAuth.isBlocked,wishlistController.AddToWishlist)
//To delete a product from wishlist
userRouter.post('/deleteProductFromWishlist',userAuth.isLoggedIn,userAuth.isBlocked,wishlistController.deleteProductFromWishlist)
//To add a product to cart from wishlist
userRouter.post('/addProductToCartFromWishlist',userAuth.isLoggedIn,userAuth.isBlocked,wishlistController.postProductToCart)


//To get the cart page
userRouter.get('/cart',userAuth.isLoggedIn,userAuth.isBlocked,cartController.getCartPage)
//To add a product to cart from shop or product detail page
userRouter.post('/addProductToCartFromShop',userAuth.isLoggedIn,userAuth.isBlocked,cartController.postProductToCartFromShop)
//To increment cart item quantity
userRouter.post('/incrementCartProduct',userAuth.isLoggedIn,userAuth.isBlocked,cartController.postCartProductQtyInc)
//To decrement cart item quantity
userRouter.post('/decrementCartProduct',userAuth.isLoggedIn,userAuth.isBlocked,cartController.postCartProductQtyDec)
//To delete a product from cart
userRouter.post('/deleteProductFromCart',userAuth.isLoggedIn,userAuth.isBlocked,cartController.deleteProductFromCart)
//To move a cart product to save for later
userRouter.post('/saveForLater',userAuth.isLoggedIn,userAuth.isBlocked,cartController.postSaveForLater)
//To move a saveForLaterCart product to cart
userRouter.post('/moveToCartFromSaveForLater',userAuth.isLoggedIn,userAuth.isBlocked,cartController.moveFromSaveForLaterCartToCart)
//To delete a saveForLaterCart product
userRouter.post('/deleteFromSaveForLater',userAuth.isLoggedIn,userAuth.isBlocked,cartController.deleteFromSaveForLaterCart)


//To get the checkout page
userRouter.get('/checkout',userAuth.isLoggedIn,userAuth.isBlocked,userController.getCheckout)
//To add new address from checkout page
userRouter.get('/addAddressFromCheckout',userAuth.isLoggedIn,userAuth.isBlocked,userController.getUserNewAddressFromCheckout)
//To edit address from checkout page
userRouter.get('/editAddressFromCheckout/:addressId',userAuth.isLoggedIn,userAuth.isBlocked,userController.getUserEditAddressFromCheckout)
//To update address from checkout
userRouter.post('/updateAddressFromCheckout/:addressId',userAuth.isLoggedIn,userAuth.isBlocked,userController.updateAddressFromCheckout)

//To get the payment page
userRouter.get('/payment/:selectedAddressId',userAuth.isLoggedIn,userAuth.isBlocked,userController.getPaymentPage)
//To confirm order by paymnet
userRouter.post('/orderConfirmation',userAuth.isLoggedIn,userAuth.isBlocked,orderController.orderConfirmation)
//To place order after payment or cod
userRouter.get('/placeOrder',userAuth.isLoggedIn,userAuth.isBlocked,orderController.placeOrder)
//To get payment success page
userRouter.get('/paymentSuccess',userAuth.isLoggedIn,userAuth.isBlocked,userController.getPaymentSuccess)
//To download the order invoice
userRouter.get('/downloadInvoice/:orderId',userAuth.isLoggedIn,userAuth.isBlocked,orderController.downloadInvoice)
//To repayment if the payment failed
userRouter.get('/rePayment/:orderId',userAuth.isLoggedIn,userAuth.isBlocked,orderController.repayment)
//To confirm repayment order
userRouter.post('/rePaymentOrderConfirmation',userAuth.isLoggedIn,userAuth.isBlocked,orderController.repaymentOrderConfirm)
//To place order for the repayment
userRouter.get('/rePaymentPlaceOrder',userAuth.isLoggedIn,userAuth.isBlocked,orderController.rePaymentPlaceOrder)
//To request to return an order
userRouter.post("/returnOrder",userAuth.isLoggedIn,userAuth.isBlocked,orderController.userReturnOrder)

//To get the order page
userRouter.get('/orders',userAuth.isLoggedIn,userAuth.isBlocked,orderController.getOrders)
// To get the order detail page
userRouter.get('/orderDetail/:orderId',userAuth.isLoggedIn,userAuth.isBlocked,orderController.getOrderDetail)
//To cancel an order
userRouter.post('/cancelOrder',userAuth.isLoggedIn,userAuth.isBlocked,orderController.userCancelOrder)
//To apply coupon from payment page
userRouter.post('/applyCoupon',userAuth.isLoggedIn,userAuth.isBlocked,couponController.applyCoupon)
//To cancel applied coupon from payment page
userRouter.post('/cancelCoupon',userAuth.isLoggedIn,userAuth.isBlocked,couponController.cancelCoupon)
// To get track order page
userRouter.get('/trackOrder/:orderId',userAuth.isLoggedIn,userAuth.isBlocked,orderController.getTractOrder);

//To place order with wallet and razorpay
userRouter.post('/orderConfirmWithWalletAndRazorpay',userAuth.isLoggedIn,userAuth.isBlocked,orderController.orderConfirmWithWalletAndRazorpay)
//To get the wallet page
userRouter.get('/wallet',userAuth.isLoggedIn,userAuth.isBlocked,walletController.getUserWallet)

//To add a review
userRouter.post('/addProductReview/:productId/review', userAuth.isLoggedIn, userAuth.isBlocked, reviewController.addReview);
//To like or dislike review
userRouter.post('/review/:reviewId/like-dislike',userAuth.isLoggedIn, userAuth.isBlocked, reviewController.likeOrDislikeReview);

//To get the 505 error page
userRouter.get('/errorPage',userAuth.isLoggedIn,userAuth.isBlocked,userController.getErrorPage)


module.exports = userRouter

