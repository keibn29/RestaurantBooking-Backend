import multer from "multer";
import path from "path";
import appRoot from "app-root-path";

const storageUser = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, appRoot + "/src/public/images/users/");
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const storageRestaurant = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, appRoot + "/src/public/images/restaurants/");
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (
    !file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|avif|AVIF)$/)
  ) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

export const uploadUser = multer({
  storage: storageUser,
  fileFilter: imageFilter,
});

export const uploadRestaurant = multer({
  storage: storageRestaurant,
  fileFilter: imageFilter,
});
