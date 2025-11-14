"use client";

import React from "react";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }

  return (
    <div>
      <label
        htmlFor="file-upload"
        className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        Choose File
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".js,.jsx,.ts,.tsx"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUploader;
