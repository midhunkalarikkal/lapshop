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
        const paymentMethod = req.query.paymentMethod
        const paymentStatus = req.query.paymentStatus
        const couponCode = req.query.coupon 
        const walletUsed = req.query.walletUsed
        const walletdeductedAmount = req.query.walletBalance
        const totalAmount = req.query.amount
        let couponApplied = false
        
        console.log("UserId :",userId)
        console.log("addressId :",addressId)
        console.log("totalAmount :",totalAmount)
        console.log("type of totoalAmount :",totalAmount)
        console.log("paymentMethod :",paymentMethod)
        console.log("payment status :",paymentStatus)
        console.log("coupon Name :",couponCode)
        console.log("wallet used :",walletUsed)
        console.log()

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

        if (walletUsed && walletUsed !== undefined) {
            if (walletdeductedAmount && walletdeductedAmount !== 0 && walletdeductedAmount !== undefined) {
                const newWallet = new Wallet({
                    user: userId,
                    type: "debit",
                    amount: walletdeductedAmount,
                    updatedAt: new Date()
                });
                await newWallet.save();
            }
            if (!walletdeductedAmount || walletdeductedAmount === 0 || walletdeductedAmount === undefined) {
                const newWallet = new Wallet({
                    user: userId,
                    type: "debit",
                    amount: totalAmount,
                    updatedAt: new Date()
                });
                await newWallet.save();
            }
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
            walletDebitedAmount : walletdeductedAmount,
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

// To place order with wallet and razorpay
const orderConfirmWithWalletAndRazorpay = async(req,res)=>{
    try{
        console.log("Place order with wallet and razorpay api start")
        console.log("req.body :", req.body)

        const paymentAmount = req.body.paymentAmount
        const userId = req.session.user._id
        const name = req.session.user.fullname;
        const email = req.session.user.email;
        const walletBalance = req.body.walletBalance

        const razorpayAmount = paymentAmount - walletBalance

        console.log("Payment amount: ", paymentAmount);
        console.log("userId : ",userId)
        console.log("name :",name)
        console.log("email :",email)
        console.log("razorpay amount :",razorpayAmount)

        const options = {
            amount: razorpayAmount * 100,
            currency: "INR",
            receipt: "midhunkalarikkalp@gmail.com",
            };
            razorpayInstance.orders.create(options, (err, order) => {
            if (!err) {
                res.status(200).send({
                success: true,
                message: "order created",
                order_id: order.id,
                amount: razorpayAmount,
                key_id: process.env.KEY_ID,
                name: name,
                email: email,
                });
            } else {
                return res.status(400).send({ success: false, message: "Something went wrong!" });
            }
            });
            console.log("i have done with instance creation");
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
        const userId = req.session.user._id
        
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
        if(paymentMethod === "wallet"){
          const wallet = await Wallet.find({ user : userId})
          console.log("Wallet api start")
          console.log("wallet :",wallet)
          let walletBalance = 0;
          let totalCreditedAmount = 0;
          let totalDebitedAmount = 0;
          wallet.forEach((data)=>{
            if (data.type === 'credit') {
                totalCreditedAmount += data.amount; 
            } else {
                totalDebitedAmount += data.amount; 
            }
          })
           walletBalance = totalCreditedAmount - totalDebitedAmount;
          return res.json({
            success: true,
            paymentMethod,
            walletBalance,
            paymentAmount: amount,
          });
        }
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
        let orderTotal = order.orderTotal

        if(order.walletDebitedAmount && order.walletDebitedAmount !== undefined && order.walletDebitedAmount !== 0){
            orderTotal = order.orderTotal + order.walletDebitedAmount
        }

        if(order.paymentStatus === true){
            const wallet = new Wallet({
                user: userId,
                type: "credit",
                amount: orderTotal,
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

        let orderTotal = order.orderTotal

        if(order.walletDebitedAmount && order.walletDebitedAmount !== undefined && order.walletDebitedAmount !== 0){
            orderTotal = order.orderTotal + order.walletDebitedAmount
        }

        if(order.paymentStatus === true){
            const wallet = new Wallet({
                user: userId,
                type: "credit",
                amount: orderTotal,
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
    adminCancelOrder,
    orderConfirmWithWalletAndRazorpay
}