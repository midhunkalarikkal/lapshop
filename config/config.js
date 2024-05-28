const mongoose = require('mongoose')
require("dotenv").config()

function mongooseConnection(){
    mongoose.set("strictQuery",true)
    mongoose.connect(process.env.MONGOOSE_CONNECTION).then(()=>{
        console.log("url : ",process.env.MONGOOSE_CONNECTION)
        console.log("db connected")
    })
}

module.exports = {
    mongooseConnection
}