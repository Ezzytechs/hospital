const mega = require("megajs");
const FileSecurity = require("./fileSecurity");

require("dotenv").config();

const { MEGA_EMAIL, MEGA_PASSWORD } = process.env;

async function initializeStorage() {
  return new Promise((resolve, reject) => {
    const storage = mega({
      email: MEGA_EMAIL,
      password: MEGA_PASSWORD,
    });

    storage.on("ready", async () => {
    //   const {
    //     spaceUsed,
    //     spaceTotal,
    //     downloadBandwidthTotal,
    //     downloadBandwidthUsed,
    //     sharedBandwidthUsed,
    //     sharedBandwidthLimit,
    //   } = await storage.getAccountInfo();

    //   //email admin if any of the quota is getting exceeded
    //   if (downloadBandwidthTotal - downloadBandwidthUsed < 104857600) {
    //     sendEmail(
    //       siteEmail,
    //       "Mega Storage Warning",
    //       "Free tier on your mega account is set to expire as download bandwith remaining only 100MB"
    //     );
    //   }

    //   if (spaceTotal - spaceUsed < 104857600) {
    //     sendEmail(
    //       siteEmail,
    //       "Mega Storage Warning",
    //       "Free tier on your mega account is set to expire as total remaining free space is only 100MB"
    //     );
    //   }

    //   if (sharedBandwidthLimit - sharedBandwidthUsed < 0.1) {
    //     sendEmail(
    //       siteEmail,
    //       "Mega Storage Warning",
    //       "Free tier on your mega account is set to expire as shared Bandwidth Used remaining only 100MB"
    //     );
    //   }
      console.log("✅ Connected to MEGA storage.");
      resolve(storage);
    });

    storage.on("error", (error) => {
      console.error("❌ MEGA connection error:", error);
      reject(error);
    });
  });
}

async function uploadFile(fileBuffer, fileName, folderName) {
  try {
    const buffer = Buffer.isBuffer(fileBuffer)
      ? fileBuffer
      : Buffer.from(fileBuffer);

    const fileSize = buffer.length;
    if (!fileSize) {
      throw new Error("File buffer is empty or invalid.");
    }

    // ✅ Validate file type before connecting to storage
    const fileType = await FileSecurity.detectFileType(buffer);
    console.log("File type detected:", fileType);

    // ✅ Optionally also check file size limit
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (fileSize > MAX_SIZE) {
      throw new Error(`File too large. Max allowed size is ${MAX_SIZE / (1024*1024)} MB`);
    }

    // 🔹 Only connect if validation passed
    const storage = await initializeStorage();
    if (!storage) throw new Error("Unable to connect to storage!");

    let coverFolder = null;
    const root = storage.mounts[0];

    // Find or create the folder
    coverFolder = await root.children.find((child) => child.name === folderName);
    if (!coverFolder) {
      coverFolder = await root.mkdir(folderName);
    }

    // Upload file
    const file = await coverFolder.upload(fileName, buffer).complete;

    return {
      name: file.name,
      size: file.size,
      type: fileType.mime,
      timestamp: file.timestamp,
      directory: file.directory,
      nodeId: file.nodeId,
      downloadId: file.downloadId,
    };
  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw new Error("File upload failed: " + error.message);
  }
}

//Retrieve from Mega
  async function getFileStream(fileId, folderName, range = null) {
    const storage = await initializeStorage();
    if (!storage) throw new Error("Unable to connect to storage!");

    const root = storage.mounts[0];
    const folder = root.children.find((child) => child.name === folderName);
    if (!folder) throw new Error("Folder not found");

    const file = folder.children.find((child) => child.nodeId === fileId);
    if (!file) throw new Error("File not found");

    // MEGA SDK’s download() doesn’t natively support ranges,
    // but if your storage does, pass `range` here.
    if (range) {
      const { start, end } = range;
      return file.download({ start, end }); // ⚡ implement if your SDK supports it
    }

    return file.download();
  }

  /** Get file metadata */
async function getFileMeta(fileId, folderName) {
    const storage = await initializeStorage();
    if (!storage) throw new Error("Unable to connect to storage!");

    const root = storage.mounts[0];
    const folder = root.children.find((child) => child.name === folderName);
    if (!folder) throw new Error("Folder not found");

    const file = folder.children.find((child) => child.nodeId === fileId);
    if (!file) throw new Error("File not found");

    return {
      size: file.size,
      name: file.name,
      mime: file.mime || "application/octet-stream", // fallback
    };
  }

//Delete from Mega
async function deleteFile(filename, folderName) {
  try {
    const storage = await initializeStorage();
    // Get the root storage mount
    const root = storage.mounts[0];

    // Find the "cover" folder
    const fileFolder = root.children.find((child) => child.name === folderName);

    if (!fileFolder) {
      throw new Error("file folder not found");
    }

    // Find the file inside the "cover" folder
    const file = fileFolder.children.find((child) => child.nodeId === filename);

    if (!file) {
      throw new Error("File not found in cover folder");
    }
 await file.delete(true);
    return "File deleted successfully"; // Return success message
  } catch (error) {
    throw new Error(
      error.message || "An error occurred while deleting the file"
    );
  }
}

module.exports = { uploadFile, deleteFile, getFileStream, getFileMeta };

