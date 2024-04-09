const Coupon = require('../models/couponModel')

// To get the admin coupon page
const getAdminCoupon = async(req,res)=>{
    try{
        const couponData = await Coupon.find()
        console.log("couponData :",couponData)
        return res.render('admin/adminCoupon' , {title : "LapShop Admin"  , couponData})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

// To add new coupon
const postAdminCoupon = async(req,res)=>{
    try{

        console.log(req.body)
            const { couponName , couponCode , couponStartDate , couponEndDate , couponAmount , couponMinAmount} = req.body;

            const existingCoupon = await Coupon.findOne({  couponName: { $regex: new RegExp(couponName, 'i') } });
            if (existingCoupon) {
                return res.status(400).json({ error: "Coupon with same name already exists" });
            }

            // Date validation
            if (new Date(couponStartDate) >= new Date(couponEndDate)) {
                return res.status(400).json({ error: "End date must be after start date" });
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
            return res.status(201).json({ message: "Coupon added successfully"});
    }catch(error){
        console.log(error.message)
    }
}

//To get the coupon edit page
const adminEditCoupon = async(req,res)=>{
    try{
        const coupon = await Coupon.findOne({_id : req.params.couponId})
        console.log("coupon :",coupon)
        return res.render('admin/adminEditCoupon',{title : "LapShop Admin",coupon})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error" });
    }
}

//To update the coupon
const adminUpdateCoupon = async(req, res) => {
    try {
        console.log("Request body :",req.body)
        console.log("Request params :",req.params.couponId)
        const coupon = await Coupon.findById(req.params.couponId);

        // // Check if start date or end date is empty
        if (req.body.couponStartDate === "" || req.body.couponEndDate === "") {
            coupon.couponName = req.body.couponName;
            coupon.couponCode = req.body.couponCode;
            coupon.minAmount = req.body.couponMinAmount,
            coupon.couponAmount = req.body.couponAmount;
        } else {
            coupon.couponName = req.body.couponName;
            coupon.couponCode = req.body.couponCode;
            coupon.startDate = req.body.couponStartDate;
            coupon.endDate = req.body.couponEndDate;
            coupon.minAmount = req.body.couponMinAmount,
            coupon.couponAmount = req.body.couponAmount;
        }

        // // Save the updated coupon
        await coupon.save();
        console.log("UPdated succesfully")
        return res.status(200).json({ message: "Coupon updated successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//To block and unblock a coupon
const adminBlockCoupon = async (req, res) => {
    try {
        let coupon = await Coupon.findById(req.params.couponId);
        console.log("Coupon :",coupon)
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        coupon.isBlocked = req.body.blockStatus === 'block';
        await coupon.save();
        return res.json({ success: true });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    getAdminCoupon,
    postAdminCoupon,
    adminEditCoupon,
    adminUpdateCoupon,
    adminBlockCoupon
}