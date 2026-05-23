"use client";

import { useState } from 'react';
import { WillData, WillVaultMetadata } from '@/types/will';
import Button from '@/components/ui/Button';
import { Check, AlertCircle, FileText, Download, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WillPreviewModal } from '../WillPreviewModal';

interface ReviewStepProps {
  willData: WillData;
  onUpdateWill: (updates: Partial<WillData>) => void;
}

export function ReviewStep({ willData, onUpdateWill }: ReviewStepProps) {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(willData.acknowledgedDisclaimer);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Check completion status of each section
  const sections = {
    personalInformation: !!(
      willData.personalInfo.fullName &&
      willData.personalInfo.dateOfBirth &&
      willData.personalInfo.streetAddress &&
      willData.personalInfo.city &&
      willData.personalInfo.state &&
      willData.personalInfo.zipCode
    ),
    executorAppointment: willData.executors.length > 0 &&
      willData.executors.every(e => e.name && e.relationship && e.email),
    beneficiaries: willData.beneficiaries.length > 0 &&
      willData.beneficiaries.every(b => b.name && b.relationship) &&
      willData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0) === 100,
    digitalAssets: true, // Optional
    physicalAssets: true, // Optional
    finalWishes: !!willData.finalWishes.burialPreference,
  };

  const allComplete = Object.values(sections).every(s => s);

  const handleSaveToVault = async () => {
    if (!allComplete || !acknowledged) return;

    setIsSaving(true);

    // Create vault record
    const vaultRecord = {
      id: `vault-${Date.now()}`,
      title: `Last Will and Testament - ${willData.personalInfo.fullName}`,
      description: `Will created on ${new Date().toLocaleDateString()}`,
      type: 'documents',
      scope: 'executor',
      beneficiaries: willData.beneficiaries.map(b => b.name),
      encrypted: false,
      profileLinked: false,
      lastModified: new Date().toISOString(),
      metadata: {
        createdWith: 'will-builder',
        status: 'complete',
        reviewingAttorney: willData.reviewingAttorney,
        documentSections: sections,
      } as WillVaultMetadata,
    };

    // Save to localStorage (in production, this would be API call)
    const existingRecords = JSON.parse(localStorage.getItem('vaultRecords') || '[]');
    existingRecords.push(vaultRecord);
    localStorage.setItem('vaultRecords', JSON.stringify(existingRecords));

    // Update will data
    onUpdateWill({
      status: 'complete',
      completedAt: new Date().toISOString(),
      vaultRecordId: vaultRecord.id,
      acknowledgedDisclaimer: acknowledged,
    });

    // Clear draft
    localStorage.removeItem('will-current-draft-id');
    localStorage.removeItem(`will-draft-${willData.id}`);

    setTimeout(() => {
      setIsSaving(false);
      router.push('/vault');
    }, 1000);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <>
      <WillPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        willData={willData}
      />

      <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Review & Complete</h2>
        <p className="text-stone-600">
          Review your will and save it to your vault
        </p>
      </div>

      {/* Document sections checklist */}
      <div className="bg-white border border-stone-200 rounded-lg p-5">
        <h3 className="font-semibold text-stone-900 mb-4">Document Sections</h3>
        <div className="space-y-3">
          {[
            { key: 'personalInformation', label: 'Personal Information' },
            { key: 'executorAppointment', label: 'Executor Appointment' },
            { key: 'beneficiaries', label: 'Beneficiaries' },
            { key: 'digitalAssets', label: 'Digital Assets (Optional)' },
            { key: 'physicalAssets', label: 'Physical Assets (Optional)' },
            { key: 'finalWishes', label: 'Final Wishes' },
          ].map((section) => (
            <div key={section.key} className="flex items-center gap-3">
              {sections[section.key as keyof typeof sections] ? (
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-stone-400" />
                </div>
              )}
              <span className={sections[section.key as keyof typeof sections] ? 'text-stone-900' : 'text-stone-500'}>
                {section.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-5 space-y-4">
        <div>
          <div className="text-sm text-stone-600 mb-1">Testator</div>
          <div className="font-medium text-stone-900">{willData.personalInfo.fullName || 'Not specified'}</div>
        </div>
        <div>
          <div className="text-sm text-stone-600 mb-1">Primary Executor</div>
          <div className="font-medium text-stone-900">
            {willData.executors.find(e => e.isPrimary)?.name || 'Not specified'}
          </div>
        </div>
        <div>
          <div className="text-sm text-stone-600 mb-1">Beneficiaries</div>
          <div className="font-medium text-stone-900">
            {willData.beneficiaries.length > 0
              ? willData.beneficiaries.map(b => `${b.name} (${b.percentage}%)`).join(', ')
              : 'None specified'}
          </div>
        </div>
        <div>
          <div className="text-sm text-stone-600 mb-1">Assets Specified</div>
          <div className="font-medium text-stone-900">
            {willData.digitalAssets.length} digital, {willData.physicalAssets.length} physical
          </div>
        </div>
      </div>

      {/* Preview button */}
      <Button
        variant="secondary"
        onClick={handlePreview}
        className="w-full bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
      >
        <Eye className="w-4 h-4 mr-2" />
        Preview Will Document
      </Button>

      {/* Legal disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
        <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Legal Disclaimer
        </h3>
        <p className="text-sm text-amber-800 mb-4">
          This will builder creates a basic legal document based on the information you provided.
          While it follows standard legal formats, we strongly recommend having an attorney review
          your will before signing, especially if you have complex assets or family situations.
          State laws vary, and an attorney can ensure your will is valid in your jurisdiction.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => {
              setAcknowledged(e.target.checked);
              onUpdateWill({ acknowledgedDisclaimer: e.target.checked });
            }}
            className="mt-1 w-4 h-4 text-violet-600 rounded"
          />
          <span className="text-sm text-amber-900">
            I understand this is a basic legal document and I should consider having it reviewed by an attorney
            before signing. I acknowledge that this tool does not constitute legal advice.
          </span>
        </label>
      </div>

      {/* Save button */}
      <Button
        variant="primary"
        onClick={handleSaveToVault}
        disabled={!allComplete || !acknowledged || isSaving}
        className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          'Saving to Vault...'
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Complete & Save to Vault
          </>
        )}
      </Button>

      {!allComplete && (
        <p className="text-sm text-red-600 text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-4 h-4" />
          Please complete all required sections before saving
        </p>
      )}
      </div>
    </>
  );
}
