const express = require('express')
const adminRouter = express.Router()
const bodyParser = require('body-parser')
const upload = require("../middleware/multer");
const uploadproducts = require('../middleware/productMulter')

adminRouter.use(express.static('../public'))

adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended:true}));

const adminController = require('../controller/adminController')

adminRouter.get('/',adminController.getAdminlogin)

adminRouter.post('/login',adminController.postAdminlogin)

adminRouter.get('/home',adminController.getAdminHome)

adminRouter.get('/logout',adminController.getAdminLogout)

adminRouter.get('/users',adminController.getAdminUsers)

adminRouter.post('/blockUser:userId',adminController.adminBlockUser)

adminRouter.get("/category",adminController.getAdminCategory)

adminRouter.post('/addCategory', upload.single('categoryImg'),adminController.adminAddNewCategory)

adminRouter.post('/blockCategory:categoryId',adminController.adminBlockCategory)

adminRouter.get('/categoryEdit/:categoryId',adminController.getCategoryForEditing)

adminRouter.post('/update/:categoryId',upload.single('categoryImg'),adminController.updateCategory)

adminRouter.get('/products',adminController.getAdminProducts)

adminRouter.get('/adminAddProduct',adminController.getAdminAddProduct)

adminRouter.post('/addProduct', uploadproducts.array('productImages',12),adminController.postAdminAddProduct)

adminRouter.post('/blockProduct:productId',adminController.adminBlockProduct)

adminRouter.get('/editProduct:productId',adminController.adminEditProduct)

adminRouter.post('/deleteProductImage',adminController.adminDeleteProductImage)

adminRouter.post('/updateProduct/:productId',uploadproducts.array('productImages',12),adminController.adminUpdateProduct)

adminRouter.get('/homeCarousel',adminController.getAdminHomeCarousel)

module.exports = adminRouter