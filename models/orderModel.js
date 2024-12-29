const mongoose = require('mongoose')
const Address = require('../models/addressModel')

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
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
        }
    }],
    address:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["cod" , "wallet" , "razorpay" , "wallet with razorpay"],
        default: "cod"
    },
    walletDebitedAmount: {
        type: Number,
        default : 0
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
    },
    couponApplied:{
        type: Boolean,
        required: true,
        default: false
    },
    paymentStatus : {
        type: Boolean,
        required: true,
        default: false
    },
    status:{
        type: String,
        enum: ["Processing" , "Shipped" , "Delivered" , "Admin cancelled","Request return","Return accepted", "Return rejected" , "Cancelled" ],
        default: "Processing"
    },
    statusDate : {
        type : Date
    },
    trackArray: [
        {
            status: {
                type: String,
                required: true,
                enum: ["Processing" , "Shipped" , "Delivered" , "Admin cancelled","Request return","Return accepted", "Return rejected" , "Cancelled" ],
                default: "Processing"
            },
            updatedAt: {
                type: Date,
                required: true,
                default: Date.now,
            },
            paymentStatus: {
                type: String,
                required: false,
                default: false
            },
            note: {
                type: String,
                required: false
            }
        },
    ],
    invoice : {
        type : String
    }
},{
    timestamps : true
})

module.exports = mongoose.model("Order",orderSchema)