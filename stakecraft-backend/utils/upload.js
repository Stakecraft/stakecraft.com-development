import path from "path";
import fs from "fs";

const UPLOADS_DIRNAME = "uploads";

const uploadsRoot = () => path.resolve(process.cwd(), UPLOADS_DIRNAME);

/**
 * Resolve a stored upload basename inside the uploads directory.
 * Rejects absolute paths, parent segments, and NUL bytes.
 */
const resolveUploadPath = (filename) => {
  if (typeof filename !== "string" || filename.length === 0) return null;
  if (filename.includes("\0")) return null;
  const base = path.basename(filename);
  if (base !== filename || base === "." || base === "..") return null;
  const root = uploadsRoot();
  const filePath = path.resolve(root, base);
  const prefix = root.endsWith(path.sep) ? root : root + path.sep;
  if (filePath !== root && !filePath.startsWith(prefix)) return null;
  return filePath;
};

// Ensure uploads directory exists
export const ensureUploadsDir = () => {
  const dir = uploadsRoot();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Clean up old files
export const cleanupOldFiles = async (maxAge = 7 * 24 * 60 * 60 * 1000) => {
  const uploadsDir = ensureUploadsDir();
  const files = fs.readdirSync(uploadsDir);
  const now = Date.now();

  for (const file of files) {
    const filePath = resolveUploadPath(file);
    if (!filePath) continue;
    const stats = fs.statSync(filePath);

    if (now - stats.mtime.getTime() > maxAge) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up old file: ${file}`);
    }
  }
};

// Get file info
export const getFileInfo = (filename) => {
  const filePath = resolveUploadPath(filename);

  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  const stats = fs.statSync(filePath);
  return {
    filename: path.basename(filePath),
    path: filePath,
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
  };
};

// Delete file
export const deleteFile = (filename) => {
  const filePath = resolveUploadPath(filename);

  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }

  return false;
};
