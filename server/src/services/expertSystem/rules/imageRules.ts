import fs from "fs";
import { Rule } from "../types";
import {
  readFileHeader,
  detectMimeFromHeader,
  EXTENSION_MIME_MAP,
} from "../utils";

export const imageRules: Rule[] = [
  {
    ruleId: "FILE_HEADER_MISMATCH",
    description: "File header bytes do not match the declared file extension",
    severity: "HIGH",
    evaluate: async (filePath, meta) => {
      const header = await readFileHeader(filePath, 8);
      const detectedMime = detectMimeFromHeader(header);
      const expectedMime = EXTENSION_MIME_MAP[meta.extension] || "unknown";
      const triggered =
        detectedMime !== expectedMime && detectedMime !== "unknown";
      return { triggered, metadata: { detectedMime, expectedMime } };
    },
  },
  {
    ruleId: "EXIF_TIMESTAMP_ANOMALY",
    description: "EXIF timestamp is more than 30 days in the past or future",
    severity: "MEDIUM",
    evaluate: async (filePath, meta) => {
      if (!["jpg", "jpeg"].includes(meta.extension)) {
        return { triggered: false };
      }
      try {
        const buffer = await fs.promises.readFile(filePath);
        // Search for DateTimeOriginal EXIF tag (0x9003)
        const tag = Buffer.from([0x90, 0x03]);
        const idx = buffer.indexOf(tag);
        if (idx === -1) return { triggered: false };

        // Read ASCII timestamp after tag (skip 8 bytes of EXIF header)
        const timestampStr = buffer.slice(idx + 8, idx + 28).toString("ascii");
        const match = timestampStr.match(/(\d{4}):(\d{2}):(\d{2})/);
        if (!match) return { triggered: false };

        const exifDate = new Date(`${match[1]}-${match[2]}-${match[3]}`);
        const diffDays =
          Math.abs(Date.now() - exifDate.getTime()) / (1000 * 60 * 60 * 24);
        const triggered = diffDays > 30;
        return {
          triggered,
          metadata: { exifDate: exifDate.toISOString(), diffDays },
        };
      } catch {
        return { triggered: false };
      }
    },
  },
  {
    ruleId: "FILE_SIZE_ANOMALY",
    description: "File size is suspiciously small or large for an image",
    severity: "LOW",
    evaluate: async (_filePath, meta) => {
      const tooSmall = meta.sizeBytes < 1024;
      const tooLarge = meta.sizeBytes > 15 * 1024 * 1024;
      const triggered = tooSmall || tooLarge;
      return {
        triggered,
        metadata: { sizeBytes: meta.sizeBytes, tooSmall, tooLarge },
      };
    },
  },
  {
    ruleId: "EXTENSION_MIMETYPE_MISMATCH",
    description: "Detected MIME type does not match file extension",
    severity: "MEDIUM",
    evaluate: async (filePath, meta) => {
      const header = await readFileHeader(filePath, 8);
      const detectedMime = detectMimeFromHeader(header);
      const expectedMime = EXTENSION_MIME_MAP[meta.extension] || "unknown";
      const triggered =
        detectedMime !== "unknown" && detectedMime !== expectedMime;
      return { triggered, metadata: { detectedMime, expectedMime } };
    },
  },
];
