const Coupon = require('../models/couponModel')
const Cart = require('../models/cartModel')


// To delete expired coupons
async function deleteExpiredCoupons() {
    try {
        const currentDate = new Date();
        const expiredCoupons = await Coupon.find({ endDate: { $lt: currentDate } });
        await Coupon.deleteMany({ _id: { $in: expiredCoupons.map(coupon => coupon._id) } });
        console.log(`Deleted ${expiredCoupons.length} expired coupons.`);
    } catch (error) {
        console.error('Error deleting expired coupons:', error);
    }
}

const intervalInMilliseconds = 24 * 60 * 60 * 1000;
setInterval(deleteExpiredCoupons, intervalInMilliseconds);

// To get the admin coupon page
const getAdminCoupon = async (req, res) => {
    try {
        const couponData = await Coupon.find()
        console.log("couponData :", couponData)
        return res.render('admin/adminCoupon', { title: "LapShop Admin", couponData })
    } catch (error) {
        console.log(error.message)
        return res.redirect('/admin/adminErrorPage')
        // return res.status(500).json({ message: "Internal server error" })
    }
}

// To add new coupon
const postAdminCoupon = async (req, res) => {
    try {

        console.log(req.body)
        const { couponName, couponCode, couponStartDate, couponEndDate, couponAmount, couponMinAmount } = req.body;

        const existingCoupon = await Coupon.findOne({
            $or: [
                { couponName: { $regex: new RegExp(couponName, 'i') } },
                { couponCode: { $regex: new RegExp(couponCode, 'i') } }
            ]
        });
        console.log("existing coupon :", existingCoupon)
        if (existingCoupon !== null) {
            return res.status(400).json({ error: "Coupon with the same name or code already exists" });
        }

        // Date validation
        if (new Date(couponStartDate) >= new Date(couponEndDate)) {
            return res.status(400).json({ error: "End date must be greater than start date" });
        }

        const newCoupon = new Coupon({
            couponName: couponName,
            couponCode: couponCode,
            startDate: couponStartDate,
            endDate: couponEndDate,
            minAmount: couponMinAmount,
            couponAmount: couponAmount
        });
        await newCoupon.save();
        return res.status(201).json({ message: "Coupon added successfully" });
    } catch (error) {
        console.log(error.message)
        return res.redirect('/admin/adminErrorPage')
    }
}

//To get the coupon edit page
const adminEditCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ _id: req.params.couponId })
        console.log("coupon :", coupon)
        return res.render('admin/adminEditCoupon', { title: "LapShop Admin", coupon })
    } catch (error) {
        console.log(error.message)
        return res.redirect('/admin/adminErrorPage')
        // return res.status(500).json({ message: "Internal server error" });
    }
}

//To update the coupon
const adminUpdateCoupon = async (req, res) => {
    try {
        console.log("Request body :", req.body)
        console.log("Request params :", req.params.couponId)
        const coupon = await Coupon.findById(req.params.couponId);

        const existCoupon = await Coupon.find({
            _id: { $ne: req.params.couponId },
            $or: [
                { couponCode: { $regex: new RegExp(`^${req.body.couponCode}$`, "i") } },
                { couponName: { $regex: new RegExp(req.body.couponName, 'i') } }
            ]
        });
        console.log("exist coupon :", existCoupon)
        if (existCoupon.length > 0) {
            return res.status(400).json({ message: "Coupon code already exist" });
        }

        coupon.couponName = req.body.couponName || coupon.couponName
        coupon.couponCode = req.body.couponCode || coupon.couponCode
        coupon.startDate = req.body.couponStartDate || coupon.startDate
        coupon.endDate = req.body.couponEndDate || coupon.endDate
        coupon.minAmount = req.body.couponMinAmount || coupon.minAmount
        coupon.couponAmount = req.body.couponAmount || coupon.couponAmount


        await coupon.save();
        console.log("Coupon updated succesfully")
        return res.status(200).json({ message: "Coupon updated successfully" });
    } catch (error) {
        console.log(error.message);
        return res.redirect('/admin/adminErrorPage')
        // return res.status(500).json({ message: "Internal server error" });
    }
};

//To block and unblock a coupon
const adminBlockCoupon = async (req, res) => {
    try {
        let coupon = await Coupon.findById(req.params.couponId);
        console.log("Coupon :", coupon)
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        coupon.isBlocked = req.body.blockStatus === 'block';
        await coupon.save();
        return res.json({ success: true });
    } catch (error) {
        console.log(error.message)
        return res.redirect('/admin/adminErrorPage')
        // res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// To apply coupon from user
const applyCoupon = async (req, res) => {
    try {
        console.log("hi")
        console.log("req.body :", req.body)
        console.log("session user :", req.session.user)
        const userId = req.session.user._id
        const userCouponCode = req.body.userCouponCode
        console.log("userCouponCode :", userCouponCode)
        const coupon = await Coupon.findOne({ $and: [{ couponCode: userCouponCode }, { isBlocked: false }] })
        console.log("User entered couponCode coupon :", coupon)
        const cart = await Cart.find({ userId: userId })
        console.log("User cart :", cart)
        const currentDate = new Date()
        const couponMinAmount = coupon ? coupon.minAmount : 0

        if (coupon) {
            if (userCouponCode) {
                    const appliedUserIds = coupon.appliedUsers.map(user => user._id.toString());
                    console.log("applied users :",appliedUserIds)

                    for(let i = 0; i < appliedUserIds.length; i++){
                        if(appliedUserIds[i] === userId){
                            console.log("userId existing")
                            return res.status(400).json({ success: false, message : "You have already used this coupon."})
                        }
                    }

                    if (cart[0].totalCartPrice >= coupon.minAmount) {
                        console.log("User is eligible for applying coupon")
                        console.log("Coupon appied")
                        let newSubTotal = 0
                        if (coupon.couponAmount <= 99) {
                            newSubTotal = cart[0].totalCartPrice - ((coupon.couponAmount * cart[0].totalCartPrice) / 100)
                            console.log("newSubTotal :", newSubTotal)
                        } else if (coupon.couponAmount > 99) {
                            newSubTotal = cart[0].totalCartPrice - coupon.couponAmount
                            console.log("newSubTotal :", newSubTotal)
                        }
                        
                        coupon.appliedUsers.push(userId)
                        await coupon.save()
                        return res.status(200).json({ success: true, message: "Coupon applied successfully", newSubTotal, couponAmount: coupon.couponAmount , userCouponCode })
                    } else {
                        console.log("User is not eligible for applying coupon")
                        return res.status(400).json({ success: false, message: `This coupon is valid for order purchase amount ${couponMinAmount}.`})
                    }
            } else {
                console.log("Coupon not appied")
                return res.status(200).json({ success: false, message: "Coupon code is not matching." })
            }
        }else {
            console.log("No coupon found")
            return res.status(200).json({ success: false, message: "Sorry, coupon is not available." })
        }
    } catch (error) {
        return res.status(500).json({ message : "Internal server error" })
    }
}

// To cancel applied coupon from user
const cancelCoupon = async(req,res)=>{
    try{
        console.log("cancel coupon api")
        console.log("req.body : ",req.body)
        const cancelCouponName = req.body.userCancelCouponCode
        const userId = req.session.user._id
            if(cancelCouponName){
                const coupon = await Coupon.findOne({ $and: [{ couponCode: cancelCouponName }, { isBlocked: false }] })
                console.log("User entered cancelCouponCode coupon :", coupon)
                const appliedUserIds = coupon.appliedUsers.map(user => user._id.toString());
                console.log("applied users :",appliedUserIds)
                const cart = await Cart.find({ userId : userId})
                const cartTotal = cart[0].totalCartPrice
                console.log("totalCartPrice :",cartTotal)

                for(let i = 0; i < appliedUserIds.length; i++){
                    if(appliedUserIds[i] === userId){
                        console.log("userId existing")
                        coupon.appliedUsers.pull(userId)
                        console.log("updated coupon appliedUsers array :",coupon.appliedUsers)
                        await coupon.save()
                        return res.status(200).json({ success: true, message : "Coupon cancelation successfull." , cartTotal })
                    }
                }
            }else{
                return res.status(400).json({ success : false, message : "coupon not found error."})
            }
        console.log("cancelCouponName :",cancelCouponName)
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ messag : "Internal server error" })
    }
}

module.exports = {
    ////// Api for the admin \\\\\\
    getAdminCoupon,
    postAdminCoupon,
    adminEditCoupon,
    adminUpdateCoupon,
    adminBlockCoupon,
    ////// Api for the user \\\\\\
    applyCoupon,
    cancelCoupon
}