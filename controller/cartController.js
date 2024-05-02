const Product = require('../models/productModel')
const Cart = require('../models/cartModel')

let userDetails;

//To get the cart page
const getCartPage = async(req,res)=>{
    try{
        const userId = req.session.user._id
        userDetails = req.session.userNC
        // console.log("userDetails :",userDetails)
        let cart = await Cart.find({userId : userId}).populate({
            path: "items.product",
            populate: { path: "brand" }
          });

        if (!cart || cart.length === 0) {
            cart = [];
            return res.render('user/cart', { userDetails, cartItems: [], cart: []});
        }
        const cartItems = cart[0].items
        // console.log("User cart :", cart)
        // console.log("Cart items :",cartItems)
        res.render('user/cart' , {userDetails , cartItems , cart})
    }catch(error){
        console.log(error.message)
        // return res.status(500).json({ message : "Internal server error" })
        res.redirect('/errorPage')
    }
}

//To add a product to cart from shop or product detail page
const postProductToCartFromShop = async (req, res) => {
    try {  
        const userId = req.session.user._id;
        const productId = req.body.productId;
        let product = await Product.findById(productId);

        // Get the existing cart of the user
        let existingCart = await Cart.findOne({ userId: userId });

        if (existingCart !== null) {

            // Check if the product already exists in the cart
            const existingItem = existingCart.items.find(item => item.product.equals(productId));

            if (existingItem) {
                // If the product exists, update its quantity and prices
                console.log("Product already exist in your cart")
                return res.status(409).json({ message : "Already in your cart."})
                
                // existingItem.quantity++;
                // existingItem.totalPrice +=  product.offerPrice,
                // existingItem.discountPrice += product.realPrice * (product.discountPercentage / 100)
            } else {
                // If the product does not exist, add it to the cart
                existingCart.items.push({
                    product: productId,
                    quantity: 1,
                    price: product.offerPrice,
                    totalPrice: product.offerPrice,
                    discountPrice: product.realPrice * (product.discountPercentage / 100)
                });
            }
            // Update total cart price and total discount price
            existingCart.totalCartPrice = existingCart.items.reduce((total, item) => total + item.totalPrice, 0);
            existingCart.totalCartDiscountPrice = existingCart.items.reduce((total, item) => total + item.discountPrice, 0);

        } else {
            // If the cart does not exist, create a new cart
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
        
        await existingCart.save();
        req.session.userNC.cartItemCount = existingCart.items.length

        return res.status(200).json({ message: "Product added to your cart." });
    } catch (error) {
        console.log(error.message);
        // return res.status(500).json({  message: "Internal server error." });
        res.redirect('/errorPage')
    }
};

//To increment the quantity of the product from cart
const postCartProductQtyInc = async(req,res)=>{
    try{
                
        let userId = req.session.user._id;
        let productId = req.body.productId;

        let cart = await Cart.findOne({ userId : userId}).populate('items.product')

        //Find dthe prosuct to  increment quantity
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
        // return res.status(500).json({ message : "Internal server error" })
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

        //Find dthe prosuct to  increment quantity
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
        console.log(error.message)
        // return res.status(500).json({ success : false , message : "Internal server error" })
        res.redirect('/errorPage')
    }
}

//To delete a product from cart
const deleteProductFromCart = async(req,res)=>{
    try{
        console.log("req body:",req.body)
        const productId = req.body.productId
        const userId = req.session.user._id
        console.log("productId :",productId)
        console.log("userId :",userId)

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
        }

        cart.totalCartPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        cart.totalCartDiscountPrice = cart.items.reduce((total, item) => total + item.discountPrice, 0);
        await cart.save();
        return res.status(200).json({ success : true, message: "Product deleted from your cart ." });
    }catch(error){
        console.log(error.message)
        // return res.status(500).json({ success : false, message : "Internal server error." })
        res.redirect('/errorPage')
    }
}

module.exports = {
    getCartPage,
    postProductToCartFromShop,
    postCartProductQtyInc,
    postCartProductQtyDec,
    deleteProductFromCart
}