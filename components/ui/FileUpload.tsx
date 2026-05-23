"use client";

import { useState, useCallback } from "react";
import { Upload, File, X } from "lucide-react";
import Button from "./Button";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export default function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  acceptedTypes = ["*"],
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      setSelectedFiles(files);
      onFilesSelected(files);
    },
    [maxFiles, onFilesSelected]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files).slice(0, maxFiles);
        setSelectedFiles(files);
        onFilesSelected(files);
      }
    },
    [maxFiles, onFilesSelected]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [selectedFiles, onFilesSelected]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? "border-accent bg-accent-dim"
            : "border-border hover:border-accent/50"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          accept={acceptedTypes.join(",")}
        />

        <Upload
          className="h-12 w-12 mx-auto mb-4"
          style={{ color: isDragging ? "var(--accent)" : "var(--text-muted)" }}
        />

        <h3
          className="text-lg font-medium mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {isDragging ? "Drop files here" : "Upload files"}
        </h3>

        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          Drag and drop files here, or click to browse
        </p>

        <label htmlFor="file-upload">
          <Button variant="secondary" size="sm" type="button" onClick={() => document.getElementById('file-upload')?.click()}>
            Browse Files
          </Button>
        </label>

        <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
          Maximum {maxFiles} file{maxFiles > 1 ? "s" : ""} • All files will be
          encrypted
        </p>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-5 w-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="ml-2 p-1 hover:bg-red-500/10 rounded transition-colors"
                style={{ color: "var(--error)" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
