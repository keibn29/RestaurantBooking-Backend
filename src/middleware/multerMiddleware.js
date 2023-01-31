import multer from "multer";
import path from "path";
import appRoot from "app-root-path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, appRoot + "/src/public/images/");
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
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
});

// const handleUploadImage = (image) => {
//   let upload = multer({
//     storage: storage,
//     fileFilter: imageFilter,
//   }).single("image");

//   upload(req, res, function (err) {
//     if (req.fileValidationError) {
//         return res.send(req.fileValidationError);
//     }
//     // else if (!req.file) {
//     //   return res.send("Please select an image to upload");
//     // }
//     else if (err instanceof multer.MulterError) {
//         return res.send(err);
//     } else if (err) {
//         return res.send(err);
//     }
//   });
// };
