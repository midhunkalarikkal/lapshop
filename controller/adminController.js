const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

//To get the admin login page
const getAdminlogin = async (req, res) => {
    try {
        return res.render("admin/adminlogin", { title: "Lapshop admin", type: "", message: "" })
    } catch (error) {
        console.log(error.message)
    }
}

//To post the admin login data to server for checking and give access
const postAdminlogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(req.body)
        const adminData = {
            email: "admin@gmail.com",
            password: "admin123"
        };
        if (email == adminData.email && password == adminData.password) {
            req.session.adminData = adminData
            return res.render('admin/adminhome', { title: "LapShop Admin" });
        } else {
            return res.render("admin/adminlogin", { title: "Lapshop admin", type: "danger", message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//To get admin homepage
const getAdminHome = async (req, res) => {
    try {
        if (req.session.adminData) {
            return res.render("admin/adminhome", { title: "LapShop Admin" })
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message)
    }
}

//To logout from admin page
const getAdminLogout = async (req, res) => {
    try {
        req.session.adminData = false
        res.render('admin/adminlogin', { title: "Lapdhop Admin", type: "success", message: "Logout successfully" })
    } catch (error) {
        console.log(error.message)
    }
}

//To get all users data in admin page
const getAdminUsers = async (req, res) => {
    try {
        if (req.session.adminData) {
            const userData = await User.find();
            return res.render('admin/adminuserslist', { title: "LapShop Admin", type: "", message: "", users: userData })
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message)
    }
}


//To block a user by admin
const adminBlockUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isblocked = req.body.blockStatus === 'block';
        await user.save();
        return res.json({ success: true });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

//To get the category page
const getAdminCategory = async (req, res) => {
    try {
        if (!req.session.adminData) {
            return res.redirect('/admin')
        } else {
            const categoryData = await Category.find()
            return res.render("admin/adminCategory", { title: "LapShop Admin", category: categoryData })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//To add a new category
const adminAddNewCategory = async (req, res) => {
    try {
        if (req.session.adminData) {
            const { categoryName, categoryDesc } = req.body;

            // Check if a file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: "No image uploaded" });
            }

            const existingCategory = await Category.findOne({ name: categoryName });
            if (existingCategory) {
                const imagePath = path.join(__dirname, "../public/images/CategoryImages", req.file.filename);
                fs.unlinkSync(imagePath);
                return res.status(400).json({ error: "Category already exists" });
            }

            const newCategory = new Category({
                name: categoryName,
                desc: categoryDesc,
                image: req.file.filename
            });
            const savedCategory = await newCategory.save();
            return res.status(201).json({ message: "Category created successfully", data: savedCategory });
        } else {
            return res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


//To block a category
const adminBlockCategory = async (req, res) => {
    try {
        let category = await Category.findById({ _id: req.params.categoryId })
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" })
        } else {
            category.isBlocked = req.body.blockStatus === 'block';
            await category.save();
            return res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

//Edit category from admin category page
const getCategoryForEditing = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        return res.render('admin/adminEditCategory',{title : "LapShop Admin", category : category})
    } catch (error) {
        console.error('Error fetching category data:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//To update the category
const updateCategory = async (req, res) => {
    try {
        const { categoryName, categoryDesc } = req.body;
        const categoryId = req.params.categoryId;

         // Check if a file was uploaded with the request
         if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Check if category exists
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ error: "Category not found" });
        }else{
            const oldImageFilename = existingCategory.image;
             // Update category data
            existingCategory.name = categoryName;
            existingCategory.desc = categoryDesc;
            existingCategory.image = req.file.filename;
            await existingCategory.save();

            const imagePath = path.join(__dirname, "../public/images/CategoryImages", oldImageFilename);
            fs.unlinkSync(imagePath);
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = {
    getAdminlogin,
    postAdminlogin,
    getAdminHome,
    getAdminLogout,
    getAdminUsers,
    adminBlockUser,
    getAdminCategory,
    adminAddNewCategory,
    adminBlockCategory,
    getCategoryForEditing,
    updateCategory
}