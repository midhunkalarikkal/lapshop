const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fullname : {
        type : String,
        requird : true
    },
    email : {
        type : String,
        requird : true
    },
    phone : {
        type : String,
        requird : true
    },
    password : {
        type : String,
        requird : true
    },
    isblocked : {
        type : Boolean,
        requird : true,
        default :false
    },
    profileimage : {
        type : String,
        requird : true
    },
    address : {
        type : Array,
        require :  true,
    },
    created : {
        type : Date,
        requird : true,
        default : Date.now
    }
})

module.exports = mongoose.model('User',userSchema)