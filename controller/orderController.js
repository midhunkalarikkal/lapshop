const razorpayInstance = require('../config/razorpayConfig');
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const Wallet = require('../models/walletModel')
const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')
const Counter = require('../models/counterModel');

//To generate an unique sequential order id
const generateOrderId = async () => {
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = String(currentDate.getFullYear()).slice(-2);

    const counter = await Counter.findByIdAndUpdate(
        { _id: 'orderId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const orderId = `ORD-${month}${year}-${counter.seq}`;
    return orderId;
};

// To place an order from user
const placeOrder = async(req,res)=>{
    try{
        const userId = req.session.user._id
        const addressId = req.query.addressId
        const paymentMethod = req.query.paymentMethod
        const paymentStatus = req.query.paymentStatus
        const couponCode = req.query.coupon 
        const walletUsed = req.query.walletUsed
        const walletdeductedAmount = req.query.walletBalance
        const totalAmount = req.query.amount
        let couponApplied = false

        const cart = await Cart.find({ userId : userId})

        if(couponCode && couponCode !== ""){
            couponApplied = true
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

        const orderId = await generateOrderId();
        const newOrder = new Order({
            orderId : orderId,
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
            statusDate: new Date(),
            trackArray: [
                {
                    status : "Processing",
                    paymentStatus : paymentStatus,
                    note : paymentMethod
                }
            ]
        })
    
        const orderSaved = await newOrder.save()
        if (orderSaved) {
                await Promise.all(cart[0].items.map(async (item) => {
                    const product = await Product.findById(item.product);
                    product.noOfStock -= item.quantity;
                    await product.save();
                }));
                cart[0].items = [];
                cart[0].totalCartPrice = 0;
                cart[0].totalCartDiscountPrice = 0;
                cart[0].couponApplied = false
                cart[0].couponAmount = 0
                cart[0].couponCode = ""
                req.session.userNC.cartItemCount = cart[0].items.length
                await cart[0].save()
            return res.redirect('/paymentSuccess');
        } 
    }catch(error){
        return res.redirect('/errorPage')
    }
}

// To place order with wallet and razorpay from user
const orderConfirmWithWalletAndRazorpay = async(req,res)=>{
    try{
        const paymentAmount = req.body.paymentAmount
        const phone = req.session.user.phone
        const name = req.session.user.fullname;
        const email = req.session.user.email;
        const walletBalance = req.body.walletBalance

        const razorpayAmount = paymentAmount - walletBalance

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
                phone: phone
                });
            } else {
                return res.status(400).send({ success: false, message: "Something went wrong!" });
            }
            });
    }catch(error){
        return res.redirect('/errorPage')
    }
}

// To confirm an order from user
const orderConfirmation = async(req,res)=>{
    try{
        const amount = req.body.totalAmount
        const paymentMethod = req.body.paymentMethod
        const userId = req.session.user._id
        
        if (paymentMethod === "razorpay") {
            const name = req.session.user.fullname;
            const email = req.session.user.email;
            const phone = req.session.user.phone;
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
                phone: phone
                });
            } else {
                res.status(400).send({ success: false, message: "Something went wrong!" });
            }
            });
        }
        if (paymentMethod === "cod") {
            res.status(200).send({ success: true });
        }
        if(paymentMethod === "wallet"){
          const wallet = await Wallet.find({ user : userId})
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
        return res.redirect('/errorPage')
    }
}

// To get orders from user
const getOrders = async(req,res)=>{
    try{
        let userDetails = req.session.userNC
        const userId = req.session.user._id
  
        let order = await Order.find({ userId: userId }).populate({
            path: "orderedItems.product",
            populate:  [{ path: "brand" }, { path: "category" }]
        }).sort({ orderDate: -1 });
        
        return res.render('user/orders',{userDetails , order : order})
    }catch(error){
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
        return res.redirect('/errorPage')
    }
}

// To cancel an order from user
const userCancelOrder = async(req,res)=>{
    try{
        const orderId = req.body.orderId
        const userId = req.session.user._id
        const order = await Order.findById(orderId)
        let orderTotal = order.orderTotal

        if(order.walletDebitedAmount && order.walletDebitedAmount !== undefined && order.walletDebitedAmount !== 0){
            orderTotal = order.orderTotal + order.walletDebitedAmount
        }

        let track = {};

        if(order.paymentStatus === true){
            const wallet = new Wallet({
                user: userId,
                type: "credit",
                amount: orderTotal,
                updatedAt : new Date()
            });
        await wallet.save();
        track.note = "Order amount credited to your wallet"
        }
        order.status = "Cancelled";

        track.status = "Cancelled",
        track.paymentStatus = order.paymentStatus
        order.trackArray.push(track);


        const orderedItemsLength = order.orderedItems.length
        for(let i =0; i< orderedItemsLength; i++){
            const productId = order.orderedItems[i].product.toString()
            const productQty = order.orderedItems[i].quantity
            await Product.updateOne({_id : productId}, { $inc: { noOfStock:  productQty} })
        }
        await order.save()
        return res.status(200).json({ success : true , message : "Order cancel successfull."})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

// To get order from admin
const adminGetOrders = async(req,res)=>{
    try{
        const orders = await Order.find().populate({
            path: "orderedItems.product",
            populate:  [{ path: "brand" }, { path: "category" }]
        }).sort({ orderDate: -1 });
        return res.render("admin/adminOrders", { title : "Lapshop Admin" , orders : orders })
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

// To get order Detail from admin
const adminGetOrderDetail = async(req,res)=>{
    try{
        const orderId = req.params.orderId
        const order = await Order.find({ _id : orderId}).populate({
            path: "orderedItems.product",
            populate:  [{ path: "brand" }, { path: "category" }]
        }).populate("address");
        if(order){
            return res.render('admin/adminOrderDetails',{ title : "Lapshop Admin" ,order})
        }
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

// To change order status from admin
const changeOrderStatus = async(req,res)=>{
    try{
        const orderId = req.body.orderId;
        const selectedStatus = req.body.selectedStatus;

        const order = await Order.findById(orderId);

        if(selectedStatus === order.status){
            return res.status(400).json({ success : false , message : "Order status is same."});
        }else if(selectedStatus === "Delivered" && order.paymentMethod === "cod"){
            order.paymentStatus = true;
        }
            order.status = selectedStatus;
            order.statusDate = new Date();
            
            order.trackArray.push(
                {
                    status : selectedStatus,
                    paymentStatus : order.paymentStatus,
                }
            )
            
            await order.save();
            return res.status(200).json({ success : true , message : `Order status changed to ${selectedStatus}`});
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

//To cancel a order from admin
const adminCancelOrder = async(req,res)=>{
    try{
        const orderId = req.body.orderId
        const order = await Order.findById(orderId)
        const userId = order.userId

        let orderTotal = order.orderTotal

        if(order.walletDebitedAmount && order.walletDebitedAmount !== undefined && order.walletDebitedAmount !== 0){
            orderTotal = order.orderTotal + order.walletDebitedAmount
        }

        let track = {};
        if(order.paymentStatus === true){
            const wallet = new Wallet({
                user: userId,
                type: "credit",
                amount: orderTotal,
                updatedAt : new Date()
            });
            await wallet.save();
            track.note = "Order amount credited to your wallet.";
        }

        const orderedItemsLength = order.orderedItems.length
        for(let i =0; i< orderedItemsLength; i++){
            const productId = order.orderedItems[i].product.toString()
            const productQty = order.orderedItems[i].quantity
            await Product.updateOne({_id : productId}, { $inc: { noOfStock:  productQty} })
        }

        order.status = "Admin cancelled"
        track.status = "Admin cancelled",
        track.paymentStatus = order.paymentStatus
        order.trackArray.push(track)
        
        await order.save()
        return res.status(200).json({ success : true , message : "Order cancel successfull."})
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}


//To download the order invoice for the user
const downloadInvoice = async(req,res)=>{
    try{
        const orderId = req.params.orderId
        
        const outputFilePath = path.join(__dirname, '..', 'public', 'invoice', `${orderId}.pdf`);

        if (!fs.existsSync(outputFilePath)) {
            generateInvoice(orderId, outputFilePath);
            return res.status(202).json({ message: 'Invoice is being generated. Please try downloading after a few seconds.' });
        } else {
            res.contentType("application/pdf");
            return res.sendFile(outputFilePath, (err) => {
                if (err) {
                    return res.redirect('/errorPage');
                }
            });
        }
    }catch(error){
        return res.redirect('/errorPage')
    }
}

const generateInvoice = async (orderId, outputFilePath) => {
    try {
        const order = await Order.findById(orderId)
            .populate({
                path: "orderedItems",
                populate: {
                    path: "product",
                    populate: {
                        path: "brand"
                    }
                }
            })
            .populate("userId")
            .populate("address");

        if (!order) {
            throw new Error("Order not found");
        }

        const orderedItems = order.orderedItems.map((item) => ({
            quantity: item.quantity,
            description: `${item.product.brand.name} ${item.product.name}`,
            price: item.totalPrice
        }));

        const doc = new PDFDocument({size : 'A4'});
        const imagePath = path.join(__dirname, '..', 'public', 'images', 'Bg', 'desktop', 'Lapshoplogo.png');
        doc.pipe(fs.createWriteStream(outputFilePath));

        doc.image(imagePath, 40, 40, { width: 50 })
        .fontSize(12)
        .text('LapShop Ecommerce', 110, 70);

        doc.fontSize(10)
            .text('Invoice', 450, 40, { align: 'right' })
            .text('LapShop', 450, 55, { align: 'right' })
            .text('1234 Main Street', 440, 70, { align: 'right' })
            .text('Banglore, 676767', 440, 85, { align: 'right' });

        // Horizontal Line
        doc.moveTo(40, 120)
            .lineTo(550, 120)
            .stroke();

        // Client Information & Order Details
        doc.fontSize(10)
            .text(`Client Name: ${order.userId.fullname}`, 40, 140)
            .text(`Address: ${order.address.addressLine}`, 40, 155)
            .text(`${order.address.city}, ${order.address.district}`, 40, 170)
            .text(`${order.address.state}, ${order.address.pincode}`, 40, 185);

        doc.text(`Order ID: ${order.orderId}`, 330, 140, { align: 'right' });

        const startY = 220;
        doc.fontSize(10)
            .text('Product', 40, startY)
            .text('Quantity', 250, startY)
            .text('Price (Rs)', 350, startY)
            .text('Total (Rs)', 450, startY);

        doc.moveTo(40, startY + 15)
            .lineTo(550, startY + 15)
            .stroke();

        let currentY = startY + 30;
        orderedItems.forEach(item => {
            doc.text(item.description, 40, currentY)
                .text(item.quantity, 250, currentY)
                .text(`${item.price}`, 350, currentY)
                .text(`${item.price}`, 450, currentY);
            currentY += 20;
        });

        const marginLeft = 40;
        const column1X = 350; 
        const column2X = 390; 
        const currentYStart = currentY + 20; 

        currentY = currentYStart;
        currentY += 10;
        doc.moveTo(marginLeft, currentY)
            .lineTo(550, currentY)
            .stroke();

        currentY += 15;
        doc.fontSize(10)
            .text('Subtotal:', column1X, currentY, { align: 'left' })  
            .text(`Rs ${order.orderTotal}`, column2X, currentY, { align: 'right' });

        currentY += 15;
        doc.text('Delivery:', column1X, currentY, { align: 'left' })
            .text('FREE', column2X, currentY, { align: 'right' });

        currentY += 15;
        doc.moveTo(marginLeft, currentY)
            .lineTo(550, currentY)
            .stroke();

        currentY += 15;
        doc.fontSize(12)
            .text('Total:', column1X, currentY, { align: 'left' })
            .text(`Rs ${order.orderTotal}`, column2X, currentY, { align: 'right' });

        doc.fontSize(10)
            .text('Thank you for your purchase!', 40, 750, { align: 'center', valign: 'bottom' });

        doc.end();

        pdfStream.on('finish', async () => {
            order.invoice = outputFilePath;
            await order.save();
        });

        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
};

// To repayment the order if the payment is failed
const repayment = async(req,res)=>{
    try{
        const orderId = req.params.orderId
        const order = await Order.findById(orderId).populate("orderedItems.product").populate("userId").populate("address")
        return res.render("user/repayment",{order})
    }catch(error){
        return res.redirect('/errorPage')
    }
}

// To confirm the repayment
const repaymentOrderConfirm = async(req,res)=>{
    try{
        const data = req.body
        const paymentMethod = req.body.paymentMethod
        const amount = req.body.totalAmount
        const orderId = req.body.orderId 

        if (paymentMethod === "razorpay" || paymentMethod === "wallet with razorpay") {
            const name = req.session.user.fullname;
            const email = req.session.user.email;
            const phone = req.session.user.phone
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
                phone: phone
                });
            } else {
                res.status(400).send({ success: false, message: "Something went wrong! in repayment" });
            }
            });
        }
    }catch(error){
        return res.redirect('/errorPage')
    }
}

// To place order for the repayment order
const rePaymentPlaceOrder = async(req,res)=>{
    try{
        const paymentStatus = req.query.paymentStatus
        const totalAmount = req.query.amount
        const orderId = req.query.orderId

        const order = await Order.findById(orderId)
        order.paymentStatus = paymentStatus
        order.orderTotal = totalAmount
        order.statusDate = new Date()
        const orderSaved = await order.save()
    
        if (orderSaved) {
            return res.redirect('/paymentSuccess');
        } 
    }catch(error){
        return res.redirect('/errorPage')
    }
}

// To return an order from user 
const userReturnOrder = async(req,res)=>{
    try{
        const orderId = req.body.orderId
        const order = await Order.findById(orderId)
        order.status = "Request return"
        order.statusDate = new Date()
        order.trackArray.push(
            {
                status : "Request return",
                paymentStatus : order.paymentStatus,
                note : "Reviewing"
            }
        )

        const updateOrder = await order.save()
        if(updateOrder){
            return res.status(200).json({ success : true , message : "Order return requested."})
        }else{
            return res.status(400).json({ success : false , message : "Order return requesting failed"})
        }
    }catch(error){
        return res.redirect('/errorPage')
    }
}

//To accept an order return request in admin from user
const adminAcceptReturn = async(req,res)=>{
    try{
        const orderId = req.body.orderId
        const userId = req.session.user._id
        const order = await Order.findById(orderId)
        const amount = order.orderTotal
        if(order){
            order.status = "Return accepted"
            order.trackArray.push(
                {
                    status : "Return accepted",
                    paymentStatus : order.paymentStatus,
                    note : "Order amount credited to your wallet."
                }
            )
            
            order.statusDate = new Date()
            const updateOrder = await order.save()
            if(updateOrder){
                const wallet = new Wallet({
                    user: userId,
                    type: "credit",
                    amount: amount,
                    updatedAt : new Date()
                });
                await wallet.save();
                return res.status(200).json({ success : true , message : "Return request accepted" });
            }else{                
                return res.status(400).json({ success : false , message : "Return request accepting error." });
            }
        }else{
            return res.status(400).json({ success : false , message : "No order found." });
        }
    }catch(error){
        return res.redirect('/admin/adminErrorPage');
    }
}

//To reject an order return request in admin from user
const adminRejectReturn = async(req,res)=>{
    try{
        const orderId = req.body.orderId;
        const order = await Order.findById(orderId);
        if(order){
            order.status = "Return rejected"
            order.statusDate = new Date()
            order.trackArray.push(
                {
                    status : "Return rejected",
                    paymentStatus : order.paymentStatus,
                    note : "Sorry for the inconvenience."
                }
            )
            
            const updateOrder = await order.save()
            if(updateOrder){
                return res.status(200).json({ success : true , message : "Return request rejected" });
            }else{                
                return res.status(400).json({ success : false , message : "Return request rejecting error." });
            }
        }else{
            return res.status(400).json({ success : false , message : "No order found." });
        }
    }catch(error){
        return res.redirect('/admin/adminErrorPage');
    }
}

module.exports = {
    ////// Api for the admin \\\\\
    changeOrderStatus,
    adminCancelOrder,
    adminGetOrders,
    adminGetOrderDetail,
    adminAcceptReturn,
    adminRejectReturn,
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
    rePaymentPlaceOrder,
    userReturnOrder
}