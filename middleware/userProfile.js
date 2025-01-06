const multer = require("multer");
const path = require("path");
const imageTypes = /jpeg|jpg|png|svg|webp/;

////// Storage definition \\\\\\

// For the profile images
const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname,'/static/images/UserProfile'));
  },
  filename:function(req,file,cb){
    const name = Date.now()+'-'+file.originalname;
    cb(null,name);
  }
});

////// Image uploader \\\\\\

// For the profile images
const uploadProfileImage = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = imageTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return res.redirect('/errorPage')
    }
  }
});


module.exports = uploadProfileImage