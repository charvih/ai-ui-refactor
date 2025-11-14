"use client";

import Editor from "@monaco-editor/react";
import React, { useEffect, useState } from "react";

interface CodeEditorProps {
  code: string;
  onCodeChange?: (code: string) => void;
  fileName?: string;
  readOnly?: boolean;
  theme?: "light" | "dark";
  height?: string;
}

const inferLanguage = (fileName: string | undefined): string => {
  if (!fileName) return "javascript"; // Default language
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "java":
      return "java";
    case "html":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    default:
      return "plaintext";
  }
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  fileName,
  readOnly = false,
  theme = "light",
  height = "420px",
}) => {
  const [language, setLanguage] = useState<string>(inferLanguage(fileName));
  const showLanguagePicker = !readOnly;
  const monacoTheme = theme === "dark" ? "vs-dark" : "vs-light";

  useEffect(() => {
    setLanguage(inferLanguage(fileName));
  }, [fileName]);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
        {showLanguagePicker && (
          <div className="flex items-center justify-between border border-b-0 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <label htmlFor="language-select" className="font-medium">
              Language
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="plaintext">Plain Text</option>
            </select>
          </div>
        )}
        <Editor
          height={height}
          language={language}
          theme={monacoTheme}
          value={code}
          onChange={(value) => {
            if (readOnly) {
              return;
            }
            onCodeChange?.(value ?? "");
          }}
          options={{
            readOnly,
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
    </>
  );
};

export default CodeEditor;
