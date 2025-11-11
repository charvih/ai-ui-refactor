"use client";

import Editor from "@monaco-editor/react";
import React, { useEffect, useState } from "react";

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  fileName?: string; // Optional file name to infer language
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
}) => {
  const [language, setLanguage] = useState<string>(inferLanguage(fileName));

  useEffect(() => {
    setLanguage(inferLanguage(fileName));
  }, [fileName]);

  return (
    <>
      <div className="rounded-lg">
        <div
          className={`flex justify-between items-center p-2 bg-gray-100 border-b border-gray-300 ${onCodeChange === undefined ? "hidden" : "flex"}`}
        >
          <label htmlFor="language-select" className="text-sm text-gray-600">
            Language:
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm border border-gray-300 rounded p-1"
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
        <Editor
          height="420px"
          language={language}
          theme="vs-light"
          value={code}
          onChange={(value) => onCodeChange?.(value ?? "")}
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
    </>
  );
};

export default CodeEditor;
