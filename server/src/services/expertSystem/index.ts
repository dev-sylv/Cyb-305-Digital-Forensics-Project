import { ExpertSystemResult } from "../../types";
import { Rule, FileMeta } from "./types";
import { imageRules } from "./rules/imageRules";
import { textRules } from "./rules/textRules";
import { documentRules } from "./rules/documentRules";
import { computeVerdict, computeScore } from "./inferenceEngine";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"];
const TEXT_EXTENSIONS = ["txt", "log", "csv"];
const DOCUMENT_EXTENSIONS = ["pdf", "docx"];

const getRuleSet = (extension: string): Rule[] => {
  if (IMAGE_EXTENSIONS.includes(extension)) return imageRules;
  if (TEXT_EXTENSIONS.includes(extension)) return textRules;
  if (DOCUMENT_EXTENSIONS.includes(extension)) return documentRules;
  return [];
};

export const analyze = async (
  filePath: string,
  fileType: string,
): Promise<ExpertSystemResult> => {
  const meta: FileMeta = {
    extension: fileType.toLowerCase(),
    sizeBytes: (await import("fs")).statSync(filePath).size,
  };

  const rules = getRuleSet(meta.extension);

  // Evaluate all rules in parallel
  const results = await Promise.all(
    rules.map(async (rule) => {
      const result = await rule.evaluate(filePath, meta);
      return { rule, result };
    }),
  );

  // Filter to only triggered rules
  const triggered = results
    .filter(({ result }) => result.triggered)
    .map(({ rule }) => ({
      ruleId: rule.ruleId,
      description: rule.description,
      severity: rule.severity,
    }));

  const verdict = computeVerdict(triggered);
  const score = computeScore(triggered);

  return {
    verdict,
    rulesTriggered: triggered,
    score,
    analyzedAt: new Date(),
  };
};
