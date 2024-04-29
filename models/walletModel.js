const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    type : {
        type :  String,
        enum : ["debit","credit"],
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    updatedAt : {
        type : Date,
        default : Date.now
    }
})

module.exports = mongoose.model("Wallet", walletSchema)