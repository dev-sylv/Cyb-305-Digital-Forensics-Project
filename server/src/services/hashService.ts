import crypto from "crypto";
import fs from "fs";

export const computeHash = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
};

export const verifyHash = async (
  filePath: string,
  storedHash: string,
): Promise<boolean> => {
  const computed = await computeHash(filePath);
  return computed === storedHash;
};
