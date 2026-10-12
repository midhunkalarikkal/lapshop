const isAdminLoggedIn = async (req, res, next) => {
   try {
      if (req.session.adminData) {
         return next();
      } else {
         return res.redirect(`/admin/`);
      }
   } catch (error) {
      return next(error);
   }
};

const isAdminLogout = async (req, res, next) => {
   try {
      if (req.session.adminData) {
         res.redirect('/admin/home');
      } else {
         next();
      }
   } catch (error) {
      return next(error);
   }
};

module.exports = {
   isAdminLoggedIn,
   isAdminLogout,
};
