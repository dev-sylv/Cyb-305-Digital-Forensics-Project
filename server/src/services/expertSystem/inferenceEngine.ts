import { Verdict } from "shared/types";

/**
 * Represents a rule that was triggered during analysis.
 * We only need the severity here to compute the verdict and score.
 */
interface TriggeredRule {
  severity: string;
}

/**
 * computeVerdict — the decision-making brain of the expert system.
 *
 * This is the inference engine. It takes all the rules that fired
 * and applies verdict logic to produce a final risk assessment.
 *
 * Verdict logic (in order of priority):
 * 1. If ANY single rule has severity HIGH → HIGH_RISK
 *    (one serious finding is enough to escalate, regardless of count)
 * 2. If 3 or more rules triggered → HIGH_RISK
 *    (many findings together = high risk even if individually low/medium)
 * 3. If 1 or 2 rules triggered → SUSPICIOUS
 *    (something is off but not conclusive)
 * 4. If no rules triggered → CLEAN
 */
export const computeVerdict = (rules: TriggeredRule[]): Verdict => {
  if (rules.some((r) => r.severity === "HIGH")) return "HIGH_RISK";
  if (rules.length >= 3) return "HIGH_RISK";
  if (rules.length >= 1) return "SUSPICIOUS";
  return "CLEAN";
};

/**
 * computeScore — produces a numeric risk score from triggered rules.
 *
 * Each rule contributes a weighted score based on its severity:
 *   LOW    = 1 point
 *   MEDIUM = 2 points
 *   HIGH   = 3 points
 *
 * The total score gives a sense of how risky the file is beyond
 * just the verdict label. For example, a file with 3 LOW rules
 * scores 3, while a file with 1 HIGH rule scores 3 but is HIGH_RISK.
 * This score is stored on the evidence record for reference.
 */
export const computeScore = (rules: TriggeredRule[]): number => {
  const severityScore: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  return rules.reduce(
    (total, rule) => total + (severityScore[rule.severity] || 0),
    0,
  );
};
