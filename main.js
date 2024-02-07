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
    name : "user",
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
    cookie: {
        name: 'myCookie',
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: true,
    }
}))

//middlewares
// app.use(express.urlencoded({ extended: true }))
// app.use(express.json())
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

// app.get("/submitError", (req, res) => {
//     const errorMessage = req.query.message;
//     res.render("user/registration", { title: "LapShop Register", type: "danger", message: errorMessage });
// });

const PORT = process.env.PORT || 4000
app.listen(PORT,()=>{
    console.log(`Server is listening to the port http://localhost:${PORT}`)
})