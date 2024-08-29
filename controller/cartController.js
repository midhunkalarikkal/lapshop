const Product = require('../models/productModel')
const Cart = require('../models/cartModel')
const SaveForLaterCart = require('../models/saveForLaterCart')

//To get the cart page
const getCartPage = async(req,res)=>{
    try{
        const userId = req.session.user._id
        let userDetails = req.session.userNC

        let cart = await Cart.findOne({ userId: userId }).populate({
            path: "items.product",
            populate: { path: "brand" }
        });

        let saveForLaterCart = await SaveForLaterCart.findOne({ userId: userId }).populate({
            path: "items.product",
            populate: { path: "brand" }
        });
        
        if (!cart || cart === null) {
            cart = { items: [] , totalCartPrice: 0, totalCartDiscountPrice: 0 };
        }
        
        if (!saveForLaterCart || saveForLaterCart === null) {
            saveForLaterCart = { items: [] };
        }
        
        const cartItems = cart.items
        
        res.render('user/cart' , {userDetails , cartItems , cart , saveForLaterCart})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To add a product to cart from shop or product detail page
const postProductToCartFromShop = async (req, res) => {
    try {  
        const userId = req.session.user._id;
        const productId = req.body.productId;

        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: "Invalid request" });
        }

        let product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let existingCart = await Cart.findOne({ userId: userId });
        if (existingCart !== null) {
            existingCart.items.push({
                product: productId,
                quantity: 1,
                price: product.offerPrice,
                totalPrice: product.offerPrice,
                discountPrice: product.realPrice * (product.discountPercentage / 100)
            });
            
            existingCart.totalCartPrice = existingCart.items.reduce((total, item) => total + item.totalPrice, 0);
            existingCart.totalCartDiscountPrice = existingCart.items.reduce((total, item) => total + item.discountPrice, 0);

        } else {
            existingCart = new Cart({
                userId: userId,
                items: [{
                    product: productId,
                    quantity: 1,
                    price: product.offerPrice,
                    totalPrice: product.offerPrice,
                    discountPrice: product.realPrice * (product.discountPercentage / 100)
                }],
                totalCartPrice: product.offerPrice,
                totalCartDiscountPrice: product.realPrice * (product.discountPercentage / 100)
            });
        }
        
        req.session.userNC.cartItemCount = existingCart.items.length
        const updateCart = await existingCart.save();

        if(updateCart){
            return res.status(200).json({ success : true, message: "Product added to your cart." });
        }else{
            return res.status(400).json({ success : false, message: "Product adding to cart error." });
        }

    } catch (error) {
        res.redirect('/errorPage')
    }
};

//To increment the quantity of the product from cart
const postCartProductQtyInc = async(req,res)=>{
    try{
                
        let userId = req.session.user._id;
        let productId = req.body.productId;

        let cart = await Cart.findOne({ userId : userId}).populate('items.product')
        let product = cart.items.find(item => item.product._id.toString() === productId)

        if(product.quantity >= product.product.noOfStock){
            return res.status(409).json({ success : false , status : 409, message : "Selected quantity exceeds available stock"})
        }

        product.quantity++;
        product.totalPrice += product.product.offerPrice
        product.discountPrice += product.product.realPrice * (product.product.discountPercentage / 100)
        cart.totalCartPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        cart.totalCartDiscountPrice = cart.items.reduce((total, item) => total + item.discountPrice, 0);

        await cart.save()
        return res.status(200).json({ success : true , message : "Quantity incremented"})
  
    }catch(error){
        console.log(error)
        res.redirect('/errorPage')
    }
}

//To decrement the quantity of the product from cart
const postCartProductQtyDec = async(req,res)=>{
    try{
        let productId = req.body.productId
        const userId = req.session.user._id

        let cart = await Cart.findOne({ userId : userId}).populate('items.product')
        if(!cart){
            return res.status(404).json({ message : "Cart not found"})
        }

        let product = cart.items.find(item => item.product._id.toString() === productId)

        if(!product){
            return res.status(404).json({ success : false , message : "Product not found"})
        }

        product.quantity--;
        product.totalPrice -= product.product.offerPrice
        product.discountPrice -= product.product.realPrice * (product.product.discountPercentage / 100)
        cart.totalCartPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        cart.totalCartDiscountPrice = cart.items.reduce((total, item) => total + item.discountPrice, 0);

        await cart.save()
        return res.status(200).json({ success : true , message : "Quantity decremented"})
  
    }catch(error){
        res.redirect('/errorPage')
    }
}

//To delete a product from cart
const deleteProductFromCart = async(req,res)=>{
    try{
        const productId = req.body.productId
        const userId = req.session.user._id

        if(!productId){
            return res.status(404).json({ success : false, messagr : "Product deletion error , please try again."})
        }

        const cartDelProd = await Cart.findOneAndUpdate({ userId: userId },
            { $pull: { items: { product: productId } } },
            { new: true }
            );
            
        let cart = await Cart.findOne({ userId : userId})

        if (!cartDelProd) {
            return res.status(404).json({ success : false, message: "Cart not found." });
        }else{
            req.session.userNC.cartItemCount = cart.items.length
        }

        if(cart.items.length === 0){
            req.session.userNC.cartItemCount = 0
            cart.couponApplied = false
            cart.totalCartPrice = 0
            cart.couponAmount = 0
            cart.couponCode = ""
        }

        cart.totalCartPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        cart.totalCartDiscountPrice = cart.items.reduce((total, item) => total + item.discountPrice, 0);
        await cart.save();
        return res.status(200).json({ success : true, message: "Product deleted from your cart ." });
    }catch(error){
        res.redirect('/errorPage')
    }
}

//  To move the cart product to save for later
const postSaveForLater = async(req,res) => {
    try{
        const productId = req.body.productId
        const userId = req.session.user._id

        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: "Invalid request" });
        }

        if(!productId){
            return res.status(404).json({ success : false, message : "Product adding to save for later error , please try again."})
        }

        const cart = await Cart.findOne({ userId: userId, 'items.product': productId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Product not found in cart." });
        }

        const existingCart = await SaveForLaterCart.findOne({ userId: userId });
        if (existingCart && existingCart.items.some(item => item.product.toString() === productId)) {
            return res.status(400).json({ success: false, message: "Product is already saved for later." });
        }
        
        const saveForLaterCart = await SaveForLaterCart.findOneAndUpdate({ userId: userId },
            { $push: { items: { product: productId } } },
            { new: true, upsert : true}
            );
                
        if(!saveForLaterCart){
            return res.status(404).json({ success : false, message : "Saving for later failed, please try again."})
        }

        const updatedCart = await Cart.findOneAndUpdate(
            { userId: userId },
            { $pull: { items: { product: productId } } },
            { new: true }
        );

        if (!updatedCart) {
            return res.status(404).json({ success: false, message: "Failed to update cart." });
        }

        req.session.userNC.cartItemCount = updatedCart.items.length;

        if (updatedCart.items.length === 0) {
            updatedCart.couponApplied = false;
            updatedCart.totalCartPrice = 0;
            updatedCart.couponAmount = 0;
            updatedCart.couponCode = "";
        }

        updatedCart.totalCartPrice = updatedCart.items.reduce((total, item) => total + item.totalPrice, 0);
        updatedCart.totalCartDiscountPrice = updatedCart.items.reduce((total, item) => total + item.discountPrice, 0);

        await updatedCart.save();
        return res.status(200).json({ success : true, message: "Product saved for later use." });
    }catch(error){
        res.redirect('/errorPage')
    }
}

const moveFromSaveForLaterCartToCart = async(req,res) => {
    try{
        const productId = req.body.productId
        const userId = req.session.user._id

        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: "Invalid request" });
        }
        
        const existingSaveForLaterCart = await SaveForLaterCart.findOne({ userId: userId });
        if (!existingSaveForLaterCart || !existingSaveForLaterCart.items.some(item => item.product.toString() === productId)) {
            return res.status(400).json({ success: false, message: "Product is not saved for later." });
        }
        
        const saveForLaterCart = await SaveForLaterCart.findOneAndUpdate({ userId: userId },
            { $pull: { items: { product: productId } } },
            { new: true}
            );
                
        if(!saveForLaterCart){
            return res.status(404).json({ success : false, message : "Moving product to cart is failed, please try again."})
        }

        let product = await Product.findOne({ _id : productId, isBlocked : false})

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if(product.noOfStock === 0){
            return res.status(404).json({ success: false, message: "Sorry, this product is out of stock." });
        }

        let existingCart = await Cart.findOne({ userId: userId });
        if (existingCart !== null) {
            existingCart.items.push({
                product: productId,
                quantity: 1,
                price: product.offerPrice,
                totalPrice: product.offerPrice,
                discountPrice: product.realPrice * (product.discountPercentage / 100)
            });
            
            existingCart.totalCartPrice = existingCart.items.reduce((total, item) => total + item.totalPrice, 0);
            existingCart.totalCartDiscountPrice = existingCart.items.reduce((total, item) => total + item.discountPrice, 0);

        } else {
            existingCart = new Cart({
                userId: userId,
                items: [{
                    product: productId,
                    quantity: 1,
                    price: product.offerPrice,
                    totalPrice: product.offerPrice,
                    discountPrice: product.realPrice * (product.discountPercentage / 100)
                }],
                totalCartPrice: product.offerPrice,
                totalCartDiscountPrice: product.realPrice * (product.discountPercentage / 100)
            });
        }
        
        req.session.userNC.cartItemCount = existingCart.items.length
        const updateCart = await existingCart.save();

        if(updateCart){
            return res.status(200).json({ success : true, message: "Product moved to your cart." });
        }else{
            return res.status(400).json({ success : false, message: "Product moving to cart failed, please try again." });
        }

    }catch(error){
        res.redirect('/errorPage')
    }
}

module.exports = {
    getCartPage,
    postProductToCartFromShop,
    postCartProductQtyInc,
    postCartProductQtyDec,
    deleteProductFromCart,
    postSaveForLater,
    moveFromSaveForLaterCartToCart
}