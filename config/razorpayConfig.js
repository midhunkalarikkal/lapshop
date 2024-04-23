
const Razorpay = require("razorpay");

const{KEY_ID, KEY_SECRET}= process.env;

const razorpayInstance =new Razorpay({
  key_id:KEY_ID,
  key_secret:KEY_SECRET
})


module.exports = razorpayInstance;