import fs from "fs";

// Read first N bytes of a file and return as uppercase hex string
export const readFileHeader = async (
  filePath: string,
  bytes: number,
): Promise<string> => {
  const handle = await fs.promises.open(filePath, "r");
  const buffer = Buffer.alloc(bytes);
  await handle.read(buffer, 0, bytes, 0);
  await handle.close();
  return buffer.toString("hex").toUpperCase();
};

// Detect MIME type from hex header
export const detectMimeFromHeader = (headerHex: string): string => {
  if (headerHex.startsWith("FFD8FF")) return "image/jpeg";
  if (headerHex.startsWith("89504E47")) return "image/png";
  if (headerHex.startsWith("47494638")) return "image/gif";
  if (headerHex.startsWith("25504446")) return "application/pdf";
  if (headerHex.startsWith("504B0304")) return "application/zip";
  return "unknown";
};

// Compute Shannon entropy of a string
export const computeEntropy = (text: string): number => {
  const freq: Record<string, number> = {};
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }
  const len = text.length;
  return Object.values(freq).reduce((entropy, count) => {
    const p = count / len;
    return entropy - p * Math.log2(p);
  }, 0);
};

// Count newline characters in a file
export const getFileLineCount = async (filePath: string): Promise<number> => {
  const content = await fs.promises.readFile(filePath, "utf-8");
  return content.split("\n").length;
};

// Extension to expected MIME mapping
export const EXTENSION_MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  pdf: "application/pdf",
  docx: "application/zip", // DOCX is a zip internally
};
