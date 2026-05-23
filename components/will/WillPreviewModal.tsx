"use client";

import { WillData } from '@/types/will';
import { generateWillDocument } from '@/lib/willGenerator';
import Button from '@/components/ui/Button';
import { X, Download } from 'lucide-react';

interface WillPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  willData: WillData;
}

export function WillPreviewModal({ isOpen, onClose, willData }: WillPreviewModalProps) {
  if (!isOpen) return null;

  const documentText = generateWillDocument(willData);

  const handleDownload = () => {
    // Create a blob with the document text
    const blob = new Blob([documentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Last-Will-Testament-${willData.personalInfo.fullName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
            <h2 className="text-xl font-bold text-stone-900">
              Will Document Preview
            </h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-8">
              <pre className="whitespace-pre-wrap font-mono text-sm text-stone-900 leading-relaxed">
                {documentText}
              </pre>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-stone-200 bg-stone-50">
            <p className="text-sm text-stone-600">
              This is a preview. Download the document for printing and signing.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download as Text
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
