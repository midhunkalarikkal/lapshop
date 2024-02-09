const express = require('express')
const adminRouter = express.Router()
const bodyParser = require('body-parser')

adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended:true}));

const adminController = require('../controller/adminController')

adminRouter.get('/',adminController.getadminlogin)

adminRouter.post('/login',adminController.postadminlogin)

adminRouter.get('/home',adminController.getAdminHome)

adminRouter.get('/logout',adminController.getadminLogout)

adminRouter.get('/users',adminController.getadminusers)

adminRouter.post('/block:userId',adminController.adminblockuser)

adminRouter.get("/category",adminController.getAdminCategory)

adminRouter.post('/addCategory',adminController.adminAddNewCategory)

module.exports = adminRouter