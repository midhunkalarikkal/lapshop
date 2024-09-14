const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const path = require('path')
const app = express()
const config = require('./config/config')
const passport = require('passport');

require('dotenv').config()
config.mongooseConnection();

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
    }
}))

//Cache control
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

app.use(passport.initialize());
app.use(passport.session());

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

//Error page middleware for user
app.use('/*',function(req,res){
    res.redirect('/errorPage')
})

//Error page middleware for admin
app.use('/admin/*',function(req,res){
    res.redirect('/adminErrorPage')
})

const PORT = process.env.PORT || 8001
app.listen(PORT,()=>{
    console.log(`Server is listening to the port http://localhost:${PORT}`)
})

