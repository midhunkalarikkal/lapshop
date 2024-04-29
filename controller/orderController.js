const razorpayInstance = require('../config/razorpayConfig');
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')
const Product = require('../models/productModel')

let userDetails;


//To delete the online payment order after 1 day which have payment status failed
async function getOnlinePaymentOrders() {
    try {
        const orders = await Order.find({ $and: [{ paymentMethod: "razorpay" }, { paymentStatus: false }] });
        console.log("Razorpay orders:", orders);

        setTimeout(async () => {
            const deletedOrders = await Order.deleteMany({ $and: [{ paymentMethod: "razorpay" }, { paymentStatus: false }] });
            console.log("Deleted orders:", deletedOrders);
        }, 86400000);//One day
    } catch (error) {
        console.error("Error:", error);
    }
}

getOnlinePaymentOrders();

// To confirm an order
const placeOrder = async(req,res)=>{
    try{
        console.log("place order api start")
        console.log("req.session.user :",req.session.user)
        console.log("req.session.userNC :",req.session.userNC)
        const userId = req.session.user._id
        const addressId = req.query.addressId
        const totalAmount = req.query.amount
        const paymentMethod = req.query.paymentMethod
        const paymentStatus = req.query.paymentStatus
        const couponCode = req.query.coupon 
        let couponApplied = false
        
        console.log("UserId :",userId)
        console.log("addressId :",addressId)
        console.log("totalAmount :",totalAmount)
        console.log("type of totoalAmount :",totalAmount)
        console.log("paymentMethod :",paymentMethod)
        console.log("payment status :",paymentStatus)
        console.log("coupon Name :",couponCode)

        const cart = await Cart.find({ userId : userId})
        console.log("cart :",cart[0])
        let cartIdToUpdate = cart[0]._id
        console.log("cart id :",cartIdToUpdate)

        if(couponCode && couponCode !== ""){
            console.log("coupon applied")
            console.log("couponCode :",couponCode)
            couponApplied = true
        }else{
            console.log("coupon not applied :",)
            console.log("coupon code :",couponCode)
        }

        const newOrder = new Order({
            userId : userId,
            orderedItems: cart[0].items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                totalPrice: item.totalPrice, // actually this is price of a single quanityty
                statusDate: new Date()
            })),
            address : addressId,
            paymentMethod : paymentMethod,
            orderTotal : totalAmount,
            orderDate: new Date(),
            couponApplied: couponApplied,
            paymentStatus: paymentStatus
        })
    
        const orderSaved = await newOrder.save()
        if (orderSaved) {
            // Update product stock for each item in cart
            await Promise.all(cart[0].items.map(async (item) => {
                const product = await Product.findById(item.product);
                console.log("product quantity :", product.noOfStock);
                console.log("orderedItem quantity :", item.quantity);
                product.noOfStock -= item.quantity;
                await product.save();
            }));
            cart[0].items = [];
            cart[0].totalCartPrice = 0;
            cart[0].totalCartDiscountPrice = 0;
            req.session.userNC.cartItemCount = cart[0].items.length
            await cart[0].save()
            console.log("updated cart :",cart[0])
            console.log("req.session.NC :",req.session.NC)
            return res.redirect('/paymentSuccess');
        } 
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}


const orderConfirmation = async(req,res)=>{
    try{
        console.log("order confirmation api start")
        const amount = req.body.totalAmount
        const paymentMethod = req.body.paymentMethod
        
        if (paymentMethod === "razorpay") {
            console.log("i am creating instance");
            const name = req.session.user.fullname;
            const email = req.session.user.email;
            const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "midhunkalarikkalp@gmail.com",
            };
            razorpayInstance.orders.create(options, (err, order) => {
            if (!err) {
                res.status(200).send({
                success: true,
                message: "order created",
                order_id: order.id,
                amount: amount,
                key_id: process.env.KEY_ID,
                name: name,
                email: email,
                });
            } else {
                res.status(400).send({ success: false, message: "SOmething went wrong!" });
            }
            });
            console.log("i have done with instance creation");
        }
        if (paymentMethod === "cod") {
            res.status(200).send({ success: true });
        }
        // if(paymentMethod === "wallet"){
        //   const userInfo = await User.findOne({ _id: req.session.userData?._id });
        //   console.log(userInfo)
        //   const walletBalance = userInfo.wallet;
        //   return res.json({
        //     success: true,
        //     paymentMethod,
        //     walletBalance,
        //     paymentAmount: req.session?.userData?.total,
        //   });
        // }

    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

// To get orders
const getOrders = async(req,res)=>{
    try{
        userDetails = req.session.userNC
        const userId = req.session.user._id
        let order = []
        order = await Order.find({ userId: userId }).populate({
            path: "orderedItems.product",
            populate:  [{ path: "brand" }, { path: "category" }]
        });
        console.log("orders :",order)
        // console.log("Ordered items :",order[0].orderedItems)
        return res.render('user/orders',{userDetails , order})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}


const getOrderDetail = async(req,res)=>{
    try{
        console.log("Request.params.prodId :",req.params.orderId)
        const orderId = req.params.orderId
        const order = await Order.find({ _id : orderId}).populate({
            path: "orderedItems.product",
            populate:  [{ path: "brand" }, { path: "category" }]
        }).populate("address");
        console.log("order :",order)
        return res.render('user/orderDetail',{userDetails , order})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal serer error" })
    }
}

module.exports = {
    placeOrder,
    orderConfirmation,
    getOrders,
    getOrderDetail
}