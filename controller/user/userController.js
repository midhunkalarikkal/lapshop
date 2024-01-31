require('dotenv').config()
const User = require('../../models/userModel')

const getLogin = async(req,res)=>{
    try{
        res.render('user/login')
    }catch(error){
        console.log(error)
    }
}

const getRegister = async(req,res)=>{
    try{
        res.render('user/registration')
    }catch(error){
        console.log(error)
    }
}

module.exports = {
    getLogin,
    getRegister
}