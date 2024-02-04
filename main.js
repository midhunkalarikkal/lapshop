require('dotenv').config()
const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const path = require('path')
const createError = require('http-errors')
const morgan = require('morgan')
const app = express()
const config = require('./config/config')
config.mongooseConnection();

const PORT = process.env.PORT || 4000

//view engine setup
app.set('views',path.join(__dirname, 'views'))
app.set('view engine','ejs')

//Routes
const userRoute = require('./routes/user')

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
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/',userRoute)

//Static file serving
app.use('/static', express.static(path.join(__dirname, "public")))
app.use('/script', express.static(path.join(__dirname,"scripts")));

app.use(morgan('dev'))

app.get("/submitError", (req, res) => {
    const errorMessage = req.query.message;
    res.render("user/registration", { title: "LapShop Register", type: "danger", message: errorMessage });
});

app.listen(PORT,()=>{
    console.log(`Server is listening to the port 3000 http://localhost:${PORT}`)
})