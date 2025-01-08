const multer = require("multer");
const { cloudinary } = require("../cloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
console.log("Ethiii in clodunary multer");


// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products", // The folder name in Cloudinary
    allowed_formats: ["jpeg", "png", "jpg"], // Allowed file types
  },
});

// Set up multer with Cloudinary storage
const upload = multer({ storage });

module.exports = { upload };
