import express from "express";
import multer from "multer";
import { authenticateToken, requireEditor } from "../middleware/auth.js";
import config from "../config/env.js";
import { toPinataGatewayUrl } from "../utils/ipfsGateway.js";

const router = express.Router();

const PINATA_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

// Files are held in memory only long enough to forward them upstream; nothing
// is written to disk, so there is no uploaded-file path to serve or traverse.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSize, files: 1 },
});

// Magic byte signatures. The declared Content-Type is attacker-controlled, so
// the actual bytes decide what the file is. SVG is deliberately absent: it is
// an image that can carry script, and it has no signature to check.
const IMAGE_SIGNATURES = [
  { ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { ext: "gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { ext: "bmp", bytes: [0x42, 0x4d] },
  { ext: "webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF....WEBP
];

const detectImageType = (buffer) => {
  if (!buffer || buffer.length < 12) return null;
  for (const sig of IMAGE_SIGNATURES) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) {
      if (sig.ext === "webp" && buffer.subarray(8, 12).toString("ascii") !== "WEBP") {
        continue;
      }
      return sig.ext;
    }
  }
  return null;
};

/**
 * POST /api/upload/ipfs
 *
 * Server-side replacement for the browser calling Pinata directly. The API
 * credentials stay on the server: anything shipped to the browser with a
 * VITE_ prefix is readable by every visitor in the built bundle.
 */
router.post(
  "/ipfs",
  authenticateToken,
  requireEditor,
  upload.single("file"),
  async (req, res) => {
    if (!config.pinata.jwt && !(config.pinata.apiKey && config.pinata.secretKey)) {
      return res.status(503).json({
        success: false,
        message:
          "IPFS uploads are not configured. Set PINATA_JWT (or PINATA_API_KEY and PINATA_SECRET_KEY) on the server.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const detected = detectImageType(req.file.buffer);
    if (!detected) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Allowed: PNG, JPEG, GIF, BMP, WEBP.",
      });
    }

    try {
      const form = new FormData();
      form.append(
        "file",
        new Blob([req.file.buffer], { type: `image/${detected}` }),
        req.file.originalname || `upload.${detected}`
      );

      const headers = config.pinata.jwt
        ? { Authorization: `Bearer ${config.pinata.jwt}` }
        : {
            pinata_api_key: config.pinata.apiKey,
            pinata_secret_api_key: config.pinata.secretKey,
          };

      const response = await fetch(PINATA_ENDPOINT, {
        method: "POST",
        headers,
        body: form,
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        // Log upstream detail, return a generic message: the Pinata response
        // can contain account identifiers.
        console.error(
          "Pinata upload failed:",
          response.status,
          await response.text().catch(() => "")
        );
        return res
          .status(502)
          .json({ success: false, message: "Upload to IPFS failed" });
      }

      const result = await response.json();
      return res.status(201).json({
        success: true,
        hash: result.IpfsHash,
        url: toPinataGatewayUrl(result.IpfsHash),
      });
    } catch (error) {
      console.error("IPFS upload error:", error);
      return res
        .status(502)
        .json({ success: false, message: "Upload to IPFS failed" });
    }
  }
);

export default router;
