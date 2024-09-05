const razorpayInstance = require('../config/razorpayConfig');
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const Wallet = require('../models/walletModel')
const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')
const moment = require("moment")
const easyinvoice = require('easyinvoice')
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
            statusDate: new Date()
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
        const orderId = req.body.orderId
        const selectedStatus = req.body.selectedStatus

        const order = await Order.findById(orderId)

        if(selectedStatus === order.status){
            return res.status(400).json({ success : false , message : "Order status is same."})
        }else if(selectedStatus === "Delivered" && order.paymentMethod === "cod"){
            order.paymentStatus = true
        }
            order.status = selectedStatus
            order.statusDate = new Date()
            await order.save()
            return res.status(200).json({ success : true , message : `Order status changed to ${selectedStatus}`})
        
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
            const productId = order.orderedItems[i].product.toString()
            const productQty = order.orderedItems[i].quantity
            await Product.updateOne({_id : productId}, { $inc: { noOfStock:  productQty} })
        }

        order.status = "Admin cancelled"
        await order.save()
        return res.status(200).json({ success : true , message : "Order cancel successfull."})
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}



//To download the order invoice for the user
const downloadInvoice = async(req,res)=>{
    try{
        console.log("download invoice function starting");
        const orderId = req.params.orderId
        console.log("orderid : ",orderId)

        const doc = new PDFDocument();

        // Use an absolute path to ensure the file is saved in the correct location
        const outputFilePath = path.join(__dirname, '..', 'public', 'invoice', 'output.pdf');
        doc.pipe(fs.createWriteStream(outputFilePath));

        // Optionally, remove custom font for testing
        // doc.font('fonts/PalatinoBold.ttf').fontSize(25).text('Some text with an embedded font!', 100, 100);

        // Add text with a default font
        doc.fontSize(25).text('Some text without an embedded font!', 100, 100);

        // Use an absolute path for the image
        const imagePath = path.join(__dirname, '..', 'public', 'images', 'Bg', 'desktop', 'Lapshoplogo.png');
        doc.image(imagePath, {
            fit: [250, 300],
            align: 'center',
            valign: 'center'
        });

        // Finalize the PDF and end the stream
        doc.end();

        console.log("download invoice function end");

        // Once the document is finalized, send the file as a response
        res.contentType("application/pdf");
        res.sendFile(outputFilePath, (err) => {
            if (err) {
                console.log("Error sending file:", err);
                res.redirect('/errorPage');
            }
        });
        // console.log("download invoce function starting")
        // const orderId = req.params.orderId
        // console.log("orderid : ",orderId)

        // const filePath = path.join(
        //     __dirname,
        //     "..",
        //     "public",
        //     "invoice",
        //     `${orderId}.pdf`
        //   );
      
        //   console.log("before calling")
        // if (!fs.existsSync(filePath)) {
        //     const invoiceResult = await generateInvoice(orderId);
        //     if (invoiceResult.error) {
        //         throw new Error(invoiceResult.error);
        //     }
        // }
        // console.log("after calling")

        // res.contentType("application/pdf");
        // res.sendFile(filePath, (err) => {
        //     if (err) {
        //         res.redirect('/errorPage');
        //     }
        // });
      
    }catch(error){
        console.log("Error in downloadInvoice function:", error);
        return res.redirect('/errorPage')
    }
}

const generateInvoice = async (orderId) => {
    try {
        console.log("generate function starting")
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

        const data = {
            apiKey: process.env.EASYINVOICE_API_KEY,
            mode: "development",
            images: {
                logo: "https://firebasestorage.googleapis.com/v0/b/lapshop-e3a21.appspot.com/o/Lapshop%20logo.png?alt=media&token=35295b10-88d1-4c59-a7f6-9c9e49d2758b",
            },
            sender: {
                company: "Lapshop",
                address: "main Street",
                zip: "12345",
                city: "Banglore",
                country: "India",
            },
            client: {
                company: order.address.name,
                address: `${order.address.addressLine} ${order.address.phone} ${order.address.district}`,
                zip: order.address.pincode,
                city: order.address.city,
                country: order.address.country,
            },
            information: {
                ID: order.orderId,
                date: moment(order.date).format("YYYY-MM-DD HH:mm:ss"),
            },
            products: orderedItems,
            bottomNotice: "Your satisfaction is our priority. Thank you for choosing us.",
            settings: {
                currency: "INR",
            },
        };

        console.log("before result")
        const result = await easyinvoice.createInvoice(data);
        console.log("after result :",result)

        const folderPath = path.join(__dirname, "..", "public", "invoice");
        const filePath = path.join(folderPath, `${order._id}.pdf`);

        fs.mkdirSync(folderPath, { recursive: true });
        fs.writeFileSync(filePath, result.pdf, "base64");

        order.invoice = filePath;
        await order.save();
        return { success: true };
    } catch (error) {
        console.log("here")
        console.log(error)
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
                return res.status(200).json({ success : true , message : "Return request accepted" })
            }else{                
                return res.status(400).json({ success : false , message : "Return request accepting error." })
            }
        }else{
            return res.status(400).json({ success : false , message : "No order found." })
        }
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

//To reject an order return request in admin from user
const adminRejectReturn = async(req,res)=>{
    try{
        const orderId = req.body.orderId
        const order = await Order.findById(orderId)
        const amount = order.orderTotal
        if(order){
            order.status = "Return rejected"
            order.statusDate = new Date()
            const updateOrder = await order.save()
            if(updateOrder){
                return res.status(200).json({ success : true , message : "Return request rejected" })
            }else{                
                return res.status(400).json({ success : false , message : "Return request rejecting error." })
            }
        }else{
            return res.status(400).json({ success : false , message : "No order found." })
        }
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
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