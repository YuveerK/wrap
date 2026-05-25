import { config } from "../config/index.js";

const limits = {
  fileSize: config.upload.maxFileSizeBytes,
  files: config.upload.maxFiles,
  fields: 20,
  fieldSize: 1 * 1024 * 1024,
};

export default limits;
