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
        className="flex items-center justify-center w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded-lg cursor-pointer transition border border-gray-300"
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
