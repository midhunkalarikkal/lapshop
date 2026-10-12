const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');
const { appConfig } = require('../config/appConfig');

////// To delete expired coupons \\\\\\
async function deleteExpiredCoupons() {
   try {
      const currentDate = new Date();
      const expiredCoupons = await Coupon.find({ endDate: { $lt: currentDate } });
      await Coupon.deleteMany({ _id: { $in: expiredCoupons.map((coupon) => coupon._id) } });
   } catch (error) {
      if (appConfig.isDev) {
         console.error('Error deleting expired coupons:', error);
      }
   }
}

setInterval(deleteExpiredCoupons, 3600000);

// To get the admin coupon page
const getAdminCoupon = async (_req, res, next) => {
   try {
      const couponData = await Coupon.find();
      return res.render('admin/adminCouponList', { couponData });
   } catch (error) {
      return next(error);
   }
};

// To add new coupon
const postAdminCoupon = async (req, res, next) => {
   try {
      const {
         couponName,
         couponCode,
         couponStartDate,
         couponEndDate,
         couponAmount,
         couponMinAmount,
      } = req.body;

      const existingCoupon = await Coupon.findOne({
         $or: [
            { couponName: { $regex: new RegExp(couponName, 'i') } },
            { couponCode: { $regex: new RegExp(couponCode, 'i') } },
         ],
      });

      if (existingCoupon !== null) {
         return res.status(400).json({ error: 'Coupon with the same name or code already exists' });
      }

      if (new Date(couponStartDate) >= new Date(couponEndDate)) {
         return res.status(400).json({ error: 'End date must be greater than start date' });
      }

      const newCoupon = new Coupon({
         couponName: couponName,
         couponCode: couponCode,
         startDate: couponStartDate,
         endDate: couponEndDate,
         minAmount: couponMinAmount,
         couponAmount: couponAmount,
      });
      await newCoupon.save();
      return res.status(201).json({ message: 'Coupon added successfully' });
   } catch (error) {
      return next(error);
   }
};

//To get the coupon edit page
const adminEditCoupon = async (req, res, next) => {
   try {
      const coupon = await Coupon.findOne({ _id: req.params.couponId });
      return res.render('admin/adminEditCoupon', { coupon });
   } catch (error) {
      return next(error);
   }
};

//To update the coupon
const adminUpdateCoupon = async (req, res, next) => {
   try {
      const coupon = await Coupon.findById(req.params.couponId);

      const existCoupon = await Coupon.find({
         _id: { $ne: req.params.couponId },
         $or: [
            { couponCode: { $regex: new RegExp(`^${req.body.couponCode}$`, 'i') } },
            { couponName: { $regex: new RegExp(req.body.couponName, 'i') } },
         ],
      });
      if (existCoupon.length > 0) {
         return res.status(400).json({ message: 'Coupon code already exist' });
      }

      coupon.couponName = req.body.couponName || coupon.couponName;
      coupon.couponCode = req.body.couponCode || coupon.couponCode;
      coupon.startDate = req.body.couponStartDate || coupon.startDate;
      coupon.endDate = req.body.couponEndDate || coupon.endDate;
      coupon.minAmount = req.body.couponMinAmount || coupon.minAmount;
      coupon.couponAmount = req.body.couponAmount || coupon.couponAmount;

      await coupon.save();
      return res.status(200).json({ message: 'Coupon updated successfully' });
   } catch (error) {
      return next(error);
   }
};

//To block and unblock a coupon
const adminBlockCoupon = async (req, res, next) => {
   try {
      let coupon = await Coupon.findById(req.params.couponId);
      if (!coupon) {
         return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      coupon.isBlocked = req.body.blockStatus === 'block';
      await coupon.save();
      return res.json({ success: true });
   } catch (error) {
      return next(error);
   }
};

// To apply coupon from user
const applyCoupon = async (req, res, next) => {
   try {
      const userId = req.session.user._id;
      const userCouponCode = req.body.userCouponCode;
      const coupon = await Coupon.findOne({
         $and: [{ couponCode: userCouponCode }, { isBlocked: false }],
      });

      const cart = await Cart.findOne({ userId: userId });
      if (!cart) {
         return res.status(400).json({ success: false, message: 'Cart not found.' });
      }

      const couponMinAmount = coupon ? coupon.minAmount : 0;

      if (coupon) {
         if (userCouponCode) {
            const appliedUserIds = coupon.appliedUsers.map((user) => user._id.toString());

            for (let i = 0; i < appliedUserIds.length; i++) {
               if (appliedUserIds[i] === userId) {
                  return res
                     .status(400)
                     .json({ success: false, message: 'You have already used this coupon.' });
               }
            }

            let couponAmount = 0;
            if (cart.totalCartPrice >= coupon.minAmount) {
               if (coupon.couponAmount <= 99) {
                  couponAmount = (coupon.couponAmount * cart.totalCartPrice) / 100;
               } else if (coupon.couponAmount > 99) {
                  couponAmount = coupon.couponAmount;
               }
               const newSubTotal = cart.totalCartPrice - couponAmount;

               coupon.appliedUsers.push(userId);
               await coupon.save();

               cart.couponApplied = true;
               cart.totalCartPrice = newSubTotal;
               cart.couponAmount = couponAmount;
               cart.couponCode = userCouponCode;
               await cart.save();

               return res.status(200).json({
                  success: true,
                  message: 'Coupon applied successfully',
                  newSubTotal,
                  couponAmount: coupon.couponAmount,
                  userCouponCode,
               });
            } else {
               return res.status(400).json({
                  success: false,
                  message: `This coupon is valid for order purchase amount ${couponMinAmount}.`,
               });
            }
         } else {
            return res
               .status(200)
               .json({ success: false, message: 'Coupon code is not matching.' });
         }
      } else {
         return res
            .status(200)
            .json({ success: false, message: 'Sorry, coupon is not available.' });
      }
   } catch (error) {
      return next(error);
   }
};

// To cancel applied coupon from user
const cancelCoupon = async (req, res, next) => {
   try {
      const userId = req.session.user._id;

      const cart = await Cart.findOne({ userId: userId });
      if (!cart) {
         return res.status(400).json({ success: false, message: 'Cart not found.' });
      }
      // const cancelCouponName = req.body.userCancelCouponCode
      const cancelCouponName = cart.couponCode;

      if (cancelCouponName) {
         const coupon = await Coupon.findOne({
            $and: [{ couponCode: cancelCouponName }, { isBlocked: false }],
         });
         if (!coupon) {
            return res.status(400).json({ success: false, message: 'Coupon not found.' });
         }

         const appliedUserIds = coupon.appliedUsers.map((user) => user._id.toString());
         for (let i = 0; i < appliedUserIds.length; i++) {
            if (appliedUserIds[i] === userId) {
               coupon.appliedUsers.pull(userId);
               await coupon.save();
            }
         }

         let couponAmount = 0;
         if (coupon.couponAmount <= 99) {
            couponAmount = (coupon.couponAmount * cart.totalCartPrice) / 100;
         } else if (coupon.couponAmount > 99) {
            couponAmount = coupon.couponAmount;
         }
         const newSubTotal = cart.totalCartPrice + couponAmount;

         cart.couponApplied = false;
         cart.totalCartPrice = newSubTotal;
         cart.couponAmount = 0;
         cart.couponCode = '';
         const cartTotal = cart.totalCartPrice;
         await cart.save();
         return res
            .status(200)
            .json({ success: true, message: 'Coupon cancelation successfull.', cartTotal });
      } else {
         return res.status(400).json({ success: false, message: 'coupon not found.' });
      }
   } catch (error) {
      return next(error);
   }
};

module.exports = {
   ////// Api for the admin \\\\\\
   getAdminCoupon,
   postAdminCoupon,
   adminEditCoupon,
   adminUpdateCoupon,
   adminBlockCoupon,
   ////// Api for the user \\\\\\
   applyCoupon,
   cancelCoupon,
};
