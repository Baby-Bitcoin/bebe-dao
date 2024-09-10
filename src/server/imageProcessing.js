const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

/**
 * Function to handle file upload in memory and generate thumbnails
 * @param {string} basePath - The base path to store the images
 * @param {object} thumbnailSize - Object containing the width and height of the thumbnail
 * @param {string} thumbnailPath - The path to store the thumbnails
 * @returns {multer} - multer upload configuration
 */
function createStorage(basePath, thumbnailSize, thumbnailPath) {
  // Use multer memory storage to store files in memory temporarily
  const storage = multer.memoryStorage();

  const upload = multer({ storage });

  const saveImageAndThumbnail = async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const extArray = req.file.mimetype.split("/");
    const extension = extArray[extArray.length - 1];
    const newFileName = req.file.fieldname + "-" + Date.now() + "." + extension;

    // Ensure directories exist
    fs.mkdirSync(basePath, { recursive: true });
    fs.mkdirSync(thumbnailPath, { recursive: true });

    // Save the main image to disk
    const fullPath = path.join(basePath, newFileName);
    fs.writeFileSync(fullPath, req.file.buffer);

    // Create the thumbnail and save it to disk
    const thumbnailFullPath = path.join(thumbnailPath, newFileName);

    try {
      await sharp(req.file.buffer)
        .resize(thumbnailSize.width, thumbnailSize.height)
        .toFile(thumbnailFullPath);

    } catch (error) {
      console.error("Error generating thumbnail:", error);
    }

    // Attach the filename to the request object for further processing
    req.file.filename = newFileName;
    next();
  };

  return { upload, saveImageAndThumbnail };
}

module.exports = { createStorage };
