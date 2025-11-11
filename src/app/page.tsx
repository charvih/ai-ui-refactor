"use client";

import React, { useState } from "react";

export default function Home() {
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
      <div className="mx-auto max-w-3xl bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-4">AI Code Refactor Tool</h1>

        {/* Upload section */}
        <div className="mb-4">
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
        </div>

        {/* OR paste code */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Or paste your code manually:
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-56 p-3 border rounded-lg text-sm font-mono"
            placeholder="Paste your React or JSX code here..."
          />
        </div>

        {/* Process button */}
        <button
          className="w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
          onClick={() => alert("In the next branch, this will send to backend")}
        >
          Clean Code (AI)
        </button>
      </div>
    </main>
  );
}
