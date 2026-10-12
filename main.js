require('dotenv').config();

const dns = require('node:dns/promises');
if (process.env.NODE_ENV !== 'production') {
   dns.setServers(['1.1.1.1', '1.0.0.1']);
}

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const morgan = require('morgan');
const path = require('path');
const app = express();

const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');
const { appConfig } = require('./config/appConfig');

config.mongooseConnection();

app.use(cookieParser());
app.use(
   session({
      name: process.env.SESSION_NAME,
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
         name: 'myCookie',
         maxAge: 1000 * 60 * 60 * 2,
         sameSite: true,
      },
   }),
);

//Cache control
app.use((req, res, next) => {
   res.set('Cache-Control', 'no-store');
   next();
});

// middlewares for the url parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Static file serving
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/script', express.static(path.join(__dirname, 'scripts')));

// Health check endpoint
app.get('/health', (req, res) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.status(200).json({
      status: 'ok',
   });
});

//Routes
app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use(errorHandler);

//Error page middleware for admin
app.use('/admin/*', (_req, res) => {
   return res.status(404).render('admin/adminErrorPage');
});

//Error page middleware for user
app.use('/*', (_req, res) => {
   return res.status(404).render('user/errorPage');
});

app.listen(appConfig.port, () => {
    const isProduction = !appConfig.isDev;

    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║                  🛒 LAPSHOP                      ║
║             E-Commerce Platform                  ║
║                                                  ║
╚══════════════════════════════════════════════════╝

  🚀 Server Status : Running
  🌍 Environment   : ${isProduction ? 'Production' : 'Development'}
  🔌 Port          : ${appConfig.port}
  🔗 Local URL     : http://localhost:${appConfig.port}

  ✔ LapShop server started successfully!
`);
});