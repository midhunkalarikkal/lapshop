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
    appliedUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }],
    isBlocked:{
        type: Boolean,
        required: true,
        default: false
    }
},{
    timestamps : true
})

module.exports = mongoose.model("Coupon",couponSchema)