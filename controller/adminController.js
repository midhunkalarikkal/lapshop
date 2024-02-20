const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const HomeCarousel = require('../models/homeCarousel')
const fs = require('fs')
const path = require('path')

// To get the admin login page
const getAdminlogin = async (req, res) => {
    try {
        return res.render("admin/adminlogin", { title: "Lapshop admin", type: "", message: "" })
    } catch (error) {
        console.log(error.message)
    }
}

// To post the admin login data to server for checking and give access
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

// To get admin homepage
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

// To logout from admin page
const getAdminLogout = async (req, res) => {
    try {
        req.session.adminData = false
        res.render('admin/adminlogin', { title: "Lapdhop Admin", type: "success", message: "Logout successfully" })
    } catch (error) {
        console.log(error.message)
    }
}

// To get all users data in admin page
const getAdminUsers = async (req, res) => {
    try {
        if (req.session.adminData) {
            const userData = await User.find();
            return res.render('admin/adminUsersList', { title: "LapShop Admin",  users: userData })
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message)
    }
}


// To block a user by admin
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

// To get the category page
const getAdminCategory = async (req, res) => {
    try {
        if (!req.session.adminData) {
            return res.redirect('/admin')
        } else {
            const categoryData = await Category.find()
            return res.render("admin/adminCategoryList", { title: "LapShop Admin", category: categoryData })
        }
    } catch (error) {
        console.log(error.message)
    }
}

// To add a new category
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


// To block a category
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

// Edit category from admin category page
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

// To update the category
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

// To get the product page
const getAdminProducts = async(req,res)=>{
    try{
        if(req.session.adminData){
            const productData = await Product.find().populate('category')
            // const categoryData = await Category.find()
            return res.render('admin/adminProductsList',{title : "LapShop Admin" , productData})
        }else{
            return res.redirect('/admin')
        }
    }catch(error){
        console.log(error);
    }
}

// To get the Admin New Product adding page
const getAdminAddProduct = async(req,res)=>{
    try{
        if(req.session.adminData){
            const categories = await Category.find()
            return res.render('admin/adminAddProduct',{title : "LapShop Admin", categories , productAdded : false , productExists : false , error : false})
        }else{
            return res.redirect('/admin')
        }
    }catch(error){
        console.log("Error fetching category",error)
        res.status(500).json({ error : "Internal server error"})
    }
}

// To post the add product form data to database
const postAdminAddProduct = async(req,res)=>{
    try{
        if(req.session.adminData){
            const { productName , productBrand , productColour , productStock , 
                productRealPrice , productOfferPrice , productDiscountPercentage , 
                productCategory , productDescription} = req.body

                const productImages = req.files.map((file) => file.filename)
                
                const categories = await Category.find()
                
                // For checking the existing product
                const existingProduct = await Product.findOne({ name : productName , description : productDescription , colour : productColour})
                console.log(existingProduct)
                if(existingProduct){
                    for (const imageName of productImages) {
                        const imagePath = path.join(__dirname, "../public/images/ProductImages", imageName);
                        try {
                            await fs.promises.unlink(imagePath);
                        } catch (error) {
                            console.error("Error deleting image:", error);
                        }
                    }
                    return res.render('admin/adminAddProduct', {title : "LapShop Admin", productExists : true , productAdded : false , error : false , categories})
                }else{
                    const newProduct = new Product({
                        name: productName,
                        brand: productBrand,
                        description: productDescription,
                        colour: productColour,
                        category: productCategory,
                        noOfStock: productStock,
                        realPrice: productRealPrice,
                        offerPrice: productOfferPrice,
                        discountPercentage: productDiscountPercentage,
                        images: productImages
                    })

                    const productData = await newProduct.save()
                    return res.render('admin/adminAddProduct',{title : "LapShop Admin", productAdded : true , productExists : false , error : false , categories})
                    
                }
            }else{
                return res.redirect('/admin')
            }
        }catch(error){
            console.log("Error",error)
            res.status(500).json({ error : "Internal server error"})
    }
}

// To block or unblock a product by admin
const adminBlockProduct = async(req,res)=>{
    try {
        let product = await Product.findById({ _id : req.params.productId })
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" })
        } else {
            product.isBlocked = req.body.blockStatus === 'block';
            await product.save();
            return res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// To edit a specific product
const adminEditProduct = async(req,res)=>{
    try {
        const productId = req.params.productId;
        console.log(productId)
        const product = await Product.findById(productId);
        const categories = await Category.find()

        if (!product) {
            return res.status(404).json({ error: "product not found" });
        }
        return res.render('admin/adminEditProduct',{title : "LapShop Admin", productAdded : false , productExists : false , error : false,product , categories})
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}

//To delete a product image from pedit product page
const adminDeleteProductImage = async(req,res)=>{
    try{
        const productId = req.body.productId
        const imageName = req.body.productImage

        console.log(productId, imageName)

        const product = await Product.findById(productId)

        if(!product){
            res.status(404).json({ message: 'Product not found' });
        }else{
            product.images.splice(imageName,1)
            const imagePath = path.join(__dirname, "../public/images/ProductImages", imageName);
            try {
                await fs.promises.unlink(imagePath);
            } catch (error) {
                console.error("Error deleting image:", error);
            }
            await product.save()
            res.json({ message: 'Image deleted successfully' });
        }
    }catch(error){
        console.log(error.message)
        res.status(500).json({ message: 'Error occurred while deleting image' });
    }
}

// To Update a specific product from edit product page
const adminUpdateProduct = async(req,res)=>{
    try{
        
            const product = await Product.findById(req.params.productId)

            if(!product){
                return res.status(400).json({message : "Product not found"})
            }

            const { productName , productBrand , productColour , productStock , 
                productRealPrice , productOfferPrice , productDiscountPercentage , 
                productCategory , productDescription} = req.body


                product.name = productName;
                product.brand = productBrand;
                product.description = productDescription;
                product.colour = productColour;
                product.noOfStock = productStock;
                product.realPrice = productRealPrice;
                product.offerPrice = productOfferPrice;
                product.discountPercentage = productDiscountPercentage;
                product.category = productCategory;

                if(req.files){
                    req.files.forEach(file => {
                        product.images.push(file.filename)
                    })
                }

                await product.save()

                res.redirect('/admin/Products')
        
    }catch(error){
        console.log(error.message)
    }
}

// To get the Home carousel page
const getAdminHomeCarousel = async(req,res)=>{
    try{
        if(req.session.adminData){
            const homeCarousel = await HomeCarousel.find()
            return res.render('admin/adminHomeCarouselList',{ title : "LpShop Admin", homeCarousel})
        }else{
            res.redirect('/admin')
        }
    }catch{
        console.log(error.message)
    }
}

//To add a new home carousel
const postAdminHomeCarousel = async(req,res)=>{
    try{
        if (req.session.adminData) {
            const { homeCarouselTagline, homeCarouselDescription } = req.body;

            // Check if a file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: "No image uploaded" });
            }

            const existingHomeCarousel = await HomeCarousel.findOne({ tagline: homeCarouselTagline });
            if (existingHomeCarousel) {
                const imagePath = path.join(__dirname, "../public/images/HomeCarouselImages", req.file.filename);
                fs.unlinkSync(imagePath);
                return res.status(400).json({ error: "Home carousel already exists" });
            }

            const newHomeCarousel = new HomeCarousel({
                tagline: homeCarouselTagline,
                desc: homeCarouselDescription,
                image: req.file.filename
            });
            const savedHomeCarousel = await newHomeCarousel.save();
            return res.status(201).json({ message: "home Carousel added successfully" , data : savedHomeCarousel});
        } else {
            return res.redirect('/admin');
        }
    }catch(error){
        console.log(error.message)
    }
}

//To block home carousel by admin
const adminBlockHomeCarousel = async (req, res) => {
    try {
        const homeCarousel = await HomeCarousel.findById({_id : req.params.homeCarouselId});
        console.log(homeCarousel);

        if (!homeCarousel) {
            return res.status(404).json({ success: false, message: "Home carousel not found" });
        } else {
            homeCarousel.isBlocked = req.body.blockStatus === 'block';
            await homeCarousel.save();
            return res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

//To delete a home carousel
const adminDeleteHomeCarousel = async (req, res) => {
    try {
        if (req.session.adminData) {
            const homeCarousel = await HomeCarousel.findById(req.params.homeCarouselId);
            console.log(homeCarousel.image)
            if (!homeCarousel) {
                return res.status(404).json({ success: false, message: "Home carousel not found" });
            } else {
                const imagePath = path.join(__dirname, "../public/images/HomeCarousels", homeCarousel.image);
                fs.unlinkSync(imagePath);
                await HomeCarousel.findByIdAndDelete(req.params.homeCarouselId);
                return res.status(200).json({ success: true, message: "Home carousel deleted successfully" });
            }
        } else {
            return res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

//To edit a home carousel
const adminEditHomeCarousel = async(req,res)=>{
    try{
        if(req.session.adminData){
               const homeCarousel = await HomeCarousel.findOne({_id : req.params.homeCarouselId})
               console.log(homeCarousel)
               if(!homeCarousel){
                    return res.status(404).json({success : false, message : "Home carousel not found"})
               }else{
                    return res.render('admin/adminEditHomeCarousel',{title : "LapShop Admin",homeCarousel})
               } 
        }else{
            return res.redirect('/admin')
        }

    }catch(error){
        console.log(error.message)
        return res.status(500).json({ success: false, message: "Internal server error" });

    }
}

//To update the edited home carousel
const adminUpdateHomeCarousel = async(req,res)=>{
    try {
        const { homeCarouselTagline, homeCarouselDesc } = req.body;

        const hcId = req.params.homeCarouselId;

         // Check if a file was uploaded with the request
         if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Check if home carousel exists
        const existingHomeCarousel = await HomeCarousel.findById(hcId);
        if (!existingHomeCarousel) {
            return res.status(404).json({ error: "Home Carousel not found" });
        }else{
            const oldImageFilename = existingHomeCarousel.image;
             // Update home carousel data
            existingHomeCarousel.tagline = homeCarouselTagline;
            existingHomeCarousel.desc = homeCarouselDesc;
            existingHomeCarousel.image = req.file.filename;
            await existingHomeCarousel.save();

            const imagePath = path.join(__dirname, "../public/images/HomeCarousels", oldImageFilename);
            fs.unlinkSync(imagePath);
            res.redirect('/admin/homeCarousel')
        }
    } catch (error) {
        console.error('Error updating home carousel', error);
        res.status(500).json({ error: "Internal server error" });
    }
}



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
    updateCategory,
    getAdminProducts,
    getAdminAddProduct,
    postAdminAddProduct,
    adminBlockProduct,
    adminEditProduct,
    adminDeleteProductImage,
    adminUpdateProduct,
    getAdminHomeCarousel,
    postAdminHomeCarousel,
    adminBlockHomeCarousel,
    adminDeleteHomeCarousel,
    adminEditHomeCarousel,
    adminUpdateHomeCarousel
    
}