require('dotenv').config();

const appConfig = {
   port: process.env.PORT,
   isDev: process.env.NODE_ENV === 'development',
};

module.exports = {
   appConfig,
};
