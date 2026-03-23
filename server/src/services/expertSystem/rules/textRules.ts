import fs from "fs";
import { Rule } from "../types";
import { computeEntropy, getFileLineCount } from "../utils";

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

export const textRules: Rule[] = [
  {
    ruleId: "SUSPICIOUS_KEYWORD_DETECTED",
    description:
      "File contains suspicious keywords associated with malicious activity",
    severity: "HIGH",
    evaluate: async (filePath) => {
      const content = await fs.promises.readFile(filePath, "utf-8");
      const lower = content.toLowerCase();
      const matched = SUSPICIOUS_KEYWORDS.filter((kw) => lower.includes(kw));
      return {
        triggered: matched.length > 0,
        metadata: { matchedKeywords: matched },
      };
    },
  },
  {
    ruleId: "TIMESTAMP_INCONSISTENCY",
    description: "Log timestamps are out of chronological order",
    severity: "MEDIUM",
    evaluate: async (filePath) => {
      const content = await fs.promises.readFile(filePath, "utf-8");
      const lines = content.split("\n");
      const timestampRegex = /(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})/;
      let prevTime: number | null = null;
      let triggered = false;

      for (const line of lines) {
        const match = line.match(timestampRegex);
        if (match) {
          const time = new Date(match[1]).getTime();
          if (prevTime !== null && time < prevTime) {
            triggered = true;
            break;
          }
          prevTime = time;
        }
      }
      return { triggered };
    },
  },
  {
    ruleId: "ENTROPY_ANOMALY",
    description:
      "File entropy is abnormally low or high, suggesting encryption or repetition",
    severity: "LOW",
    evaluate: async (filePath) => {
      const content = await fs.promises.readFile(filePath, "utf-8");
      const entropy = computeEntropy(content);
      const triggered = entropy < 2.0 || entropy > 6.5;
      return { triggered, metadata: { entropy } };
    },
  },
  {
    ruleId: "LINE_COUNT_ANOMALY",
    description: "File is large but contains suspiciously few lines",
    severity: "LOW",
    evaluate: async (filePath, meta) => {
      const lineCount = await getFileLineCount(filePath);
      const triggered = meta.sizeBytes > 100 * 1024 && lineCount < 10;
      return { triggered, metadata: { lineCount, sizeBytes: meta.sizeBytes } };
    },
  },
];
