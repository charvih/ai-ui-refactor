import { useState } from "react";

export function useFileUpload() {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");

  function handleFileUpload(file: File) {
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setFileContent(text);
      }
    };
    reader.readAsText(file);
  }

  function updateFileContent(newContent: string) {
    setFileContent(newContent);
  }

  return { fileName, fileContent, handleFileUpload, updateFileContent };
}
