import fs from "fs";
import { Rule } from "../types";
import {
  readFileHeader,
  detectMimeFromHeader,
  EXTENSION_MIME_MAP,
} from "../utils";

const SUSPICIOUS_KEYWORDS = [
  "delete",
  "drop table",
  "rm -rf",
  "unauthorized",
  "bypass",
  "override",
  "root",
  "sudo",
  "failed login",
  "access denied",
  "chmod",
  "exec",
  "eval",
];

export const documentRules: Rule[] = [
  {
    ruleId: "FILE_HEADER_MISMATCH",
    description:
      "File header does not match expected format for this document type",
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
    ruleId: "EXTENSION_MIMETYPE_MISMATCH",
    description:
      "Detected MIME type does not match declared document extension",
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
  {
    ruleId: "SUSPICIOUS_KEYWORD_DETECTED",
    description: "Document contains suspicious keywords in readable sections",
    severity: "HIGH",
    evaluate: async (filePath) => {
      const buffer = await fs.promises.readFile(filePath);
      // Read first 50KB as UTF-8
      const content = buffer.slice(0, 50 * 1024).toString("utf-8");
      const lower = content.toLowerCase();
      const matched = SUSPICIOUS_KEYWORDS.filter((kw) => lower.includes(kw));
      return {
        triggered: matched.length > 0,
        metadata: { matchedKeywords: matched },
      };
    },
  },
];
