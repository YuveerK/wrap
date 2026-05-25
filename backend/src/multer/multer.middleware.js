import upload from "./multer.config.js";

export const uploadSingle = (fieldName) => upload.single(fieldName);

export const uploadArray = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

export const uploadFields = (fields) => upload.fields(fields);

export const uploadNone = () => upload.none();

export const uploadPostMedia = uploadFields([
  { name: "banner", maxCount: 1 },
  { name: "attachments", maxCount: 5 },
]);
