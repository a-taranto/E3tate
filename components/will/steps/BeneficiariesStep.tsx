"use client";

import { useState, useEffect } from 'react';
import { WillData } from '@/types/will';
import Button from '@/components/ui/Button';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface BeneficiariesStepProps {
  beneficiaries: WillData['beneficiaries'];
  onUpdate: (beneficiaries: WillData['beneficiaries']) => void;
}

export function BeneficiariesStep({ beneficiaries, onUpdate }: BeneficiariesStepProps) {
  const [totalPercentage, setTotalPercentage] = useState(0);

  useEffect(() => {
    const total = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
    setTotalPercentage(total);
  }, [beneficiaries]);

  const handleAdd = () => {
    const newBeneficiary = {
      id: `beneficiary-${Date.now()}`,
      name: '',
      relationship: '',
      percentage: 0,
      email: '',
    };
    onUpdate([...beneficiaries, newBeneficiary]);
  };

  const handleUpdate = (id: string, field: keyof WillData['beneficiaries'][0], value: string | number) => {
    onUpdate(
      beneficiaries.map((ben) =>
        ben.id === id ? { ...ben, [field]: value } : ben
      )
    );
  };

  const handleDelete = (id: string) => {
    onUpdate(beneficiaries.filter((ben) => ben.id !== id));
  };

  const isValidTotal = totalPercentage === 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Beneficiaries</h2>
        <p className="text-stone-600">
          Who will inherit your estate? Allocate percentages to each beneficiary.
        </p>
      </div>

      {/* Percentage indicator */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-stone-700">Total Allocation</span>
          <span className={`text-lg font-bold ${isValidTotal ? 'text-green-600' : 'text-red-600'}`}>
            {totalPercentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              totalPercentage > 100 ? 'bg-red-500' : totalPercentage === 100 ? 'bg-green-500' : 'bg-violet-500'
            }`}
            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
          />
        </div>
        {!isValidTotal && (
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Total must equal 100%
          </p>
        )}
      </div>

      <div className="space-y-4">
        {beneficiaries.map((beneficiary) => (
          <div
            key={beneficiary.id}
            className="border border-stone-200 rounded-lg p-4 bg-stone-50"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={beneficiary.name}
                    onChange={(e) => handleUpdate(beneficiary.id, 'name', e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={beneficiary.relationship}
                    onChange={(e) => handleUpdate(beneficiary.id, 'relationship', e.target.value)}
                    placeholder="e.g., Child, Sibling"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Percentage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={beneficiary.percentage}
                      onChange={(e) => handleUpdate(beneficiary.id, 'percentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 pr-8 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={beneficiary.email || ''}
                  onChange={(e) => handleUpdate(beneficiary.id, 'email', e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(beneficiary.id)}
                  className="bg-white border-stone-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}

        {beneficiaries.length === 0 && (
          <div className="text-center py-8 text-stone-500">
            No beneficiaries added yet. Add at least one beneficiary to continue.
          </div>
        )}

        <Button
          variant="secondary"
          onClick={handleAdd}
          className="w-full bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Beneficiary
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-1">About Beneficiaries</h3>
        <p className="text-sm text-blue-800">
          Beneficiaries inherit your estate according to the percentages you specify. Make sure the total equals 100%.
          You can name individuals, trusts, or charitable organizations as beneficiaries.
        </p>
      </div>
    </div>
  );
}
