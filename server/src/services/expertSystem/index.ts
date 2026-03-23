import { ExpertSystemResult } from "shared/types";

// STUB — will be replaced by full implementation in TASK-3
export const analyze = async (
  _filePath: string,
  _fileType: string,
): Promise<ExpertSystemResult> => {
  return {
    verdict: "CLEAN",
    rulesTriggered: [],
    score: 0,
    analyzedAt: new Date(),
  };
};
