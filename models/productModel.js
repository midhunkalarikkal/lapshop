const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    brand : {
        type : Array,
        requird : true
    },
    name : {
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
        type : Object,
        requird : true
    },
    quantity : {
        type : Number,
        requird : true
    },
    realprice : {
        type : Number,
        require :  true
    },
    offerprice : {
        type : Number,
        require :  true
    },
    discountpercentage : {
        type : Number,
        require :  true
    },
    images : {
        type : Array,
        require :  true
    },
    created : {
        type : Date,
        requird : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Product',productSchema)