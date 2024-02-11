const express = require('express')
const adminRouter = express.Router()
const bodyParser = require('body-parser')
const upload = require("../middleware/multer");

adminRouter.use(express.static('../public'))

adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended:true}));

const adminController = require('../controller/adminController')

adminRouter.get('/',adminController.getAdminlogin)

adminRouter.post('/login',adminController.postAdminlogin)

adminRouter.get('/home',adminController.getAdminHome)

adminRouter.get('/logout',adminController.getAdminLogout)

adminRouter.get('/users',adminController.getAdminUsers)

adminRouter.post('/block:userId',adminController.adminBlockUser)

adminRouter.get("/category",adminController.getAdminCategory)

adminRouter.post('/addCategory', upload.single('categoryImg'),adminController.adminAddNewCategory)

adminRouter.post('/categoryblock:categoryId',adminController.adminBlockCategory)


module.exports = adminRouter