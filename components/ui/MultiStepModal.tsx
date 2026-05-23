"use client";

import { ReactNode, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import Button from "./Button";

interface Step {
  title: string;
  content: ReactNode;
}

interface MultiStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  steps: Step[];
  onComplete: () => void;
}

export default function MultiStepModal({
  isOpen,
  onClose,
  title,
  steps,
  onComplete,
}: MultiStepModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-3xl rounded-lg shadow-lg"
          style={{ backgroundColor: "var(--bg-secondary)", boxShadow: "var(--shadow-lg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <h2
                className="text-xl font-semibold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                      index < currentStep
                        ? "bg-accent text-primary"
                        : index === currentStep
                        ? "bg-accent text-primary"
                        : "bg-border text-text-muted"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mx-2"
                      style={{
                        backgroundColor:
                          index < currentStep ? "var(--accent)" : "var(--border)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="text-xs"
                  style={{
                    color:
                      index <= currentStep
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    width: `${100 / steps.length}%`,
                    textAlign: index === 0 ? "left" : index === steps.length - 1 ? "right" : "center",
                  }}
                >
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {steps[currentStep].content}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-4 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              {isLastStep ? (
                <Button variant="primary" onClick={handleComplete}>
                  <Check className="h-4 w-4" />
                  Encrypt & Save
                </Button>
              ) : (
                <Button variant="primary" onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
