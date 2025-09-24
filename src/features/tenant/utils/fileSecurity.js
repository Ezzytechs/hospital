const {detectFileType} =require("./fileType")

class FileSecurity {
  /** 🔹 Detect and validate file type */
  async detectFileType(fileBuffer) {
    const type = await detectFileType(fileBuffer);
    if (!type) throw new Error("Unable to detect file type");

    const allowedTypes = [
      // Images
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      // Documents
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      // Audio
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp3",
      // Video
      "video/mp4",
      "video/mkv",
      "video/avi",
      "video/mov",
      "video/webm",
    ];

    if (!allowedTypes.includes(type.mime)) {
      throw new Error(
        `Invalid file type: ${type.mime}. Allowed types: ${allowedTypes.join(", ")}`
      );
    }

    return type; // { ext, mime }
  }
}

module.exports = new FileSecurity();
