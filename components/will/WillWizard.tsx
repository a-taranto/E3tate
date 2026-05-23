"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WillData } from '@/types/will';
import { ProgressIndicator } from './ProgressIndicator';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { ExecutorsStep } from './steps/ExecutorsStep';
import { BeneficiariesStep } from './steps/BeneficiariesStep';
import { DigitalAssetsStep } from './steps/DigitalAssetsStep';
import { PhysicalAssetsStep } from './steps/PhysicalAssetsStep';
import { FinalWishesStep } from './steps/FinalWishesStep';
import { ReviewStep } from './steps/ReviewStep';
import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WillWizardProps {
  willData: WillData;
  onUpdateWill: (updates: Partial<WillData>) => void;
  onSaveAndExit: () => void;
}

const STEPS = [
  { number: 1, label: 'Personal Info', shortLabel: 'Personal' },
  { number: 2, label: 'Executors', shortLabel: 'Exec' },
  { number: 3, label: 'Beneficiaries', shortLabel: 'Benef' },
  { number: 4, label: 'Digital Assets', shortLabel: 'Digital' },
  { number: 5, label: 'Physical Assets', shortLabel: 'Physical' },
  { number: 6, label: 'Final Wishes', shortLabel: 'Final' },
  { number: 7, label: 'Review', shortLabel: 'Review' },
];

export function WillWizard({ willData, onUpdateWill, onSaveAndExit }: WillWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(willData.currentStep || 1);

  const handleNext = () => {
    if (currentStep < 7) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onUpdateWill({ currentStep: nextStep });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onUpdateWill({ currentStep: prevStep });
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    onUpdateWill({ currentStep: stepNumber });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            data={willData.personalInfo}
            onUpdate={(personalInfo) => onUpdateWill({ personalInfo })}
          />
        );
      case 2:
        return (
          <ExecutorsStep
            executors={willData.executors}
            onUpdate={(executors) => onUpdateWill({ executors })}
          />
        );
      case 3:
        return (
          <BeneficiariesStep
            beneficiaries={willData.beneficiaries}
            onUpdate={(beneficiaries) => onUpdateWill({ beneficiaries })}
          />
        );
      case 4:
        return (
          <DigitalAssetsStep
            assets={willData.digitalAssets}
            onUpdate={(digitalAssets) => onUpdateWill({ digitalAssets })}
          />
        );
      case 5:
        return (
          <PhysicalAssetsStep
            assets={willData.physicalAssets}
            onUpdate={(physicalAssets) => onUpdateWill({ physicalAssets })}
          />
        );
      case 6:
        return (
          <FinalWishesStep
            data={willData.finalWishes}
            onUpdate={(finalWishes) => onUpdateWill({ finalWishes })}
            reviewingAttorney={willData.reviewingAttorney}
            onUpdateAttorney={(reviewingAttorney) => onUpdateWill({ reviewingAttorney })}
          />
        );
      case 7:
        return (
          <ReviewStep
            willData={willData}
            onUpdateWill={onUpdateWill}
          />
        );
      default:
        return null;
    }
  };

  const progress = Math.round((currentStep / 7) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Will Builder</h1>
            <p className="text-stone-600 mt-1">Create your Last Will & Testament</p>
          </div>
          <Button
            variant="secondary"
            onClick={onSaveAndExit}
            className="bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
          >
            Save & Exit
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-stone-600">Step {currentStep} of 7</span>
            <span className="text-sm font-medium text-violet-600">{progress}% Complete</span>
          </div>
          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <ProgressIndicator
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6">
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="bg-white border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={currentStep === 7}
        >
          {currentStep === 7 ? 'Complete' : 'Next'}
          {currentStep < 7 && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
