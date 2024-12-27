const mongoose = require('mongoose')

const saveForLaterCartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
},{
    timestamps : true
})

module.exports = mongoose.model("SaveForLaterCart",saveForLaterCartSchema)