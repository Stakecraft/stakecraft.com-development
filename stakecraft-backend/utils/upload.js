import path from "path";
import fs from "fs";

// Ensure uploads directory exists
export const ensureUploadsDir = () => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

// Clean up old files
export const cleanupOldFiles = async (maxAge = 7 * 24 * 60 * 60 * 1000) => {
  const uploadsDir = path.join(process.cwd(), "uploads");

  if (!fs.existsSync(uploadsDir)) return;

  const files = fs.readdirSync(uploadsDir);
  const now = Date.now();

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);

    if (now - stats.mtime.getTime() > maxAge) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up old file: ${file}`);
    }
  }
};

// Get file info
export const getFileInfo = (filename) => {
  const filePath = path.join(process.cwd(), "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const stats = fs.statSync(filePath);
  return {
    filename,
    path: filePath,
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
  };
};

// Delete file
export const deleteFile = (filename) => {
  const filePath = path.join(process.cwd(), "uploads", filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }

  return false;
};
