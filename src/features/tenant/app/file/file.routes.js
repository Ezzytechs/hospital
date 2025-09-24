const express = require("express");
const FileController = require("./file.controller");
const upload = require("../../utils/upload"); // multer setup for `req.file`
const tenantAuth=require("../../middleware/tenantAuth")
const router = express.Router();

// Upload file
router.post("/upload", tenantAuth, upload.single("file"), FileController.uploadFile);

// Update file
router.put("/update", tenantAuth, upload.single("file"), FileController.updateFile);

// View file
router.get("/stream/:fileFolder/:fileUrl", tenantAuth, FileController.streamFile);

// Delete file
router.delete("/delete", tenantAuth, FileController.deleteFile);

module.exports = router;
