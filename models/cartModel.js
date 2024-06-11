const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number
        },
        price: {
            type: Number
        },
        totalPrice: {
            type: Number,
            default : 0
        },
        discountPrice: {
            type: Number,
            default: 0
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    totalCartPrice: {
        type: Number,
        default: 0
    },
    totalCartDiscountPrice: {
        type: Number,
        default: 0
    },
    couponApplied: {
        type: Boolean,
        default: false
    },
    couponAmount: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
    }
})

module.exports = mongoose.model("Cart",cartSchema)