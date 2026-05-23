"use client";

interface Step {
  number: number;
  label: string;
  shortLabel: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
}

export function ProgressIndicator({ steps, currentStep, onStepClick }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isClickable = step.number <= currentStep;

        return (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step circle */}
            <button
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className={`
                flex flex-col items-center cursor-pointer transition-all
                ${!isClickable ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}
              `}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-200
                  ${isActive ? 'bg-violet-600 text-white ring-4 ring-violet-100' : ''}
                  ${isCompleted ? 'bg-violet-600 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-stone-200 text-stone-500' : ''}
                `}
              >
                {step.number}
              </div>
              <span
                className={`
                  text-xs mt-2 text-center hidden sm:block
                  ${isActive ? 'text-violet-600 font-medium' : ''}
                  ${isCompleted ? 'text-stone-600' : ''}
                  ${!isActive && !isCompleted ? 'text-stone-400' : ''}
                `}
              >
                {step.shortLabel}
              </span>
            </button>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 transition-all duration-200
                  ${step.number < currentStep ? 'bg-violet-600' : 'bg-stone-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
