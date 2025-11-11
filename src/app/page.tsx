"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"input" | "output">("input");
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setCode(text);
      }
    };
    reader.readAsText(file);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl bg-white p-6 rounded-xl shadow-sm border">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">AI Code Refactorer</h1>

        {/* TABS */}
        <div className="flex gap-6 border-b mb-6">
          <button
            onClick={() => setActiveTab("input")}
            className={`pb-2 px-1 border-b-2 text-sm font-semibold ${
              activeTab === "input"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Input
          </button>

          <button
            onClick={() => setActiveTab("output")}
            className={`pb-2 px-1 border-b-2 text-sm font-semibold ${
              activeTab === "output"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Output
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "input" && (
          <div>
            {/* File Upload */}
            <label className="block text-sm font-medium mb-2">
              Upload a .jsx or .tsx file:
            </label>

            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded-lg cursor-pointer transition border border-gray-300"
            >
              Choose File
            </label>

            <input
              id="file-upload"
              type="file"
              accept=".js,.jsx,.ts,.tsx"
              onChange={handleFileUpload}
              className="hidden"
            />

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

              <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                <Editor
                  height="420px"
                  defaultLanguage="javascript"
                  theme="vs-light"
                  value={code}
                  onChange={(value) => setCode(value ?? "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 12 },
                    smoothScrolling: true,
                    scrollbar: {
                      verticalScrollbarSize: 8,
                      horizontalScrollbarSize: 8,
                    },
                    lineNumbersMinChars: 3,
                    renderWhitespace: "selection",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    formatOnPaste: true,
                    formatOnType: true,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>
            </div>

            <button
              className="mt-4 w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
              onClick={() => alert("AI cleaning implemented in backend branch")}
            >
              Clean Code (AI)
            </button>
          </div>
        )}

        {activeTab === "output" && (
          <div className="w-full h-80 border rounded-lg bg-gray-50 p-3 text-sm font-mono text-gray-700">
            {/* Placeholder for now */}
            No cleaned code yet. Once we build the backend, the result will
            appear here.
          </div>
        )}
      </div>
    </main>
  );
}
