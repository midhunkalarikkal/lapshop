const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    categoryName : {
        type : Array,
        requird : true
    },
    created : {
        type : Date,
        requird : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Category',categorySchema)