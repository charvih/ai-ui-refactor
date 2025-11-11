"use client";

import CodeEditor from "@/components/CodeEditor";
import FileUploader from "@/components/FileUploader";
import Tabs from "@/components/Tabs";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useState } from "react";

export default function Home() {
  const { fileName, fileContent, handleFileUpload, updateFileContent } =
    useFileUpload();
  const [activeTab, setActiveTab] = useState("input");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCleanCode = async () => {
    if (!fileContent.trim()) {
      setError("Please provide code to clean.");
      return;
    }

    try {
      const response = await fetch("/api/clean-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fileContent }),
      });

      if (response.ok) {
        const { cleanedCode } = await response.json();
        setOutput(cleanedCode);
        setActiveTab("output");
      } else {
        setError("Failed to clean code. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm border">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">AI Code Refactorer</h1>

        {/* TABS */}
        <Tabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={[
            { id: "input", label: "Input" },
            { id: "output", label: "Output" },
          ]}
        />

        {error && activeTab === "input" && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === "input" && (
          <>
            {/* File Upload */}
            <label className="block text-sm font-medium mb-2">
              Upload a .jsx or .tsx file:
            </label>

            <FileUploader onFileUpload={handleFileUpload} />

            {fileName && (
              <p className="text-sm text-gray-600 mt-1">
                Loaded: <span className="font-medium">{fileName}</span>
              </p>
            )}

            {/* Text Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Or paste code:
              </label>

              <CodeEditor
                code={fileContent}
                onCodeChange={updateFileContent}
                fileName={fileName}
              />
            </div>

            <button
              onClick={async () => {
                setIsLoading(true);
                await handleCleanCode();
                setIsLoading(false);
              }}
              disabled={isLoading}
              className={`mt-4 theme-button ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Cleaning..." : "Clean Code"}
            </button>
          </>
        )}

        {activeTab === "output" && (
          <div className="mt-4">
            {output ? (
              <>
                <h2 className="text-xl font-semibold mb-2">Cleaned Code:</h2>
                <CodeEditor
                  code={output}
                  onCodeChange={() => {}}
                  fileName={fileName}
                  options={{ readOnly: true }}
                />
              </>
            ) : (
              <p className="text-gray-600">
                Run "Clean Code" first to see the output.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  fileName?: string;
  options?: Record<string, any>;
}
