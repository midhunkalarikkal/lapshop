const Product = require('../models/productModel')
const Wishlist = require('../models/wishlistModel')
const Cart = require('../models/cartModel')

let userDetails;

// To get the wishlist page
const getWishlistPage = async(req,res)=>{
    try{
        let prodId = []
        let wishlistProducts = []
        userDetails = req.session.userNC
        const user = req.session.user
        const wishlist = await Wishlist.find({ userId : user._id})
        if(wishlist != ""){
            wishlistProducts = wishlist[0].products
            const productsId = wishlistProducts.map(item => item.product);
            prodId = productsId
        }
        const products = await Product.find({_id : {$in : prodId}}).populate("brand")
        res.render('user/wishlist', {userDetails , products ,wishlistProducts})
    }catch(error){
        console.log(error.message)
        // return res.status(500).json({ message : "Internal server error" })
        res.redirect('/errorPage')
    }
}

//To add and delete a product to and from a wishlist
const AddToWishlist = async(req,res)=>{
    try{
        const productId = req.body.productId
        console.log("product id :",productId)
        const userId = req.session.user._id
        
        const existingWishlist = await Wishlist.findOne({ userId: userId });

        if (existingWishlist) {
            const isProductInWishlist = existingWishlist.products.some(item => item.product.equals(productId));
            
            if (isProductInWishlist) {
                existingWishlist.products = existingWishlist.products.filter(item => !item.product.equals(productId));
                await existingWishlist.save();
                return res.status(200).json({ added: false, message: "Product deleted from your wishlist." });
            } else {
                existingWishlist.products.push({ product: productId });
                await existingWishlist.save();
                return res.status(200).json({ added: true, message: "Product added to your wishlist." });
            }
        } else {
            
            const newWishlist = new Wishlist({
                userId: userId,
                products: [{ product: productId }]
            });
            await newWishlist.save();
            return res.status(200).json({ message: "Product added to your wishlist." });
        }

    }catch(error){
        console.log(error.message)
        // return res.status(500).json({ message : "Internal server error" })
        res.redirect('/errorPage')
    }
}

//To delete a product from wishlist
const deleteProductFromWishlist = async(req,res)=>{
    try{
        const productId = req.body.productId
        const userId = req.session.user._id
        
        const wishlist = await Wishlist.findOneAndUpdate({ userId: userId },
            { $pull: { products: { product: productId } } },
            { new: true }
            );
    
            return res.status(200).json({ message: "Product deleted from wishlist ." });
    }catch(error){
        console.log(error.message)
        // return res.status(500).json({ message : "Internal server error." })
        res.redirect('/errorPage')
    }
}

//To add a product to cart
const postProductToCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.body.productId;
        
        let product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Get the existing cart of the user
        let existingCart = await Cart.findOne({ userId: userId });

        if (existingCart !== null) {

            const existingItem = existingCart.items.find(item => item.product.equals(productId));

            if (existingItem) {
                // If the product exists, update its quantity and prices
                if(existingItem.quantity >= product.noOfStock){
                    return res.status(409).json({ success : false, status : 409, message : "Selected quantity exceeds available stock"})
                }
                existingItem.quantity++;
                existingItem.totalPrice +=  product.offerPrice,
                existingItem.discountPrice += product.realPrice * (product.discountPercentage / 100)
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

        let cart = await Cart.findOne({ userId : userId})
        if(cart){
            req.session.userNC.cartItemCount = cart.items.length
        }

        return res.status(200).json({ success: true, message: "Product added to your cart." });
    } catch (error) {
        console.log(error.message);
        // return res.status(500).json({ success: false,  message: "Internal server  error" });
        res.redirect('/errorPage')
    }
};

module.exports = {
    getWishlistPage,
    AddToWishlist,
    deleteProductFromWishlist,
    postProductToCart
}