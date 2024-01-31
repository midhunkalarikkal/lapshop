require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')

const app = express()
const PORT = process.env.PORT || 3000

app.get("/",(req,res)=>{
    res.send("Helo world")
})

app.listen(PORT,()=>{
    console.log(`Server is listening to the port 3000 http://localhost:${PORT}`)
})