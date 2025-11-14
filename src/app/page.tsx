"use client";

import CodeEditor from "@/components/CodeEditor";
import FileUploader from "@/components/FileUploader";
import Tabs from "@/components/Tabs";
import ThemeToggle from "@/components/ThemeToggle";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useMemo, useState } from "react";

type Tab = "input" | "output";

export default function Home() {
  const { fileName, fileContent, handleFileUpload, updateFileContent } =
    useFileUpload();
  const { theme, toggleTheme, isReady: themeReady } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>("input");
  const [output, setOutput] = useState("");
  const [isCleaning, setIsCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadExtension, setDownloadExtension] = useState<"tsx" | "jsx">(
    "tsx",
  );

  useEffect(() => {
    if (!fileName) {
      return;
    }
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension === "tsx" || extension === "jsx") {
      setDownloadExtension(extension);
    }
  }, [fileName]);

  const hasOutput = useMemo(() => output.trim().length > 0, [output]);

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
        body: JSON.stringify({ code: fileContent, fileName }),
      });

      if (!response.ok) {
        const { error: apiError } = await response.json();
        throw new Error(apiError ?? "Unable to clean code.");
      }

      const { cleanedCode } = await response.json();
      setOutput(cleanedCode);
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
    if (!hasOutput) {
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      setError("Unable to copy to clipboard. Please copy manually.");
    }
  };

  const handleDownload = () => {
    if (!hasOutput) {
      return;
    }

    const extension = fileName?.split(".").pop() ?? downloadExtension;
    const downloadName = fileName
      ? fileName.replace(/\.[^/.]+$/, `.${extension}`)
      : `refactored.${extension}`;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadName;
    anchor.click();

    URL.revokeObjectURL(url);
  };

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
              Upload a component, let AI clean Tailwind classes, restructure
              JSX, and download a production-ready file in seconds.
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
                  We only process the file in-memory - nothing is stored.
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
                  We auto-detect the language and format it for you.
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
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    Result
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Cleaned Code
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!hasOutput}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!hasOutput}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                  >
                    Download
                  </button>
                </div>
              </div>

              {!fileName && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <label htmlFor="download-extension" className="font-medium">
                    Download as
                  </label>
                  <select
                    id="download-extension"
                    value={downloadExtension}
                    onChange={(event) =>
                      setDownloadExtension(event.target.value as "tsx" | "jsx")
                    }
                    className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
                  >
                    <option value="tsx">.tsx</option>
                    <option value="jsx">.jsx</option>
                  </select>
                </div>
              )}

              {hasOutput ? (
                <CodeEditor
                  code={output}
                  fileName={fileName}
                  readOnly
                  theme={theme}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                  Run “Clean Code” to see refactored output.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
