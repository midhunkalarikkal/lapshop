const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    brand : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Brand',
        required : true
    },
    description : {
        type : String,
        required : true
    },
    colour : {
        type : String,
        required : true
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required : true
    },
    noOfStock : {
        type : Number,
        required : true
    },
    realPrice : {
        type : Number,
        required :  true
    },
    offerPrice : {
        type : Number,
        required :  true
    },
    discountPercentage : {
        type : Number,
        required :  true
    },
    images : [
        {
        type : String,
        required :  true
        },
    ],
    isBlocked : {
        type : Boolean,
        required : true,
        default : false
    },
    screenSize : {
        type : String,
        required : false
    },
    hdSize : {
        type : String,
        required : false
    },
    cpuModel : {
        type : String,
        required : false
    },
    ramSize : {
        type : String,
        required : false
    },
    os : {
        type : String,
        required : false
    },
    gpu : {
        type : String,
        required : false
    },
    about : [
        {
            type : String,
            required : false
        }
    ]
},{
    timestamps : true
})

module.exports = mongoose.model('Product',productSchema)