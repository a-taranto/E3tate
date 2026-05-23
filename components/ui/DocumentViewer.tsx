"use client";

import { useState, useEffect } from "react";
import { Button, Card, Input } from "@/components/ui";
import { documentTypes } from "@/lib/documentConfig";
import { logActivity } from "@/lib/activityLogger";
import {
  Eye,
  Edit,
  Save,
  X,
  Lock,
  FileText,
  History,
  AlertCircle,
  Check,
  Download,
  File,
} from "lucide-react";

interface DocumentViewerProps {
  docType: string;
  fileName: string;
  fileData: string;
  onClose: () => void;
  onSave?: (newContent: string) => void;
}

export default function DocumentViewer({
  docType,
  fileName,
  fileData,
  onClose,
  onSave,
}: DocumentViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const config = documentTypes[docType];
  const requiresPassword = config?.requiresPasswordToView;
  const isEditable = config?.editable;

  // Helper: Detect if file is a binary office document
  const isBinaryOfficeDoc = (filename: string): boolean => {
    const ext = filename.toLowerCase().split('.').pop() || '';
    return ['docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt'].includes(ext);
  };

  // Helper: Get file extension
  const getFileExtension = (filename: string): string => {
    return filename.toLowerCase().split('.').pop() || '';
  };

  // Helper: Get file size from data URL
  const getFileSize = (dataUrl: string): string => {
    try {
      const base64 = dataUrl.split(',')[1] || '';
      const bytes = atob(base64).length;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } catch {
      return 'Unknown';
    }
  };

  const isBinaryDoc = isBinaryOfficeDoc(fileName);

  useEffect(() => {
    // Load document content and version history
    if (!requiresPassword || isPasswordVerified) {
      loadDocumentContent();
    }
  }, [isPasswordVerified, docType]);

  const loadDocumentContent = () => {
    try {
      // For text documents, extract text content
      if (config?.fileType === "text") {
        // If it's a data URL, extract the content
        if (fileData.startsWith("data:")) {
          const base64Data = fileData.split(",")[1];
          const decodedContent = atob(base64Data);
          setContent(decodedContent);
          setOriginalContent(decodedContent);
        } else {
          setContent(fileData);
          setOriginalContent(fileData);
        }
      } else {
        // For binary documents, just store the data URL
        setContent(fileData);
        setOriginalContent(fileData);
      }

      // Load version history from localStorage
      const versionKey = `document_versions_${docType}`;
      const savedVersions = localStorage.getItem(versionKey);
      if (savedVersions) {
        setVersions(JSON.parse(savedVersions));
      }
    } catch (error) {
      console.error("Error loading document:", error);
    }
  };

  const handlePasswordSubmit = () => {
    // Simple password check - in production this should be more secure
    const correctPassword = "secure123"; // This should come from user settings
    if (passwordInput === correctPassword) {
      setIsPasswordVerified(true);
      setPasswordError(false);
      logActivity(
        "Document Viewed",
        "vault",
        `Viewed ${config?.label}: ${fileName} (password verified)`,
        {
          field: `Document - ${docType}`,
          oldValue: "Locked",
          newValue: "Viewed",
        }
      );
    } else {
      setPasswordError(true);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    logActivity(
      "Document Edit Started",
      "vault",
      `Started editing ${config?.label}: ${fileName}`,
      {
        field: `Document - ${docType}`,
        oldValue: "Viewing",
        newValue: "Editing",
      }
    );
  };

  const handleCancelEdit = () => {
    setContent(originalContent);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!onSave) return;

    // Create new version
    const newVersion = {
      version: versions.length + 1,
      timestamp: new Date().toISOString(),
      content: content,
      changes: `Updated document content`,
      editedBy: "User",
    };

    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);

    // Save versions to localStorage
    const versionKey = `document_versions_${docType}`;
    localStorage.setItem(versionKey, JSON.stringify(updatedVersions));

    // Convert content back to data URL format
    const base64Content = btoa(content);
    const newDataUrl = `data:text/plain;base64,${base64Content}`;

    onSave(newDataUrl);
    setOriginalContent(content);
    setIsEditing(false);

    logActivity(
      "Document Saved",
      "vault",
      `Saved changes to ${config?.label}: ${fileName} (Version ${newVersion.version})`,
      {
        field: `Document - ${docType}`,
        oldValue: `Version ${versions.length}`,
        newValue: `Version ${newVersion.version}`,
      }
    );
  };

  const handleRevertToVersion = (version: any) => {
    setContent(version.content);
    setShowVersionHistory(false);
    logActivity(
      "Document Reverted",
      "vault",
      `Reverted ${config?.label}: ${fileName} to Version ${version.version}`,
      {
        field: `Document - ${docType}`,
        oldValue: `Version ${versions.length}`,
        newValue: `Version ${version.version}`,
      }
    );
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logActivity(
        "Document Downloaded",
        "vault",
        `Downloaded ${config?.label}: ${fileName}`,
        {
          field: `Document - ${docType}`,
          oldValue: "N/A",
          newValue: "Downloaded",
        }
      );
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  // Password verification screen
  if (requiresPassword && !isPasswordVerified) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--warning-bg)" }}>
              <Lock className="h-5 w-5" style={{ color: "var(--warning)" }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Security Verification Required
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                This document requires password verification
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Document: <strong>{config?.label}</strong> - {fileName}
            </p>
            <Input
              type="password"
              label="Enter Password"
              placeholder="Enter your document password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError(false);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") handlePasswordSubmit();
              }}
            />
            {passwordError && (
              <p className="text-sm mt-2" style={{ color: "var(--error)" }}>
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Incorrect password. Please try again.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePasswordSubmit} className="flex-1">
              <Lock className="h-4 w-4" />
              Verify & View
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main viewer/editor
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--accent-dim)" }}>
              <FileText className="h-5 w-5" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {config?.label}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {fileName} {versions.length > 0 && `• Version ${versions.length + 1}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-3 mb-4">
          {!isBinaryDoc && isEditable && !isEditing && (
            <Button variant="primary" size="sm" onClick={handleStartEdit}>
              <Edit className="h-4 w-4" />
              Edit Document
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
          {!isEditing && (
            <Button variant="primary" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download Original
            </Button>
          )}
          {versions.length > 0 && !isBinaryDoc && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              <History className="h-4 w-4" />
              Version History ({versions.length})
            </Button>
          )}
          {isEditable && !isBinaryDoc && (
            <div
              className="ml-auto text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: "var(--success-bg)", color: "var(--success)" }}
            >
              <Check className="h-3 w-3 inline mr-1" />
              Editable
            </div>
          )}
          {(!isEditable || isBinaryDoc) && (
            <div
              className="ml-auto text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: "var(--warning-bg)", color: "var(--warning)" }}
            >
              <Lock className="h-3 w-3 inline mr-1" />
              View Only
            </div>
          )}
        </div>

        {/* Version History */}
        {showVersionHistory && (
          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
            <h4 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Version History
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {versions.map((version) => (
                <div
                  key={version.version}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      Version {version.version}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(version.timestamp).toLocaleString()} • {version.editedBy}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRevertToVersion(version)}>
                    Revert
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {isBinaryDoc ? (
            // For binary office documents (.docx, .xlsx, etc.), show metadata only
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md">
                <div
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent-dim)" }}
                >
                  <File className="h-12 w-12" style={{ color: "var(--accent)" }} />
                </div>
                <h4 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {fileName}
                </h4>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-center gap-4 text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>
                      Type: <strong style={{ color: "var(--text-primary)" }}>
                        {getFileExtension(fileName).toUpperCase()}
                      </strong>
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      Size: <strong style={{ color: "var(--text-primary)" }}>
                        {getFileSize(fileData)}
                      </strong>
                    </span>
                  </div>
                </div>
                <div
                  className="p-4 rounded-lg text-sm"
                  style={{ backgroundColor: "var(--info-bg)", borderLeft: "3px solid var(--info)" }}
                >
                  <p style={{ color: "var(--text-secondary)" }}>
                    This is a Microsoft Office document. Click "Download Original" above to view or edit the file in Word, Excel, or PowerPoint.
                  </p>
                </div>
              </div>
            </div>
          ) : config?.fileType === "text" ? (
            isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[400px] p-4 rounded-lg border font-mono text-sm"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="Enter document content..."
              />
            ) : (
              <div
                className="w-full h-full min-h-[400px] p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                {content || "No content available"}
              </div>
            )
          ) : (
            // For other binary files (images, PDFs), show the file
            <div className="flex items-center justify-center min-h-[400px]">
              {fileData.includes("image") ? (
                <img src={fileData} alt={fileName} className="max-w-full max-h-[600px] rounded-lg" />
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
                  <p style={{ color: "var(--text-secondary)" }}>
                    {fileName}
                  </p>
                  <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
                    Document loaded successfully
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
