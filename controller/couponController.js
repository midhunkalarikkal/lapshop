const Coupon = require('../models/couponModel')
const Cart = require('../models/cartModel')

////// To delete expired coupons \\\\\\
async function deleteExpiredCoupons() {
    try {
        const currentDate = new Date();
        const expiredCoupons = await Coupon.find({ endDate: { $lt: currentDate } });
        const delc = await Coupon.deleteMany({ _id: { $in: expiredCoupons.map(coupon => coupon._id) } });
        console.log("deleted coupon : ",delc)
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
        return res.render('admin/adminCouponList', { couponData })
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

// To add new coupon
const postAdminCoupon = async (req, res) => {
    try {
        const { couponName, couponCode, couponStartDate, couponEndDate, couponAmount, couponMinAmount } = req.body;

        const existingCoupon = await Coupon.findOne({
            $or: [
                { couponName: { $regex: new RegExp(couponName, 'i') } },
                { couponCode: { $regex: new RegExp(couponCode, 'i') } }
            ]
        });

        if (existingCoupon !== null) {
            return res.status(400).json({ error: "Coupon with the same name or code already exists" });
        }

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
        return res.redirect('/admin/adminErrorPage')
    }
}

//To get the coupon edit page
const adminEditCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ _id: req.params.couponId })
        return res.render('admin/adminEditCoupon', { coupon })
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

//To update the coupon
const adminUpdateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.couponId);

        const existCoupon = await Coupon.find({
            _id: { $ne: req.params.couponId },
            $or: [
                { couponCode: { $regex: new RegExp(`^${req.body.couponCode}$`, "i") } },
                { couponName: { $regex: new RegExp(req.body.couponName, 'i') } }
            ]
        });
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
        return res.status(200).json({ message: "Coupon updated successfully" });
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
};

//To block and unblock a coupon
const adminBlockCoupon = async (req, res) => {
    try {
        let coupon = await Coupon.findById(req.params.couponId);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        coupon.isBlocked = req.body.blockStatus === 'block';
        await coupon.save();
        return res.json({ success: true });
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

// To apply coupon from user
const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.user._id
        const userCouponCode = req.body.userCouponCode
        const coupon = await Coupon.findOne({ $and: [{ couponCode: userCouponCode }, { isBlocked: false }] })
        const cart = await Cart.find({ userId: userId })
        const currentDate = new Date()
        const couponMinAmount = coupon ? coupon.minAmount : 0

        if (coupon) {
            if (userCouponCode) {
                    const appliedUserIds = coupon.appliedUsers.map(user => user._id.toString());

                    for(let i = 0; i < appliedUserIds.length; i++){
                        if(appliedUserIds[i] === userId){
                            return res.status(400).json({ success: false, message : "You have already used this coupon."})
                        }
                    }

                    if (cart[0].totalCartPrice >= coupon.minAmount) {
                        let newSubTotal = 0
                        if (coupon.couponAmount <= 99) {
                            newSubTotal = cart[0].totalCartPrice - ((coupon.couponAmount * cart[0].totalCartPrice) / 100)
                        } else if (coupon.couponAmount > 99) {
                            newSubTotal = cart[0].totalCartPrice - coupon.couponAmount
                        }
                        
                        coupon.appliedUsers.push(userId)
                        await coupon.save()
                        return res.status(200).json({ success: true, message: "Coupon applied successfully", newSubTotal, couponAmount: coupon.couponAmount , userCouponCode })
                    } else {
                        return res.status(400).json({ success: false, message: `This coupon is valid for order purchase amount ${couponMinAmount}.`})
                    }
            } else {
                return res.status(200).json({ success: false, message: "Coupon code is not matching." })
            }
        }else {
            return res.status(200).json({ success: false, message: "Sorry, coupon is not available." })
        }
    } catch (error) {
        res.redirect('/errorPage')
    }
}

// To cancel applied coupon from user
const cancelCoupon = async(req,res)=>{
    try{
        const cancelCouponName = req.body.userCancelCouponCode
        const userId = req.session.user._id
            if(cancelCouponName){
                const coupon = await Coupon.findOne({ $and: [{ couponCode: cancelCouponName }, { isBlocked: false }] })
                const appliedUserIds = coupon.appliedUsers.map(user => user._id.toString());
                const cart = await Cart.find({ userId : userId})
                const cartTotal = cart[0].totalCartPrice

                for(let i = 0; i < appliedUserIds.length; i++){
                    if(appliedUserIds[i] === userId){
                        coupon.appliedUsers.pull(userId)
                        await coupon.save()
                        return res.status(200).json({ success: true, message : "Coupon cancelation successfull." , cartTotal })
                    }
                }
            }else{
                return res.status(400).json({ success : false, message : "coupon not found error."})
            }
    }catch(error){
        res.redirect('/errorPage')
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