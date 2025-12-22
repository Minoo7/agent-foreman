import { describe, it, expect, vi, beforeEach } from "vitest";
import { runAnalyze } from "../../src/commands/analyze.js";
import * as fs from "node:fs/promises";
import * as aiScanner from "../../src/ai-scanner.js";
import * as projectScanner from "../../src/project-scanner.js";
import * as agents from "../../src/agents.js";

vi.mock("node:fs/promises");
vi.mock("../../src/ai-scanner.js");
vi.mock("../../src/project-scanner.js");
vi.mock("../../src/agents.js");

describe("runAnalyze", () => {
  const mockAiResult = {
    success: true,
    agentUsed: "gemini",
    summary: "Project summary",
    recommendations: ["Rec 1", "Rec 2"],
    techStack: { language: "typescript", framework: "vitest" },
    modules: [],
    features: [],
    completion: { overall: 0 }
  };

  const mockStructure = {
    dirs: [],
    files: [],
    configs: []
  };

  const mockSurvey = {
    techStack: { language: "typescript", framework: "vitest" },
    modules: [],
    features: [],
    completion: { overall: 0 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(aiScanner.aiScanProject).mockResolvedValue(mockAiResult as any);
    vi.mocked(projectScanner.scanDirectoryStructure).mockResolvedValue(mockStructure as any);
    vi.mocked(aiScanner.aiResultToSurvey).mockReturnValue(mockSurvey as any);
    vi.mocked(aiScanner.generateAISurveyMarkdown).mockReturnValue("# Survey Markdown");
    vi.mocked(agents.getAgentPriorityString).mockReturnValue("10");
  });

  it("should generate project survey and write to output path", async () => {
    const outputPath = "docs/PROJECT_SURVEY.md";
    await runAnalyze(outputPath, false);

    expect(aiScanner.aiScanProject).toHaveBeenCalled();
    expect(projectScanner.scanDirectoryStructure).toHaveBeenCalled();
    expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining("docs"), { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining(outputPath), "# Survey Markdown");
  });

  it("should exit if AI analysis fails", async () => {
    vi.mocked(aiScanner.aiScanProject).mockResolvedValue({ success: false, error: "Failed" } as any);
    const mockExit = vi.spyOn(process, "exit").mockImplementation((() => { throw new Error("process.exit called") }) as any);

    await expect(runAnalyze("docs/survey.md", false)).rejects.toThrow("process.exit called");

    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
