require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../../models/userModel')
const nodemailer = require('nodemailer')
const crypto = require("crypto")
const bodyParser = require('body-parser');
const session = require('express-session')
const express = require('express')
const app = express()

app.use(session({
    secret: 'userkey', // Change this to a secure secret key
    resave: false,
    saveUninitialized: false
}));

//for storing otp
let generatedOtp = "";

//for sending email
const sendVerifyMail = async (name, email, userData) => {
    try {
        // Generating OTP
        function generateOTP() {
            const crypto = require('crypto'); // Require crypto inside the function
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (let i = 0; i < 6; i++) {
                const index = crypto.randomInt(0, chars.length);
                generatedOtp += chars[index];
            }
            return generatedOtp;
        }

        const userRegisterOtp = generateOTP();
        console.log('Generated OTP:', userRegisterOtp);

        //sending otp
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "lapshopotp@gmail.com",
                pass: "nyxnnbafpfqznvvh",
            },
        })

        const mailOptions = {
            from: 'lapshopotp@gmail.com',
            to: email,
            subject: "OTP for register in LapShop Ecommerce",
            text: `Hi ${name} welcome to Lapshop shopping. Here is your Otp ${userRegisterOtp}`,
            html: `${userRegisterOtp}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            } else {
                console.log("Email has been sended:-", info.response)
            }
        })

        const sendMail = async (transporter, mailOptions) => {
            try {
                await transporter.sendMail(mailOptions);
                userData.save()
                console.log("Email sent successfully");
            } catch (err) {
                console.log(err);
                throw new Error("Failed to send email");
            }
        };

        sendMail(transporter, mailOptions);

    } catch (error) {
        console.log(error.message)
    }
}

const getHome = async (req, res) => {
    try {
        res.render('user/home', { title: "LapShop home" })
    } catch (error) {
        console.log(error)
    }
}


const getLogin = async (req, res) => {
    try {
        res.render('user/login', { title: "LapShop login", type: "", message: "" })
    } catch (error) {
        console.log(error)
    }
}

const postLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        const { email, password } = req.body;

        if (user) {
            if (user.isblocked) {
                return res.render("user/login", { title: "LapShop login", type: "danger", message: "Contact us" })
            }

            //password matching
            bcrypt.compare(password, user.password, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).send('An error occurred while comparing the passwords.');
                } if (result) {
                    // Passwords match
                    req.session.user = user;
                    return res.render("user/home", { title: "LapShop login" })
                } else {
                    // Passwords don't match    
                    return res.render("user/login", { title: "LapShop login", type: "danger", message: "Incorrect password" })
                }
            });
        } else {
            return res.render("user/login", { title: "LapShop login", type: "danger", message: "No user found" })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const getRegister = async (req, res) => {
    try {
        res.render('user/registration', { title: "LapShop Register", type: "", message: "" })
    } catch (error) {
        console.log(error)
    }
}

const postRegister = async (req, res) => {
    try {
        // for if the user is exist or not
        const existingUser = await User.findOne({ email: req.body.email })
        if (existingUser) {
            return res.render('user/registration', { title: "LapShop Register", type: "danger", message: "User already exists" })
        }

        const hashpassword = await bcrypt.hash(req.body.password, 10)

        const user = new User({
            fullname: req.body.fullname,
            email: req.body.email,
            phone: req.body.phone,
            password: hashpassword,
            isblocked: 0,
        })

        // const userData = await user.save()
        const userData = user

        if (userData) {
            console.log("User saved in db")
            sendVerifyMail(req.body.fullname, req.body.email, userData)
            return res.render('user/otpvalidation', { title: "LapShop OTP verification", type: "success", message: "Check your email for otp" })
        } else {
            return res.render('user/registration', { title: "LapShop register", type: "danger", message: "Registration error" })
        }
    } catch (error) {
        console.log(error.message)
        return res.render("user/registration", { title: "LapShop register", type: "danger", message: error.message });
    }
}

const postOtp = async (req, res) => {
    try {
        if (generatedOtp === req.body.otp) {
            generatedOtp = ""
            return res.render('user/login', { title: "LapShop login", type: "success", message: "Email verified successfullyy" })

        }

    } catch (error) {
        console.log(error.message)
    }
}

const getOtp = async (req, res) => {
    try {
        res.render('user/otpvalidation', { title: "LapShop otp", type: "", message: "" })
    } catch (error) {
        console.log(error.message)
    }
}

const getNavbar = async (req, res) => {
    try {
        res.render("user/test")
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    getLogin,
    getRegister,
    postRegister,
    getOtp,
    postOtp,
    getNavbar,
    getHome,
    postLogin,
}