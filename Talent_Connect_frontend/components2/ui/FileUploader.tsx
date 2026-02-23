"use client";

import React, { useRef, useState, ChangeEvent } from "react";

interface FileUploaderProps {
  files: File[];
  setFiles: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
}

export default function FileUploader({
  files,
  setFiles,
  multiple = true,
  accept = "*",
  label = "Upload Files",
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = multiple ? [...files, ...Array.from(selectedFiles)] : [selectedFiles[0]];
    setFiles(newFiles);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? "border-primary bg-primary/10" : "border-base-300 bg-base-100"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-primary font-semibold">{label}</p>
        <p className="text-base-content opacity-70 text-sm mt-1">Drag & drop files here or click to select</p>
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          ref={inputRef}
          onChange={handleInputChange}
        />
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
            {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border border-base-300 rounded-lg p-2 bg-base-100 shadow-sm"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                className="btn btn-xs btn-outline btn-error"
                onClick={() => removeFile(idx)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
