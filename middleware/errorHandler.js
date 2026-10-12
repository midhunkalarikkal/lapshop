const { appConfig } = require('../config/appConfig');

const errorHandler = (err, req, res, next) => {
   if (appConfig.isDev) {
      console.error('Request failed:', err);
   }

   if (res.headersSent) {
      return next(err);
   }

   const isAdminRoute = req.path === '/admin' || req.path.startsWith('/admin/');

   if (isAdminRoute) {
      return res.redirect('/admin/adminErrorPage');
   }

   return res.redirect('/errorPage');
};

module.exports = errorHandler;
