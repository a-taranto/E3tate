"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WillWizard } from '@/components/will/WillWizard';
import { WillData, INITIAL_WILL_DATA } from '@/types/will';

export default function WillBuilderPage() {
  const router = useRouter();
  const [willData, setWillData] = useState<WillData>(INITIAL_WILL_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing draft from localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
      // Load existing will from localStorage or vault
      const saved = localStorage.getItem(`will-draft-${editId}`);
      if (saved) {
        setWillData(JSON.parse(saved));
      }
    } else {
      // Check for any existing draft
      const draftId = localStorage.getItem('will-current-draft-id');
      if (draftId) {
        const saved = localStorage.getItem(`will-draft-${draftId}`);
        if (saved) {
          setWillData(JSON.parse(saved));
        }
      } else {
        // Create new draft ID
        const newId = `will-${Date.now()}`;
        const newData = { ...INITIAL_WILL_DATA, id: newId };
        setWillData(newData);
        localStorage.setItem('will-current-draft-id', newId);
      }
    }
    setIsLoading(false);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (willData.id && !isLoading) {
      localStorage.setItem(`will-draft-${willData.id}`, JSON.stringify(willData));
      localStorage.setItem('will-current-draft-id', willData.id);
    }
  }, [willData, isLoading]);

  const handleUpdateWill = (updates: Partial<WillData>) => {
    setWillData(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSaveAndExit = () => {
    // Data is already auto-saved to localStorage
    router.push('/vault');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <WillWizard
        willData={willData}
        onUpdateWill={handleUpdateWill}
        onSaveAndExit={handleSaveAndExit}
      />
    </div>
  );
}
