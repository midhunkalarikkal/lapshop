const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type : String,
        requird : true
    },
    image : {
        type : String,
        required : true
    },
    desc : {
        type : String,
        required : true
    },
    isBlocked : {
        type : Boolean,
        required : true,
        default : false
    }
},{
    timestamps : true
})

module.exports = mongoose.model('Category',categorySchema)