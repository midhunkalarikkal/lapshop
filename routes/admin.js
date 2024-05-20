const express = require('express')
const adminRouter = express.Router()
const bodyParser = require('body-parser')
const upload = require("../middleware/multer");
const uploadproducts = require('../middleware/productMulter')
const uploadHomeCarousel = require('../middleware/homeCarouselMulter')
const uploadAdCarousel = require('../middleware/adCarouselMulter.js')
const uploadBrand = require('../middleware/brandMulter')
const adminAuth = require('../middleware/isAdminLoggedIn.js')

adminRouter.use(express.static('../public'))

adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended:true}));

const adminController = require('../controller/adminController')
const couponController = require('../controller/couponController')
const orderController = require('../controller/orderController')

adminRouter.get('/',adminAuth.isAdminLogout,adminController.getAdminlogin)
adminRouter.post('/login',adminAuth.isAdminLogout,adminController.postAdminlogin)
adminRouter.get('/logout',adminAuth.isAdminLoggedIn,adminController.getAdminLogout)
adminRouter.get('/home',adminAuth.isAdminLoggedIn,adminController.getAdminHome)

adminRouter.get('/users',adminAuth.isAdminLoggedIn,adminController.getAdminUsers)
adminRouter.post('/blockUser:userId',adminAuth.isAdminLoggedIn,adminController.adminBlockUser)

adminRouter.get("/category",adminAuth.isAdminLoggedIn,adminController.getAdminCategory)
adminRouter.post('/addCategory',adminAuth.isAdminLoggedIn,upload.single('categoryImg'),adminController.adminAddNewCategory)
adminRouter.post('/blockCategory:categoryId',adminAuth.isAdminLoggedIn,adminController.adminBlockCategory)
adminRouter.get('/categoryEdit/:categoryId',adminAuth.isAdminLoggedIn,adminController.getCategoryForEditing)
adminRouter.post('/update/:categoryId',adminAuth.isAdminLoggedIn,upload.single('categoryImg'),adminController.updateCategory)

adminRouter.get('/products',adminAuth.isAdminLoggedIn,adminController.getAdminProducts)
adminRouter.get('/adminAddProduct',adminAuth.isAdminLoggedIn,adminController.getAdminAddProduct)
adminRouter.post('/addProduct',adminAuth.isAdminLoggedIn,uploadproducts.array('productImages',12),adminController.postAdminAddProduct)
adminRouter.post('/blockProduct:productId',adminAuth.isAdminLoggedIn,adminController.adminBlockProduct)
adminRouter.get('/editProduct:productId',adminAuth.isAdminLoggedIn,adminController.adminEditProduct)
adminRouter.post('/deleteProductImage',adminAuth.isAdminLoggedIn,adminController.adminDeleteProductImage)
adminRouter.post('/updateProduct/:productId',adminAuth.isAdminLoggedIn,uploadproducts.array('productImages',12),adminController.adminUpdateProduct)

adminRouter.get('/homeCarousel',adminAuth.isAdminLoggedIn,adminController.getAdminHomeCarousel)
adminRouter.post('/addHomeCarousel',adminAuth.isAdminLoggedIn,uploadHomeCarousel.single('homeCarouselImage'),adminController.postAdminHomeCarousel)
adminRouter.post('/blockHomeCarousel/:homeCarouselId',adminAuth.isAdminLoggedIn,adminController.adminBlockHomeCarousel)
adminRouter.delete('/homeCarouselDelete/:homeCarouselId',adminAuth.isAdminLoggedIn,adminController.adminDeleteHomeCarousel)
adminRouter.get('/homeCarouselEdit/:homeCarouselId',adminAuth.isAdminLoggedIn,adminController.adminEditHomeCarousel)
adminRouter.post('/updateHomeCarousel/:homeCarouselId',adminAuth.isAdminLoggedIn,uploadHomeCarousel.single('homeCarouselImage'),adminController.adminUpdateHomeCarousel)

adminRouter.get('/brands',adminAuth.isAdminLoggedIn,adminController.getAdminBrands)
adminRouter.post('/addBrand',adminAuth.isAdminLoggedIn,uploadBrand.single('brandImg'),adminController.adminAddNewBrand)
adminRouter.post('/blockBrand/:brandId',adminAuth.isAdminLoggedIn,adminController.adminBlockBrand)
adminRouter.get('/brandEdit/:brandId',adminAuth.isAdminLoggedIn,adminController.adminEditBrand)
adminRouter.post('/updateBrand/:brandId',adminAuth.isAdminLoggedIn,uploadBrand.single('brandImage'),adminController.adminUpdateBrand)

adminRouter.get('/adCarousel',adminAuth.isAdminLoggedIn,adminController.getAdCarousel)
adminRouter.post('/addAdCarousel',adminAuth.isAdminLoggedIn,uploadAdCarousel.single('adCarouselImage'),adminController.postAdminAdCarousel)
adminRouter.post('/blockAdCarousel/:adCarouselId',adminAuth.isAdminLoggedIn,adminController.adminBlockAdCarousel)
adminRouter.delete('/adCarouselDelete/:adCarouselId',adminAuth.isAdminLoggedIn,adminController.adminDeleteAdCarousel)

adminRouter.get('/coupons',adminAuth.isAdminLoggedIn,couponController.getAdminCoupon)
adminRouter.post('/AddNewCoupon',adminAuth.isAdminLoggedIn,couponController.postAdminCoupon)
adminRouter.get('/couponEdit/:couponId',adminAuth.isAdminLoggedIn,couponController.adminEditCoupon)
adminRouter.post('/updateCoupon/:couponId',adminAuth.isAdminLoggedIn,couponController.adminUpdateCoupon)
adminRouter.post('/blockCoupon/:couponId',adminAuth.isAdminLoggedIn,couponController.adminBlockCoupon)

adminRouter.get('/orders',adminAuth.isAdminLoggedIn,orderController.adminGetOrders)
adminRouter.get('/adminOrderDetail/:orderId',adminAuth.isAdminLoggedIn,orderController.adminGetOrderDetail)
adminRouter.post('/updateOrderStatus',adminAuth.isAdminLoggedIn,orderController.changeOrderStatus)
adminRouter.post('/cancelOrder',adminAuth.isAdminLoggedIn,orderController.adminCancelOrder)
adminRouter.post('/returnAccept',adminAuth.isAdminLoggedIn,orderController.adminAcceptReturn)
adminRouter.post('/returnReject',adminAuth.isAdminLoggedIn,orderController.adminRejectReturn)

adminRouter.get('/salesReport',adminAuth.isAdminLoggedIn,adminController.salesReport)

adminRouter.get('/adminErrorPage',adminAuth.isAdminLoggedIn,adminController.adminErrorPage)

module.exports = adminRouter