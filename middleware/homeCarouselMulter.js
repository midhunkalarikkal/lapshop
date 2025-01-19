const multer = require("multer");
const path = require("path");
const imageTypes = /jpeg|jpg|png/;

////// Storage definition \\\\\\

// For the product images
const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname,'../public/images/HomeCarousels'));
  },
  filename:function(req,file,cb){
    const name = Date.now()+'-'+file.originalname;
    cb(null,name);
  }
});

////// Image uploader \\\\\\

// For the product images
const uploadHomeCarousel = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = imageTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return res.redirect('/admin/adminErrorPage')
    }
  }
});


module.exports = uploadHomeCarousel