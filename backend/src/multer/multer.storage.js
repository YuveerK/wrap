import multer from "multer";
import { config } from "../config/index.js";
import { generateSafeFileName } from "./utils/generate-safe-file-name.js";
import { ensureUploadDirectory } from "./utils/ensure-upload-directory.js";

ensureUploadDirectory(config.upload.tempDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.tempDir);
  },
  filename: (_req, file, cb) => {
    cb(null, generateSafeFileName(file.originalname));
  },
});

export default storage;
