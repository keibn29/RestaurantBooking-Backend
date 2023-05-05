import multer from "multer";
import path from "path";
import appRoot from "app-root-path";

const storageUser = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, appRoot + "/src/public/images/users/");
  },

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

  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const storageDish = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, appRoot + "/src/public/images/dishes/");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const storageHandbook = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, appRoot + "/src/public/images/handbooks/");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    req.fileValidationError = "Only image files are allowed!";
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

export const uploadDish = multer({
  storage: storageDish,
  fileFilter: imageFilter,
});

export const uploadHandbook = multer({
  storage: storageHandbook,
  fileFilter: imageFilter,
});
