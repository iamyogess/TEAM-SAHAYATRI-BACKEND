import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(import.meta.url); //file
const __filename = dirname(__filename);


// storage folder location setup
const storage = multer.diskStorage({
  destination: (req, res, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, res, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// let MAX_FILE_SIZE = 1 * 1000000;
export const uploadPicture = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1000000,
  },
  fileFilter: (req, res, file, cb) => {
    let fileExtension = path.extname(file.originalname).toLowerCase();
    if (
      fileExtension !== ".png" &&
      fileExtension !== ".jpg" &&
      fileExtension !== ".jpeg"
    ) {
      return cb(new Error("Only images are allowed!"));
    }
    cb(null, true);
  },
});
