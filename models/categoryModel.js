const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type : String,
        requird : true
    },
    isBlocked : {
        type : Boolean,
        required : true,
        default : false
    },
    created : {
        type : Date,
        requird : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Category',categorySchema)