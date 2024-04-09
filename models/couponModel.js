const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true
    },
    couponCode: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    couponAmount:{
        type: Number,
        required: true
    },
    minAmount:{
        type: Number,
        required: true
    },
    isBlocked:{
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = mongoose.model("Coupon",couponSchema)