"use client";

import CodeEditor from "@/components/CodeEditor";
import FileUploader from "@/components/FileUploader";
import Tabs from "@/components/Tabs";
import ThemeToggle from "@/components/ThemeToggle";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useMemo, useState } from "react";
import DiffViewer from "react-diff-viewer-continued";

type Tab = "input" | "output";
type ProviderId = "openai" | "custom-finetuned" | "deterministic";

type CleanupDiagnostics = {
  removedImports: number;
  sortedJsxProps: number;
  normalizedTailwindClasses: number;
};

type UsageSnapshot = Record<ProviderId, number>;

type Artifacts = {
  original: string;
  deterministic: string;
  aiOutput: string;
};

const PROVIDERS: { id: ProviderId; label: string; description: string }[] = [
  {
    id: "openai",
    label: "OpenAI · GPT-4o mini",
    description: "Balanced reasoning + quality",
  },
  {
    id: "custom-finetuned",
    label: "Custom Fine-tuned Model",
    description: "Your own Llama2/Mistral model",
  },
  {
    id: "deterministic",
    label: "Deterministic only",
    description: "Skip LLM; return structured cleanup only",
  },
];

const DEFAULT_USAGE: UsageSnapshot = {
  openai: 0,
  "custom-finetuned": 0,
  deterministic: 0,
};

export default function Home() {
  const { fileName, fileContent, handleFileUpload, updateFileContent } =
    useFileUpload();
  const { theme, toggleTheme, isReady: themeReady } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>("input");
  const [provider, setProvider] = useState<ProviderId>("openai");
  const [isCleaning, setIsCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadExtension, setDownloadExtension] = useState<"tsx" | "jsx">(
    "tsx",
  );
  const [artifacts, setArtifacts] = useState<Artifacts | null>(null);
  const [summary, setSummary] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<CleanupDiagnostics | null>(
    null,
  );
  const [usage, setUsage] = useState<UsageSnapshot>(DEFAULT_USAGE);

  // Check if custom model is available on mount
  useEffect(() => {
    const checkCustomModel = async () => {
      try {
        await fetch("http://localhost:8000/health", {
          method: "GET",
        });
      } catch {
        // Model health check - silently fail
      }
    };
    checkCustomModel();
  }, []);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("ai-refactor-provider")
        : null;
    if (
      stored === "openai" ||
      stored === "custom-finetuned" ||
      stored === "deterministic"
    ) {
      setProvider(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("ai-refactor-provider", provider);
  }, [provider]);

  useEffect(() => {
    if (!fileName) return;
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension === "tsx" || extension === "jsx") {
      setDownloadExtension(extension);
    }
  }, [fileName]);

  const hasOutput = useMemo(
    () => Boolean(artifacts?.aiOutput?.trim()),
    [artifacts],
  );

  const handleCleanCode = async () => {
    if (!fileContent.trim()) {
      setError("Paste code or upload a file before cleaning.");
      setActiveTab("input");
      return;
    }

    try {
      setIsCleaning(true);
      setError(null);

      const response = await fetch("/api/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fileContent, fileName, provider }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to clean code.");
      }

      setArtifacts(payload.artifacts as Artifacts);
      setSummary(payload.summary as string[]);
      setDiagnostics(payload.diagnostics as CleanupDiagnostics);
      setUsage(payload.usage as UsageSnapshot);
      setActiveTab("output");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred.";
      setError(message);
      setActiveTab("input");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleCopy = async () => {
    if (!hasOutput || !artifacts) return;
    try {
      await navigator.clipboard.writeText(artifacts.aiOutput);
    } catch {
      setError("Unable to copy to clipboard. Please copy manually.");
    }
  };

  const handleDownload = () => {
    if (!hasOutput || !artifacts) return;
    const extension = fileName?.split(".").pop() ?? downloadExtension;
    const downloadName = fileName
      ? fileName.replace(/\.[^/.]+$/, `.${extension}`)
      : `refactored.${extension}`;
    const blob = new Blob([artifacts.aiOutput], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const timeline = [
    { label: "Upload / Paste", status: fileContent ? "done" : "pending" },
    {
      label: "Deterministic cleanup",
      status: diagnostics ? "done" : "pending",
    },
    {
      label: `AI · ${PROVIDERS.find((p) => p.id === provider)?.label ?? provider}`,
      status: artifacts ? "done" : "pending",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 transition-colors duration-300">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="glass-panel flex flex-col gap-4 rounded-2xl p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
              Workflow
            </p>
            <h1 className="text-3xl font-semibold text-slate-500 dark:text-slate-100">
              AI Code Refactorer
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-200">
              Upload a component, run deterministic cleanup, then let your
              fine-tuned LLM polish it. Copy, diff, and download the final
              component instantly.
            </p>
          </div>
          <ThemeToggle
            theme={theme}
            toggleTheme={toggleTheme}
            disabled={!themeReady}
          />
        </header>

        <section className="card-surface p-6">
          <Tabs
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as Tab)}
            tabs={[
              { id: "input", label: "Input" },
              { id: "output", label: "Output" },
            ]}
          />

          {error && (
            <div className="mb-5 rounded-lg border border-red-200/80 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100">
              {error}
            </div>
          )}

          {activeTab === "input" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                  Upload a .jsx or .tsx file
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We only process the file in-memory—nothing is stored.
                </p>
                <div className="mt-3">
                  <FileUploader onFileUpload={handleFileUpload} />
                </div>
                {fileName && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Loaded: <span className="font-semibold">{fileName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                  Or paste code
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We auto-detect the language and format it for you prior to AI
                  cleanup.
                </p>
                <div className="mt-3">
                  <CodeEditor
                    code={fileContent}
                    onCodeChange={updateFileContent}
                    fileName={fileName}
                    theme={theme}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Model provider
                </p>
                <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
                  <select
                    value={provider}
                    onChange={(event) =>
                      setProvider(event.target.value as ProviderId)
                    }
                    title="Select AI provider"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {PROVIDERS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {PROVIDERS.map((option) => (
                      <div key={option.id}>
                        {option.label}: {usage[option.id] ?? 0} run(s)
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCleanCode}
                  disabled={isCleaning}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {isCleaning ? "Cleaning…" : "Clean Code"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("output")}
                  disabled={!hasOutput}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                >
                  Preview Last Output
                </button>
              </div>
            </div>
          )}

          {activeTab === "output" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Pipeline status
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                  {timeline.map((step) => (
                    <div key={step.label} className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          step.status === "done"
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {step.label}
                    </div>
                  ))}
                </div>
              </div>

              {diagnostics && (
                <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Deterministic cleanup
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      Removed unused imports: {diagnostics.removedImports}
                    </li>
                    <li>Sorted JSX props: {diagnostics.sortedJsxProps}</li>
                    <li>
                      Normalized Tailwind classes:{" "}
                      {diagnostics.normalizedTailwindClasses}
                    </li>
                  </ul>
                </div>
              )}

              {summary.length > 0 && (
                <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Model summary (
                    {PROVIDERS.find((p) => p.id === provider)?.label})
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {summary.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

              {artifacts ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                    >
                      Copy output
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                    >
                      Download
                    </button>
                  </div>

                  <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Original → AI output
                    </h3>
                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                      <DiffViewer
                        oldValue={artifacts.original}
                        newValue={artifacts.aiOutput}
                        splitView
                        hideLineNumbers={false}
                        showDiffOnly={false}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Deterministic → AI output
                    </h3>
                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                      <DiffViewer
                        oldValue={artifacts.deterministic}
                        newValue={artifacts.aiOutput}
                        splitView
                        hideLineNumbers={false}
                        showDiffOnly={false}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Final code
                    </p>
                    <div className="mt-3">
                      <CodeEditor
                        code={artifacts.aiOutput}
                        readOnly
                        theme={theme}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                  Run &quot;Clean Code&quot; first to see refactored output.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
