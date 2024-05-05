const razorpayInstance = require('../config/razorpayConfig');
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const Wallet = require('../models/walletModel');
const path = require('path')
const fs = require('fs')
const moment = require("moment")
const easyinvoice = require('easyinvoice')


// To place an order from user
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
        return res.redirect('/errorPage')
    }
}

// To place order with wallet and razorpay from user
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
        return res.redirect('/errorPage')
    }
}

// To confirm an order from user
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
        return res.redirect('/errorPage')
    }
}

// To get orders from user
const getOrders = async(req,res)=>{
    try{
        let userDetails = req.session.userNC
        const userId = req.session.user._id
        let order = []
        order = await Order.find({ userId: userId }).populate({
            path: "orderedItems.product",
            populate:  [{ path: "brand" }, { path: "category" }]
        });
        console.log("orders :",order)
        return res.render('user/orders',{userDetails , order})
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

// To get the order Detail page from user
const getOrderDetail = async(req,res)=>{
    try{
        let userDetails = req.session.userNC
        const orderId = req.params.orderId
        const order = await Order.find({ _id : orderId}).populate({
            path: "orderedItems.product",
            populate:  [{ path: "brand" }, { path: "category" }]
        }).populate("address");
        return res.render('user/orderDetail',{userDetails , order})
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
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
        return res.redirect('/errorPage')
    }
}

// To get order from admin
const adminGetOrders = async(req,res)=>{
    try{
        const orders = await Order.find().populate({
            path: "orderedItems.product",
            populate:  [{ path: "brand" }, { path: "category" }]
        });
        console.log("Orders :",orders)
        return res.render("admin/adminOrders", { title : "Lapshop Admin" , orders})
    }catch(error){
        console.log(error.message)
        return res.redirect('/admin/adminErrorPage')
    }
}

// To get order Detail from admin
const adminGetOrderDetail = async(req,res)=>{
    try{
        console.log("Request.params.prodId :",req.params.orderId)
        const orderId = req.params.orderId
        const order = await Order.find({ _id : orderId}).populate({
            path: "orderedItems.product",
            populate:  [{ path: "brand" }, { path: "category" }]
        }).populate("address");
        console.log("order :",order)
        if(order){
            return res.render('admin/adminOrderDetails',{ title : "Lapshop Admin" ,order})
        }
    }catch(error){
        console.log(error.message)
        return res.redirect('/admin/adminErrorPage')
    }
}

// To change order status from admin
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
        return res.redirect('/admin/adminErrorPage')
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
        return res.redirect('/admin/adminErrorPage')
    }
}

//To download the order invoice for the user
const downloadInvoice = async(req,res)=>{
    try{
        console.log("download invoice api start")
        console.log("req.params : ",req.params)
        const orderId = req.params.orderId
        console.log("orderId :",orderId)

        const filePath = path.join(
            __dirname,
            "..",
            "public",
            "invoice",
            `${orderId}.pdf`
          );
      
          if (!fs.existsSync(filePath)) {
            // If the invoice file doesn't exist, generate it
            await generateInvoice(orderId);
          }
      
          fs.readFile(filePath, function (err, data) {
            res.contentType("application/pdf");
            res.send(data);
          });
    }catch(error){
        console.log("invoice download error")
        console.log(error)
        return res.redirect('/errorPage')
    }
}

const generateInvoice = async(orderId)=>{
    try{
        console.log("generate invoice api start")
        const order = await Order.findById(orderId).populate("orderedItems.product").populate("userId").populate("address")
        console.log("order : ",order)

        const orderedItems = order.orderedItems.map((item) => ({
            quantity: item.quantity,
            description: `${item.product.brand} ${item.product.name}`,
            price: item.totalPrice,
            Total: order.orderTotal
          }));

          console.log("orderesItems : ",orderedItems)
        
          var data = {
            apiKey:process.env.EASYINVOICE_API_KEY,
            mode: "development",
            images: {
              logo: "https://firebasestorage.googleapis.com/v0/b/lapshop-e3a21.appspot.com/o/Lapshop%20logo.png?alt=media&token=35295b10-88d1-4c59-a7f6-9c9e49d2758b",
            },
            sender: {
              company: "Lapshop",
              address: "First street main road",
              zip: "123456",
              city: "Banglore",
              country: "India",
            },
            client: {
              company: order.address.fullname,
              address: order.address.name + " " +order.address.addressLine,
              zip: order.address.pincode,
              city: order.address.city,
              country: order.address.country,
            },
            information: {
              ID: order._id,
              date: moment(order.date).format("YYYY-MM-DD HH:mm:ss"),
            },
            products: orderedItems,
            bottomNotice:
              "Your satisfaction is our priority. Thank you for choosing Lapshop.com",
            settings: {
              currency: "INR",
            },
          };

        const result = await easyinvoice.createInvoice(data);
        const folderPath = path.join(__dirname, "..", "public", "invoice");
        const filePath = path.join(folderPath, `${order._id}.pdf`);
        fs.mkdirSync(folderPath, { recursive: true });
        fs.writeFileSync(filePath, result.pdf, "base64");

    order.invoice = filePath;
    await order.save();

    console.log(`Invoice saved at: ${filePath}`);

    }catch(error){
        console.log("invoice generate error")
        console.log(error)
    }
}

// To repayment the order if the payment is failed
const repayment = async(req,res)=>{
    try{
        console.log("repayment api start")
        const orderId = req.params.orderId
        const order = await Order.findById(orderId).populate("orderedItems.product").populate("userId").populate("address")
        console.log("order : ",order)
        return res.render("user/repayment",{order})
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

const repaymentOrderConfirm = async(req,res)=>{
    try{
        console.log("repayment order confirmation api start")
        const data = req.body
        console.log("data : ",data)
        const paymentMethod = req.body.paymentMethod
        const amount = req.body.totalAmount
        const orderId = req.body.orderId 

        if (paymentMethod === "razorpay" || paymentMethod === "wallet with razorpay") {
            console.log("i am creating instance from repayment");
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
                orderId : orderId,
                key_id: process.env.KEY_ID,
                name: name,
                email: email,
                });
            } else {
                res.status(400).send({ success: false, message: "Something went wrong! in repayment" });
            }
            });
            console.log("i have done with instance creation repayment");
        }
    }catch(error){
        console.log(error)
    }
}

// To place order for the repayment order
const rePaymentPlaceOrder = async(req,res)=>{
    try{
        console.log("repayment place order api start")
        console.log("req.session.user :",req.session.user)
        console.log("req.session.userNC :",req.session.userNC)

        const paymentStatus = req.query.paymentStatus
        const totalAmount = req.query.amount
        const orderId = req.query.orderId

        console.log("totalAmount :",totalAmount)
        console.log("payment status :",paymentStatus)
        console.log("orderId : ",orderId)

        const order = await Order.findById(orderId)
        order.paymentStatus = paymentStatus
        order.orderTotal = totalAmount
        order.statusDate = new Date()
        const orderSaved = await order.save()
    
        if (orderSaved) {
            return res.redirect('/paymentSuccess');
        } 
    }catch(error){
        console.log(error)
    }
}

module.exports = {
    ////// Api for the admin \\\\\
    changeOrderStatus,
    adminCancelOrder,
    adminGetOrders,
    adminGetOrderDetail,
    ////// Api for the user \\\\\\
    placeOrder,
    orderConfirmation,
    getOrders,
    getOrderDetail,
    userCancelOrder,
    orderConfirmWithWalletAndRazorpay,
    downloadInvoice,
    repayment,
    repaymentOrderConfirm,
    rePaymentPlaceOrder
}