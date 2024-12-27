const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const HomeCarousel = require('../models/homeCarousel')
const AdCarousel = require('../models/adCarousel')
const Brand = require('../models/brandModel')
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const fs = require('fs')
const path = require('path')


// To get the admin login page
const getAdminlogin = async (req, res) => {
    try {
        return res.render("admin/adminLogin", { type: "", message: "" })
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

// To post the admin login data to server for checking and give access
const postAdminlogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const adminData = {
            email: "admin@gmail.com",
            password: "Admin,./"
        };
        if (email == adminData.email && password == adminData.password) {
            req.session.adminData = adminData
            return res.redirect('/admin/home');
        } else {
            return res.render("admin/adminLogin", { type: "danger", message: "Invalid credentials" })
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

// To return the daily order data
const getDailyDeliveredOrders = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
        {
        $match: {
            status: "Delivered",
            orderDate: {
            $gte: startOfDay,
            $lt: endOfDay,
            },
        },
        },
        {
        $group: {
            _id: {
            $hour: {
                date: "$orderDate",
                timezone: "Asia/Kolkata",
            },
            },
            count: { $sum: 1 },
        },
        },
        { $sort: { _id: 1 } },
        {
            $project: {
            _id: 0,
            hour: "$_id",
            count: 1,
            },
        },
    ])
    
      return result;
  };

  // To return the weekly order data
  const getWeeklyDeliveredOrders = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    const result = await Order.aggregate([
        { $match: {
            orderDate: { $gte: oneWeekAgo },
            status: "Delivered"
          }
        },
        { $addFields: {
            dayOfWeek: { $dayOfWeek: "$orderDate" }
          }
        },
        { $group: {
            _id: {
                dayOfWeek: "$dayOfWeek"
            },
            count: { $sum: 1 }
            }
        },
        {
            $project : {
                _id : 0,
                dayOfWeek : "$_id.dayOfWeek",
                count : 1
            }
        },
        { $sort: {
            "dayOfWeek": 1
            }
        }
      ]);
  
    return result;
  };

// To retun the monthly order data
  const getMonthlyDeliveredOrders = async () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await Order.aggregate([
        { $match: {
            orderDate: { $gte: oneYearAgo },
            status: "Delivered"
          }
        },
        { $group: {
            _id: {
                year: { $year: "$orderDate" },
                month: { $month: "$orderDate" }
            },
            count: { $sum: 1 }
            }
        },
        {
            $project : {
                _id : 0,
                month : "$_id.month",
                count : 1
            }
        },
        { $sort: {
            "_id.year": -1,
            "_id.month": -1
            }
        }
    ]);

    return result
};

// To return best selling products
const bestSellingProducts = async () => {
    const result = await Order.aggregate([
        { 
            $match : {
                status : "Delivered"
            }
        },
        {
            $unwind: "$orderedItems"
        },
        {
            $group: {
                _id: "$orderedItems.product",
                count: { $sum: "$orderedItems.quantity" }
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $project: {
                _id: 0,
                name: "$product.name",
                count: 1
            }
        },
        {
            $sort: { 
                count: -1 
            }
        }
    ])

    return result 
};


// To return best selling categories
const bestSellingCategories = async () => {
    const result = await Order.aggregate([
        { $match : 
            {
                status : "Delivered"
            }
        },
        {
            $lookup: {
              from: 'products',
              localField: 'orderedItems.product',
              foreignField: '_id',
              as: 'products'
            }
          },
          {
            $unwind: '$products'
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'products.category',
              foreignField: '_id',
              as: 'categories'
            }
          },
          {
            $unwind: '$categories'
          },
          {
            $group: {
              _id: '$categories.name',
              count: { $sum: 1 }
            }
          },
          {
            $project : {
                _id : 0,
                category : "$_id",
                count : "$count"
            }
          },
          {
            $sort: { count: -1 }
          }
    ])

    return result
};

// To return best selling brands
const bestSellingBrands = async () => {
    const result = await Order.aggregate([
        {
            $match : {
                status : "Delivered"
            }
        },
        {
            $lookup: {
              from: 'products',
              localField: 'orderedItems.product',
              foreignField: '_id',
              as: 'products'
            }
          },
          {
            $unwind: '$products'
          },
          {
            $lookup: {
              from: 'brands',
              localField: 'products.brand',
              foreignField: '_id',
              as: 'brand'
            }
          },
          {
            $unwind: '$brand'
          },
          {
            $group: {
              _id: '$brand.name',
              count: { $sum: 1 }
            }
          },
          {
            $project : {
                _id : 0,
                brand : "$_id",
                count : "$count"
            }
          },
          {
            $sort: { count: -1 }
          }
    ])
    return result 
};

// To get admin homepage
const getAdminHome = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments()
        const currentTraffic = await User.countDocuments({ loggedIn : true })
        const blockedUsers = await User.countDocuments({ isblocked : true })
        
        const totalBrands = await Brand.countDocuments()
        const blockedBrands = await Brand.countDocuments({ isBlocked : true })

        const totalProducts = await Product.countDocuments()
        const blockedProducts = await Product.countDocuments({ isBlocked : true})

        const totalCoupons = await Coupon.countDocuments()
        const blockedCoupons = await Coupon.countDocuments({ isBlocked : true })

        const totalOrders = await Order.find({ status : "Delivered"}).countDocuments()

        const totalCategories = await Category.countDocuments()
        const blockedCategories = await Category.countDocuments({ isBlocked : true })

        const totalHomeCarousels = await HomeCarousel.countDocuments()
        const blockedHomeCarousels = await HomeCarousel.countDocuments({ isBlocked : true })

        const totalAdCarousels = await AdCarousel.countDocuments()
        const blockedAdCarousels = await AdCarousel.countDocuments({ isBlocked : true })

        const totalRevenue = await Order.aggregate([
            { $match : { status : "Delivered" } },
            { $group : { _id : null, totalRevenue : { $sum : "$orderTotal"} } }
        ])

        const revenue = totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0

        let razorpayCount = 0;
        let codCount = 0;
        let walletCount = 0;
        let walletWithRazorpayCount = 0;

        const [dailyOrders, weeklyOrders, monthlyOrders , bsProds , bsCats , bsBrands] = await Promise.all([
            getDailyDeliveredOrders(),
            getWeeklyDeliveredOrders(),
            getMonthlyDeliveredOrders(),
            bestSellingProducts(),
            bestSellingCategories(),
            bestSellingBrands()
        ]);

        const orders = await Order.find({status : "Delivered"})
        orders.forEach(order => {
            switch (order.paymentMethod) {
                case 'razorpay':
                    razorpayCount++;
                    break;
                case 'cod':
                    codCount++;
                    break;
                case 'wallet':
                    walletCount++;
                    break;
                case 'wallet with razorpay':
                    walletWithRazorpayCount++;
                    break;
                default:
                    break;
                }
        });

        let topBoxData = { totalUsers , totalOrders  , totalCategories  , totalBrands  , totalCoupons  
            , currentTraffic , revenue , blockedUsers , blockedBrands , blockedCoupons , blockedCategories 
            , totalHomeCarousels , blockedHomeCarousels , totalAdCarousels , blockedAdCarousels , totalProducts , blockedProducts}
        let paymentCount = {razorpayCount , codCount , walletCount , walletWithRazorpayCount }
        let timedOrders = {dailyOrders , weeklyOrders , monthlyOrders }

        return res.render("admin/adminHome", { topBoxData , paymentCount , timedOrders , bsProds , bsCats , bsBrands })
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

const getDailyData = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return await Order.find({
      status : "Delivered",
      statusDate : { $gte: startOfDay },
    }).populate("userId");
  };
  
  const getWeeklyData = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return await Order.find({
        status : "Delivered",
        statusDate : { $gte: oneWeekAgo },
    }).populate("userId");
  };
  
  const getMonthlyData = async () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getMonth() - 12);
    return await Order.find({
        status : "Delivered",
        statusDate : { $gte: oneYearAgo },
    }).populate("userId");
  };

  const getYearlyData = async () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return await Order.find({
        status : "Delivered",
        statusDate : { $gte: oneYearAgo },
    }).populate("userId");
  };

// To send the sales report
const salesReport = async (req, res, next) => {
    try {
        let salesData;
  
        if (req.query.startDate && req.query.endDate) {
            const startDate = new Date(req.query.startDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(req.query.endDate);
            endDate.setHours(23, 59, 59, 999);
    
            salesData = await Order.find({
                status : "Delivered",
                statusDate : { $gte: startDate, $lte: endDate },
            }).populate("userId");
        } else {
            switch (req.query.timePeriod) {
            case "daily":
                salesData = await getDailyData();
                break;
            case "weekly":
                salesData = await getWeeklyData();
                break;
            case "monthly":
                salesData = await getMonthlyData();
                break;
            case "yearly":
                salesData = await getYearlyData();
                break;
            default:
                break;
            }
        }
    res.json({ salesData });
    } catch (error) {
      next(error);
    }
  };
  

// To logout from admin page
const getAdminLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.redirect('/admin/adminErrorPage');
            }
            return res.redirect(`/admin/`)
        })
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

// To get all users data in admin page
const getAdminUsers = async (req, res) => {
    try {
        const userData = await User.find();
        return res.render('admin/adminUsersList', { users: userData })
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
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
        return res.redirect('/admin/adminErrorPage')
    }
}

// To get the category page
const getAdminCategory = async (req, res) => {
    try {
        const categoryData = await Category.find()
        return res.render("admin/adminCategoryList", { category: categoryData })
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

// To add a new category
const adminAddNewCategory = async (req, res) => {
    try {
        const { categoryName, categoryDesc } = req.body;
        if(!categoryName){
            return res.status(400).json({ success : false, message : "Data adding error." });
        }

        if(!categoryDesc){
            return res.status(400).json({ success : false, message : "Data adding error." });
        }

        if (!req.file) {
            return res.status(400).json({ success : false, message : "No image uploaded" });
        }
            
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, "i") } });
        if (existingCategory) {
            const imagePath = path.join(__dirname, "../public/images/CategoryImages", req.file.filename);
            fs.unlinkSync(imagePath);
            return res.status(409).json({ success : false, message : "Category already exists" });
        }

        const newCategory = new Category({
            name: categoryName,
            desc: categoryDesc,
            image: req.file.filename
        });

        const savedCategory = await newCategory.save();
        if(savedCategory){
            return res.status(200).json({ success : true, message: "Category created successfully" });
        }else{
            return res.status(500).json({ success : false, message: "Category created successfully" });
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

// To block a category
const adminBlockCategory = async (req, res) => {
    try {
        let category = await Category.findById({ _id: req.params.categoryId })
        if (!category) {
            return res.status(400).json({ success: false, message: "Category not found" })
        } else {
            category.isBlocked = req.body.blockStatus === 'block';
            const saveCategory =  await category.save();
            if(saveCategory){
                return res.status(200).json({ success: true, message : "Category status changed successfully." });
                }else{
                return res.status(500).json({ success: false, message : "Category status changing error." });
            }
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

// Edit category from admin category page
const getCategoryForEditing = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId);
        return res.render('admin/adminEditCategory',{ category : category })
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
};

// To update the category
const updateCategory = async (req, res) => {
    try {
        const { categoryId, categoryName, categoryDesc } = req.body;
        if (!categoryId || !categoryName || !categoryDesc) {
            return res.status(400).json({ success: false, message: "Form data fetching error." });
        }

        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            return res.status(400).json({ success : false, message: "Category not found" });
        }else{
            const oldImageFilename = existingCategory.image;
            if (req.file) {
                existingCategory.image = req.file.filename
                const imagePath = path.join(__dirname, "../public/images/CategoryImages", oldImageFilename);
                fs.unlinkSync(imagePath);
            }
             
            existingCategory.name = categoryName;
            existingCategory.desc = categoryDesc;
            const updateCategory = await existingCategory.save();
            if(updateCategory){
                return res.status(200).json({ success : true, message : "Category updated successfully."})
            }else{
                return res.status(500).json({ success : false, message : "Category updating failed."})
            }
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
};

// To get the product page
const getAdminProducts = async(req,res)=>{
    try{
        const productData = await Product.find().populate([ {path : "category"},{path : "brand"}])
        return res.render('admin/adminProductsList',{ productData })
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

// To get the Admin New Product adding page
const getAdminAddProduct = async(req,res)=>{
    try{
        const categories = await Category.find({ isBlocked: false })
        const brands = await Brand.find({ isBlocked: false })
        return res.render('admin/adminAddProduct',{ categories , brands , productAdded : false , productExists : false , error : false })
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

// To post the add product formdata to database
const postAdminAddProduct = async(req,res)=>{
    try{        
        const { productName , productBrand , productColour , productStock , 
            productRealPrice , productOfferPrice , productDiscountPercentage , 
            productCategory , productDescription} = req.body
            
        const existingProduct = await Product.findOne({ name : productName , description : productDescription , colour : productColour})
           
        if(existingProduct){
            for (const imageName of req.files) {
                const imagePath = path.join(__dirname, "../public/images/ProductImages", imageName);
                try {
                    await fs.promises.unlink(imagePath);
                } catch (error) {
                    return res.status(400).json({ success : false , message : "Image deletion error."})
                }
            }
            return res.status(400).json({ success : false , message : "Product already exist"})
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
                images: req.files.map(file => file.filename)
            })

            await newProduct.save()
            return res.status(200).json({ success : true , message : "Product Added successfully."})
        }
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

// To block or unblock a product by admin
const adminBlockProduct = async(req,res)=>{
    try {
        const productId = req.params.productId
        if(!productId){
            return res.status(404).json({ success: false, message: "Product not found" })
        }

        let product = await Product.findById({ _id : productId })
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" })
        } else {
            product.isBlocked = req.body.blockStatus === 'block';
            await product.save();
            return res.json({ success: true, message : "Block status updated successfully" });
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

// To edit a specific product
const adminEditProduct = async(req,res)=>{
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        const categories = await Category.find({ isBlocked: false })
        const brands = await Brand.find({ isBlocked: false })

        return res.render('admin/adminEditProduct',{ productAdded : false , productExists : false , error : false,product , categories , brands })
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

//To delete a product image from edit product page
const adminDeleteProductImage = async(req,res)=>{
    try{
        const productId = req.body.productId
        const imageName = req.body.productImage

        const product = await Product.findById(productId)
        if(!product){
            res.status(404).json({ message: 'Product not found' });
        }else{
            await Product.findOneAndUpdate(
                { _id: productId }, 
                { $pull: { images: imageName } },
                { new: true } 
              )
            const imagePath = path.join(__dirname, "../public/images/ProductImages", imageName);
            try {
                await fs.promises.unlink(imagePath);
            }catch{
                return res.status(400).json({ success : false , message : "Image deletion error."})
            }
            await product.save()
            return res.status(200).json({ success : true , message : "Image deleted successfully."})
        }
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

// To Update a specific product from edit product page
const adminUpdateProduct = async(req,res)=>{
    try{
        const product = await Product.findById(req.params.productId)
        if(!product){
            return res.status(400).json({ success : false ,  message : "Product not found"})
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
        return res.status(200).json({ success : true , message : "Product updated successfully."})
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

// To get the Home carousel page
const getAdminHomeCarousel = async(req,res)=>{
    try{
         const homeCarousel = await HomeCarousel.find()
        return res.render('admin/adminHomeCarouselList',{ homeCarousel })
    }catch{
        return res.redirect('/admin/adminErrorPage')
    }
}

//To add a new home carousel
const postAdminHomeCarousel = async(req,res)=>{
    try{
        const { homeCarouselTagline, homeCarouselDescription } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const existingHomeCarousel = await HomeCarousel.findOne({ tagline: homeCarouselTagline });
        if (existingHomeCarousel) {
            const imagePath = path.join(__dirname, "../public/images/HomeCarousels", req.file.filename);
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
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

//To block home carousel by admin
const adminBlockHomeCarousel = async (req, res) => {
    try {
        const homeCarousel = await HomeCarousel.findById({_id : req.params.homeCarouselId});
        if (!homeCarousel) {
            return res.status(404).json({ success: false, message: "Home carousel not found" });
        } else {
            homeCarousel.isBlocked = req.body.blockStatus === 'block';
            await homeCarousel.save();
            return res.json({ success: true });
        }
    } catch(error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

//To delete a home carousel
const adminDeleteHomeCarousel = async (req, res) => {
    try {
        const homeCarousel = await HomeCarousel.findById(req.params.homeCarouselId);
        if (!homeCarousel) {
            return res.status(404).json({ success: false, message: "Home carousel not found" });
        } else {
            const imagePath = path.join(__dirname, "../public/images/HomeCarousels", homeCarousel.image);
            fs.unlinkSync(imagePath);
            await HomeCarousel.findByIdAndDelete(req.params.homeCarouselId);
            return res.status(200).json({ success: true, message: "Home carousel deleted successfully" });
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
};

//To edit a home carousel
const adminEditHomeCarousel = async(req,res)=>{
    try{
        const homeCarousel = await HomeCarousel.findOne({_id : req.params.homeCarouselId})
        return res.render('admin/adminEditHomeCarousel',{ homeCarousel })
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

//To update the edited home carousel
const adminUpdateHomeCarousel = async(req,res)=>{
    try {
        const { homeCarouselId, homeCarouselTagline, homeCarouselDescription } = req.body;

        const existingHomeCarousel = await HomeCarousel.findById(homeCarouselId);
        if (!existingHomeCarousel) {
            return res.status(404).json({ success : false, message: "Home Carousel not found" });
        }else{
            if( existingHomeCarousel.tagline === homeCarouselTagline && existingHomeCarousel.desc === homeCarouselDescription && !req.file){
                return res.status(404).json({ success : false, info : true, message: "No updations made yet." });
            }
            existingHomeCarousel.tagline = homeCarouselTagline;
            existingHomeCarousel.desc = homeCarouselDescription;
            if(req.file){
                const imagePath = path.join(__dirname, "../public/images/HomeCarousels", existingHomeCarousel.image);
                fs.unlinkSync(imagePath);
                existingHomeCarousel.image = req.file.filename;
            }
            await existingHomeCarousel.save();
            res.status(200).json({ success: true, message: 'Home Carousel updated successfully.' });
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

// To get the Ad-carouselpage
const getAdCarousel = async(req,res)=>{
    try{
        const adCarousel = await AdCarousel.find()
        return res.render('admin/adminAdCarouselList',{ adCarousel })
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

//To add a new Advertisement carousel
const postAdminAdCarousel = async(req,res)=>{
    try{
        const { adCarouselName }  = req.body;

        if (!req.file) {
            return res.status(400).json({ success : false,  message : "No image uploaded" });
        }

        const existingAdCarousel = await AdCarousel.findOne({ name: adCarouselName });
        if (existingAdCarousel) {
            const imagePath = path.join(__dirname, "../public/images/AdCarousels", req.file.filename);
            fs.unlinkSync(imagePath);
            return res.status(400).json({ success : false, message : "Ad Carousel already exists" });
        }

        const newAdCarousel = new AdCarousel({
            name: adCarouselName,
            image: req.file.filename
        });

        const saveAdCarousel = await newAdCarousel.save();
        if(saveAdCarousel){
            return res.status(200).json({ success : true, message: "Ad Carousel added successfully" });
        }else{
            return res.status(400).json({ success : false, message: "AdCarousel adding failed." });
        }
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

//To block Advertisement carousel by admin
const adminBlockAdCarousel = async (req, res) => {
    try {
         if (!req.params.adCarouselId) {
            return res.status(400).json({ success: false, message: "Ad carousel ID is required" });
        }

        const adCarousel = await AdCarousel.findById({_id : req.params.adCarouselId});

        if (!adCarousel) {
            return res.status(404).json({ success: false, message: "Advertisement carousel not found" });
        } else {
            adCarousel.isBlocked = req.body.blockStatus === 'block';
            const savedAdCarousel = await adCarousel.save();
            if(savedAdCarousel) {
                return res.status(200).json({ success: true, message: "Advertisement Carousel block status has been updated successfully."});
            } else {
                return res.status(500).json({ success: false, message: "Failed to update advertisement carousel block status."});
            }
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

//To delete a Advertisement carousel
const adminDeleteAdCarousel = async (req, res) => {
    try {
        const adCarousel = await AdCarousel.findById(req.params.adCarouselId);
        if (!adCarousel) {
            return res.status(404).json({ success: false, message: "Advertisement carousel not found" });
        } else {
           const deleteAdCarousel =  await AdCarousel.findByIdAndDelete(req.params.adCarouselId);
           if(deleteAdCarousel){
                const imagePath = path.join(__dirname, "../public/images/AdCarousels", adCarousel.image);
               fs.unlinkSync(imagePath);
               return res.status(200).json({ success: true, message: "Advertisement carousel deleted successfully" });
            }else{
               return res.status(500).json({ success: false, message: "Advertisement carousel deleted successfully" });
            }
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
};

//To get the admin error page
const adminErrorPage = async(req,res)=>{
    try{
        return res.render('admin/adminErrorPage')
    }catch(error){
        console.log(error.message)
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
    adminUpdateHomeCarousel,
    getAdCarousel,
    postAdminAdCarousel,
    adminBlockAdCarousel,
    adminDeleteAdCarousel,
    adminErrorPage,
    salesReport
}