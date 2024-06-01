const Product = require('../models/productModel')
const Wishlist = require('../models/wishlistModel')
const Cart = require('../models/cartModel')

// To get the wishlist page
const getWishlistPage = async(req,res)=>{
    try{
        let prodId = []
        let wishlistProducts = []
        let userDetails = req.session.userNC
        const user = req.session.user
        const wishlist = await Wishlist.find({ userId : user._id})
        if(wishlist != ""){
            wishlistProducts = wishlist[0].products
            const productsId = wishlistProducts.map(item => item.product);
            prodId = productsId
        }
        const products = await Product.find({_id : {$in : prodId}}).populate("brand")
        return res.render('user/wishlist', {userDetails , products ,wishlistProducts})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To add and delete a product to and from a wishlist
const AddToWishlist = async(req,res)=>{
    try{
        const productId = req.body.productId
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
        return res.redirect('/errorPage')
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

        if(!wishlist){
            return res.status(400).json({ message: "Product deleting from wishlist is error." });
        }else{
            return res.status(200).json({ message: "Product deleted from wishlist." });
        }
    
    }catch(error){
        return res.redirect('/errorPage')
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

        let existingCart = await Cart.findOne({ userId: userId });

        if (existingCart !== null) {

            const existingItem = existingCart.items.find(item => item.product.equals(productId));

            if (existingItem) {
                if(existingItem.quantity >= product.noOfStock){
                    return res.status(409).json({ success : false, status : 409, message : "Selected quantity exceeds available stock"})
                }
                existingItem.quantity++;
                existingItem.totalPrice +=  product.offerPrice,
                existingItem.discountPrice += product.realPrice * (product.discountPercentage / 100)
            } else {
                existingCart.items.push({
                    product: productId,
                    quantity: 1,
                    price: product.offerPrice,
                    totalPrice: product.offerPrice,
                    discountPrice: product.realPrice * (product.discountPercentage / 100)
                });
            }
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

        await existingCart.save();

        let cart = await Cart.findOne({ userId : userId})
        if(cart){
            req.session.userNC.cartItemCount = cart.items.length
        }

        return res.status(200).json({ success: true, message: "Product added to your cart." });
    } catch (error) {
        return res.redirect('/errorPage')
    }
};

module.exports = {
    getWishlistPage,
    AddToWishlist,
    deleteProductFromWishlist,
    postProductToCart
}