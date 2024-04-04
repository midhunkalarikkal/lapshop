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

adminRouter.get('/',adminController.getAdminlogin)

adminRouter.post('/login',adminController.postAdminlogin)

adminRouter.get('/home',adminAuth.isAdminLoggedIn,adminController.getAdminHome)

adminRouter.get('/logout',adminController.getAdminLogout)

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

adminRouter.get('/coupons',adminAuth.isAdminLoggedIn,adminController.getAdminCoupon)

adminRouter.post('/AddNewCoupon',adminAuth.isAdminLoggedIn,adminController.postAdminCoupon)

adminRouter.get('/couponEdit/couponId',adminAuth.isAdminLoggedIn,adminController.adminEditCoupon)

module.exports = adminRouter