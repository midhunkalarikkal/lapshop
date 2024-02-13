const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        requird : true
    },
    brand : {
        type : String,
        requird : true
    },
    description : {
        type : String,
        requird : true
    },
    colour : {
        type : String,
        requird : true
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        requird : true
    },
    noOfStock : {
        type : Number,
        requird : true
    },
    realPrice : {
        type : Number,
        require :  true
    },
    offerPrice : {
        type : Number,
        require :  true
    },
    discountPercentage : {
        type : Number,
        require :  true
    },
    images : [
        {
        type : String,
        require :  true
        },
    ],
    isBlocked : {
        type : Boolean,
        require : true,
        default : false
    },
    created : {
        type : Date,
        requird : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Product',productSchema)