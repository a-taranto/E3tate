"use client";

import { WillData } from '@/types/will';

interface FinalWishesStepProps {
  data: WillData['finalWishes'];
  onUpdate: (data: WillData['finalWishes']) => void;
  reviewingAttorney?: string;
  onUpdateAttorney: (attorney: string) => void;
}

export function FinalWishesStep({ data, onUpdate, reviewingAttorney, onUpdateAttorney }: FinalWishesStepProps) {
  const handleChange = (field: keyof WillData['finalWishes'], value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Final Wishes</h2>
        <p className="text-stone-600">
          Specify your preferences for burial, memorial, and executor guidance
        </p>
      </div>

      <div className="space-y-4">
        {/* Burial Preference */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Burial Preference <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'burial', label: 'Burial' },
              { value: 'cremation', label: 'Cremation' },
              { value: 'donation', label: 'Body Donation' },
              { value: 'other', label: 'Other' },
            ].map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${
                    data.burialPreference === option.value
                      ? 'border-violet-600 bg-violet-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="burialPreference"
                  value={option.value}
                  checked={data.burialPreference === option.value}
                  onChange={(e) => handleChange('burialPreference', e.target.value as any)}
                  className="w-4 h-4 text-violet-600"
                />
                <span className="text-stone-900 font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Burial Details */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Burial/Cremation Details (Optional)
          </label>
          <textarea
            value={data.burialDetails || ''}
            onChange={(e) => handleChange('burialDetails', e.target.value)}
            placeholder="Specific cemetery, funeral home, or arrangements..."
            rows={3}
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>

        {/* Memorial Instructions */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Memorial Service Instructions (Optional)
          </label>
          <textarea
            value={data.memorialInstructions}
            onChange={(e) => handleChange('memorialInstructions', e.target.value)}
            placeholder="Preferences for memorial service, music, readings, location..."
            rows={4}
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>

        {/* Executor Instructions */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Instructions for Executor (Optional)
          </label>
          <textarea
            value={data.executorInstructions}
            onChange={(e) => handleChange('executorInstructions', e.target.value)}
            placeholder="Special guidance for your executor about handling your estate..."
            rows={4}
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>

        {/* Reviewing Attorney */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Reviewing Attorney (Optional)
          </label>
          <input
            type="text"
            value={reviewingAttorney || ''}
            onChange={(e) => onUpdateAttorney(e.target.value)}
            placeholder="Attorney name and contact information"
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <p className="text-xs text-stone-500 mt-1">
            If you plan to have an attorney review your will before signing
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-1">About Final Wishes</h3>
        <p className="text-sm text-blue-800">
          These instructions help your loved ones honor your wishes and provide guidance for your executor.
          While optional, they can bring comfort and clarity during a difficult time.
        </p>
      </div>
    </div>
  );
}
