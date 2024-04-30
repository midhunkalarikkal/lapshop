const razorpayInstance = require('../config/razorpayConfig');
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const Wallet = require('../models/walletModel');

let userDetails;


//To delete the online payment order after 1 day which have payment status failed
async function getOnlinePaymentOrders() {
    try {
        const orders = await Order.find({ $and: [{ paymentMethod: "razorpay" }, { paymentStatus: false }] });
        console.log("Razorpay orders:", orders);

        setTimeout(async () => {
            const deletedOrders = await Order.deleteMany({ $and: [{ paymentMethod: "razorpay" }, { paymentStatus: false }] });
            console.log("Deleted orders:", deletedOrders);
        }, 86400000);
    } catch (error) {
        console.error("Error:", error);
    }
}

getOnlinePaymentOrders();

//To delete the order if status is admin cancelled
async function getAdminCancelledOrders() {
    try {
        const orders = await Order.find({
            $or: [
                { status: "Admin cancelled" },
                { status: "Cancelled" }
            ]
        });
        console.log("Admin called orders:", orders);

        setTimeout(async () => {
            const deletedOrders = await Order.deleteMany({
                $and: [
                    {
                        $or: [
                            { status: "Admin cancelled" },
                            { status: "Cancelled" }
                        ]
                    },
                    { paymentStatus: false }
                ]
            });
            console.log("Admin cancelled deleted orders:", deletedOrders);
        }, 86400000);
    } catch (error) {
        console.error("Error:", error);
    }
}

getAdminCancelledOrders();


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
            })),
            address : addressId,
            paymentMethod : paymentMethod,
            orderTotal : totalAmount,
            orderDate: new Date(),
            couponApplied: couponApplied,
            paymentStatus: paymentStatus,
            statusDate: new Date()
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
                res.status(400).send({ success: false, message: "Something went wrong!" });
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

const changeOrderStatus = async(req,res)=>{
    try{
        console.log("change order status api start")
        const orderId = req.body.orderId
        const selectedStatus = req.body.selectedStatus
        console.log("orderId :",orderId)
        console.log("selectedStatus :",selectedStatus)

        const order = await Order.findById(orderId)
        console.log("order :",order)

        if(selectedStatus === order.status){
            return res.status(400).json({ success : false , message : "Order status is same."})
        }else{
            order.status = selectedStatus
            order.statusDate = new Date()
            await order.save()
            return res.status(200).json({ success : true , message : `Order status changed to ${selectedStatus}`})
        }
        
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

// To cancel an order from user
const userCancelOrder = async(req,res)=>{
    try{
        console.log("UserCancelorder api start")
        const orderId = req.body.orderId
        console.log("orderId :",orderId)
        const userId = req.session.user._id
        const order = await Order.findById(orderId)
        console.log("Order :",order)
        if(order.paymentStatus === true){
            const wallet = new Wallet({
                user: userId,
                type: "credit",
                amount: order.orderTotal,
                updatedAt : new Date()
            });
        await wallet.save();
        }
        order.status = "Cancelled"

        const orderedItemsLength = order.orderedItems.length
        for(let i =0; i< orderedItemsLength; i++){
            console.log("Product quantity :",order.orderedItems[i].quantity)
            const productId = order.orderedItems[i].product.toString()
            const productQty = order.orderedItems[i].quantity
            await Product.updateOne({_id : productId}, { $inc: { noOfStock:  productQty} })
        }
        await order.save()
        return res.status(200).json({ success : true , message : "Order cancel successfull."})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To cancel a order from admin
const adminCancelOrder = async(req,res)=>{
    try{
        console.log("Admin cancel order")
        const orderId = req.body.orderId
        console.log("orderId :",orderId)
        const order = await Order.findById(orderId)
        console.log("Order :",order)
        const userId = order.userId
        console.log("userId :",userId)
        if(order.paymentStatus === true){
            const wallet = new Wallet({
                user: userId,
                type: "credit",
                amount: order.orderTotal,
                updatedAt : new Date()
            });
        await wallet.save();
        }

        const orderedItemsLength = order.orderedItems.length
        for(let i =0; i< orderedItemsLength; i++){
            console.log("Product quantity :",order.orderedItems[i].quantity)
            const productId = order.orderedItems[i].product.toString()
            const productQty = order.orderedItems[i].quantity
            await Product.updateOne({_id : productId}, { $inc: { noOfStock:  productQty} })
        }

        order.status = "Admin cancelled"
        await order.save()
        return res.status(200).json({ success : true , message : "Order cancel successfull."})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

module.exports = {
    placeOrder,
    orderConfirmation,
    getOrders,
    getOrderDetail,
    changeOrderStatus,
    userCancelOrder,
    adminCancelOrder
}