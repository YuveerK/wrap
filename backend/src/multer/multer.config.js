import multer from "multer";
import storage from "./multer.storage.js";
import { fileFilter } from "./multer.file-filter.js";
import limits from "./multer.limits.js";

const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;
