const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')

// To confirm an order
const postConfirmOrder = async(req,res)=>{
    try{
        console.log("req.session.user :",req.session.user)
        console.log("req.session.userNC :",req.session.userNC)
        const userId = req.session.user._id
        const addressId = req.body.userAddressId
        const totalAmount = req.body.totalAmount
        const paymentMethod = req.body.paymentMethod
        let couponId = "";
        let coupon = null;

        const cart = await Cart.find({ userId : userId})
        if(req.body.couponId){
            couponId = req.body.couponId
            console.log("couponId :",couponId)
        }
        if (couponId && couponId !== null) {
            coupon = await Coupon.findById(couponId);
            console.log("coupon :", coupon);
        }
        console.log("UserId :",userId)
        console.log("addressId :",addressId)
        console.log("totalAmount :",totalAmount)
        console.log("paymentMethod :",paymentMethod)
        console.log("cart :",cart[0])
        let cartIdToUpdate = cart[0]._id
        console.log("cart id :",cartIdToUpdate)

        const newOrder = new Order({
            userId : userId,
            orderedItems: cart[0].items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                statusDate: new Date()
            })),
            address : addressId,
            paymentMethod : paymentMethod,
            orderTotal : totalAmount,
            orderDate: new Date()
        })
    
        const orderSaved = await newOrder.save()
        if (orderSaved && coupon  && coupon !== "") {
            coupon.appliedUsers.push({ userId: userId });
            await coupon.save();
            cart[0].items = [];
            cart[0].totalCartPrice = 0;
            cart[0].totalCartDiscountPrice = 0;
            req.session.userNC.cartItemCount = cart[0].items.length
            await cart[0].save()
            console.log("updated cart :",cart[0])
            console.log("req.session.NC :",req.session.NC)
            return res.status(200).json({ message: "Order placed successfully." });
        } else if (!orderSaved) {
            return res.status(400).json({ error: "Failed to save order." });
        } else {
            cart[0].items = [];
            cart[0].totalCartPrice = 0;
            cart[0].totalCartDiscountPrice = 0;
            req.session.userNC.cartItemCount = cart[0].items.length
            await cart[0].save()
            console.log("updated cart :",cart[0])
            console.log("req.session.userNC :",req.session.userNC)
            return res.status(200).json({ message: "Order placed successfully." });
        }
        
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

// To get the order confirm page
const getOrderConfirmed = async(req,res)=>{
    try{
        userDetails = req.session.userNC
        const userId = req.session.user._id
        const order = await Order.find({userId : userId})
        console.log("order :",order)
        const latestOrder = order.sort((a, b) => b.orderDate - a.orderDate)[0];
        console.log("latest order :",latestOrder)
        const addressId = latestOrder.address
        const deliveryAddress = await Address.findById(addressId)
        let paymentMethod = latestOrder.paymentMethod
        if(paymentMethod === "cod"){
            paymentMethod = "Cash on delivery."
        }else if( paymentMethod === "wallet"){
            paymentMethod = "Wallet payment."
        }else if(paymentMethod === "razorpay"){
            paymentMethod = "Online razorpay payment."
        }
        const orderTotal = latestOrder.orderTotal
        const orderedDate = latestOrder.orderDate
        const expectedDelivery = new Date(orderedDate);
            expectedDelivery.setDate(expectedDelivery.getDate() + 4);
        const data = {
            address : deliveryAddress,
            paymentMethod : paymentMethod,
            orderTotal : orderTotal,
            orderedDate : orderedDate,
            expectedDelivery : expectedDelivery
        }
        console.log("data :",data)
        return res.render('user/orderConfirmation',{userDetails , data})
    }catch(error){
        console.log(error.message)
        return res.stauts(500).json({ message : "Internal server error" })
    }
}

// To get orders
const getOrders = async(req,res)=>{
    try{
        userDetails = req.session.userNC
        const userId = req.session.user._id
        const order = await Order.find({ userId: userId }).populate({
            path: "orderedItems.product",
            populate:  [{ path: "brand" }, { path: "category" }]
        });
        console.log("orders :",order)
        console.log("Ordered items :",order[0].orderedItems)
        return res.render('user/orders',{userDetails , order})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

module.exports = {
    postConfirmOrder,
    getOrderConfirmed,
    getOrders
}