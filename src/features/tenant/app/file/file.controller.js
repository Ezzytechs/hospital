
const FileService = require("./file.service");
const { getFileMeta } = require("../../utils/fileStorage");


class FileController {
  /** Upload File */
  static async uploadFile(req, res) {
    console.log("Uploading...")
    try {
      const file = req.file;
      const { fileFolder } = req.body;

      if (!file || !fileFolder) {
        return res.status(400).json({ error: "File and/or file folder required" });
      }

      const uploadedFile= await FileService.upload(file.buffer, file.originalname, fileFolder);
      if (!uploadedFile) return res.status(400).json({ error: "Unable to upload file" });

      res.status(200).json(uploadedFile);
    } catch (err) {
      console.log(err)
      res.status(400).json({ error: err.message });
    }
  }

  /** Update File */
  static async updateFile(req, res) {
    try {
      const file = req.file;
      const { oldFileUrl, oldFileFolder } = req.body;

      if (!oldFileUrl || !oldFileFolder || !file) {
        return res.status(400).json({ error: "New file, old file url and/or folder name required!" });
      }

      const updatedFile = await FileService.update(file.buffer, file.originalname, oldFileUrl, oldFileFolder);
      res.status(200).json(updatedFile);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

 static async streamFile(req, res) {
    try {
      const { fileUrl, fileFolder } = req.params;
      if (!fileUrl || !fileFolder) {
        return res.status(400).json({ error: "Filename and/or file folder required!" });
      }

      // Get file metadata
      const fileMeta = await getFileMeta(fileUrl, fileFolder);
      const fileSize = fileMeta.size;

      const range = req.headers.range;
      if (range) {
        // Parse Range header
        const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
          res.status(416).setHeader("Content-Range", `bytes */${fileSize}`);
          return res.end();
        }

        const chunkSize = end - start + 1;
        const stream = await FileService.prepareRangeStream(fileUrl, fileFolder, start, end);

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": fileMeta.mime || "application/octet-stream",
        });

        stream.pipe(res);
      } else {
        // Full stream
        const { finalStream, detectedType } = await FileService.prepareStream(fileUrl, fileFolder);

        res.setHeader("Content-Type", detectedType.mime || "application/octet-stream");
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.setHeader("Content-Disposition", `inline; filename="${fileMeta.name}"`);
        res.setHeader("Content-Length", fileSize);

        finalStream.pipe(res);
      }
    } catch (err) {
      console.error("Stream error:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  }

  /** Delete File */
  static async deleteFile(req, res) {
    try {
      const { fileUrl, fileFolder } = req.body;

      if (!fileUrl || !fileFolder) {
        return res.status(400).json({ error: "File url and/or folder name required!" });
      }

      const deleted = await FileService.remove(fileUrl, fileFolder);

      if (!deleted) return res.status(400).json({ message: "Unable to delete file" });

      res.status(200).json({ success: true, message: "File deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = FileController;
