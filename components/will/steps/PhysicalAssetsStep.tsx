"use client";

import { useState } from 'react';
import { WillData } from '@/types/will';
import Button from '@/components/ui/Button';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

interface PhysicalAssetsStepProps {
  assets: WillData['physicalAssets'];
  onUpdate: (assets: WillData['physicalAssets']) => void;
}

export function PhysicalAssetsStep({ assets, onUpdate }: PhysicalAssetsStepProps) {
  const handleAdd = () => {
    const newAsset = {
      id: `physical-${Date.now()}`,
      name: '',
      type: '',
      assignee: '',
      notes: '',
    };
    onUpdate([...assets, newAsset]);
  };

  const handleUpdate = (id: string, field: keyof WillData['physicalAssets'][0], value: string | number) => {
    onUpdate(
      assets.map((asset) =>
        asset.id === id ? { ...asset, [field]: value } : asset
      )
    );
  };

  const handleDelete = (id: string) => {
    onUpdate(assets.filter((asset) => asset.id !== id));
  };

  const handleLinkFromVault = () => {
    // TODO: Open modal to select from vault
    console.log('Link from vault');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Physical Assets</h2>
        <p className="text-stone-600">
          Specify real estate, vehicles, jewelry, and other physical property
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={handleAdd}
          className="bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Manually
        </Button>
        <Button
          variant="secondary"
          onClick={handleLinkFromVault}
          className="bg-white border-stone-200 text-violet-600 hover:bg-violet-50"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Link from Vault
        </Button>
      </div>

      <div className="space-y-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="border border-stone-200 rounded-lg p-4 bg-stone-50"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={asset.name}
                    onChange={(e) => handleUpdate(asset.id, 'name', e.target.value)}
                    placeholder="e.g., Family Home, 2019 Tesla Model 3"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={asset.type}
                    onChange={(e) => handleUpdate(asset.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select type</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="art">Art/Collectibles</option>
                    <option value="furniture">Furniture</option>
                    <option value="business">Business Interest</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Estimated Value (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
                    <input
                      type="number"
                      min="0"
                      value={asset.value || ''}
                      onChange={(e) => handleUpdate(asset.id, 'value', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Assign To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={asset.assignee}
                    onChange={(e) => handleUpdate(asset.id, 'assignee', e.target.value)}
                    placeholder="Beneficiary name"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={asset.notes}
                  onChange={(e) => handleUpdate(asset.id, 'notes', e.target.value)}
                  placeholder="Location, description, special instructions..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(asset.id)}
                  className="bg-white border-stone-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}

        {assets.length === 0 && (
          <div className="text-center py-8 text-stone-500 border-2 border-dashed border-stone-200 rounded-lg">
            No physical assets added yet. This step is optional.
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-1">About Physical Assets</h3>
        <p className="text-sm text-blue-800">
          Physical assets include real estate, vehicles, jewelry, art, and personal property.
          You can link existing records from your Vault or add them manually. Estimated values help your
          executor understand the scope of the estate.
        </p>
      </div>
    </div>
  );
}
