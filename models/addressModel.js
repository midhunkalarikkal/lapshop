const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    addressLine: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    city: {
        type : String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Address', addressSchema)