const User = require('../models/userModel');

const isLoggedIn = async (req, res, next) => {
   try {
      if (req.session && req.session.user) {
         return next();
      }

      const message = 'Session expired, please login';
      const type = 'danger';

      return res.redirect(`/login?message=${encodeURIComponent(message)}&type=${type}`);
   } catch (error) {
      return next(error);
   }
};

const isBlocked = async (req, res, next) => {
   try {
      if (!req.session || !req.session.user) {
         return res.redirect('/login');
      }

      const user = await User.findById(req.session.user._id);

      if (!user) {
         req.session.user = null;
         req.session.userNC = null;

         return res.redirect('/login');
      }

      if (user.isblocked) {
         user.loggedIn = false;

         await user.save();

         req.session.user = null;
         req.session.userNC = null;

         const message = 'Your account is blocked, Please contact us';
         const type = 'danger';

         return res.redirect(`/login?message=${encodeURIComponent(message)}&type=${type}`);
      }

      return next();
   } catch (error) {
      return next(error);
   }
};

module.exports = {
   isLoggedIn,
   isBlocked,
};
