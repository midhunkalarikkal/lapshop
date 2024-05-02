const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const path = require('path')
const createError = require('http-errors')
const morgan = require('morgan')
const app = express()
const config = require('./config/config')

require('dotenv').config()
config.mongooseConnection();

//session
app.use(cookieParser())
app.use(session({
    name : process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        name: 'myCookie',
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: true,
        // httpOnly: true,
    }
}))

//Cache control
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// middlewares for the url parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(morgan('dev'))

//view engine setup
app.set('views',path.join(__dirname, 'views'))
app.set('view engine','ejs')

//Static file serving
app.use('/static', express.static(path.join(__dirname, "public")))
app.use('/script', express.static(path.join(__dirname,"scripts")));

//Routes
const userRoute = require('./routes/user')
app.use('/',userRoute)
const adminRoute = require('./routes/admin')
app.use('/admin',adminRoute)

//Erro page middleware for user
app.use('/*',function(req,res){
    res.redirect('/errorPage')
})

const PORT = process.env.PORT || 4000
app.listen(PORT,()=>{
    console.log(`Server is listening to the port http://localhost:${PORT}`)
})