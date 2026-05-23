"use client";

import { WillData } from '@/types/will';

interface PersonalInfoStepProps {
  data: WillData['personalInfo'];
  onUpdate: (data: WillData['personalInfo']) => void;
}

export function PersonalInfoStep({ data, onUpdate }: PersonalInfoStepProps) {
  const handleChange = (field: keyof WillData['personalInfo'], value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Personal Information</h2>
        <p className="text-stone-600">Let's start with your basic information</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Full Legal Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="Enter your full legal name"
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* SSN (Optional) */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Social Security Number (Optional)
          </label>
          <input
            type="text"
            value={data.ssn || ''}
            onChange={(e) => handleChange('ssn', e.target.value)}
            placeholder="XXX-XX-XXXX"
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <p className="text-xs text-stone-500 mt-1">Optional but recommended for identification purposes</p>
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.streetAddress}
            onChange={(e) => handleChange('streetAddress', e.target.value)}
            placeholder="123 Main Street"
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* City, State, Zip in a row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="City"
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="State"
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="12345"
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
