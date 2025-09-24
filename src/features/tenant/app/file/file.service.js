const { PassThrough } = require("stream");
const { uploadFile, getFileStream, deleteFile } = require("../../utils/fileStorage");
const FileSecurity = require("../../utils/fileSecurity");

class FileService {
  /** Upload file */
  static async upload(fileBuffer, fileName, folder) {
    return await uploadFile(fileBuffer, fileName, folder);
  }

  /** Replace old file with new one */
  static async update(fileBuffer, fileName, oldFileUrl, oldFileFolder) {
    const deleted = await deleteFile(oldFileUrl, oldFileFolder);
    if (!deleted) throw new Error("Unable to delete old file");

    return await uploadFile(fileBuffer, fileName, oldFileFolder);
  }

 static async peekBuffer(stream, maxBytes) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let total = 0;

      stream.on("data", (chunk) => {
        chunks.push(chunk);
        total += chunk.length;
        if (total >= maxBytes) {
          stream.pause();
          resolve(Buffer.concat(chunks));
        }
      });

      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  }

  /** Full streaming (no range) */
  static async prepareStream(fileId, folderName) {
    const originalStream = await getFileStream(fileId, folderName);

    const peekStream = new PassThrough();
    const finalStream = new PassThrough();

    originalStream.pipe(peekStream);
    originalStream.pipe(finalStream);

    const buffer = await this.peekBuffer(peekStream, 4100);
    const detectedType = await FileSecurity.detectFileType(buffer);

    return { finalStream, detectedType };
  }

  /** Partial streaming (range requests) */
  static async prepareRangeStream(fileId, folderName, start, end) {
    return FileService.getStream(fileId, folderName, { start, end });
  }

  /** Delete file */
  static async remove(fileUrl, folder) {
    return await deleteFile(fileUrl, folder);
  }
}

module.exports = FileService;
