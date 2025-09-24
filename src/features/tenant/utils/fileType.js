async function detectFileType(buffer) {
  const { fileTypeFromBuffer } = await import("file-type");
  return await fileTypeFromBuffer(buffer);
}

module.exports = { detectFileType };
