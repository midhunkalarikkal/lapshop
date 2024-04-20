const mongoose = require('mongoose')
const Address = require('../models/addressModel')

const orderSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderedItems:[{
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity:{
            type: Number,
            required: true
        },
        totalPrice:{
            type: Number,
            required: true
        },
        status:{
            type: String,
            enum: ["Processing" , "Shipped" , "Delivered" , "User cancelled" , "admin cancelled" , "return approved" , "return rejected" ],
            default: "Processing"
        },
        statusDate : {
            type : Date
        }
    }],
    address:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["cod" , "wallet" , "razorpay"],
        default: "cod"
    },
    paidAt: {
        type: Date,
    },
    deliveryCharge:{
        type: Number,
        required: true,
        default: 0
    },
    orderTotal:{
        type: Number,
        required: true
    },
    orderDate:{
        type: Date
    }
})

module.exports = mongoose.model("Order",orderSchema)