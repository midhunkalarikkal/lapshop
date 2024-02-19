const mongoose = require('mongoose')

const homeCarouselSchema = new mongoose.Schema({
    tagline: {
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
    },
    created : {
        type : Date,
        requird : true,
        default : Date.now
    }
})

module.exports = mongoose.model('HomeCarousel',homeCarouselSchema)