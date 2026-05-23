"use client";

import { useState } from 'react';
import { WillData } from '@/types/will';
import Button from '@/components/ui/Button';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

interface DigitalAssetsStepProps {
  assets: WillData['digitalAssets'];
  onUpdate: (assets: WillData['digitalAssets']) => void;
}

export function DigitalAssetsStep({ assets, onUpdate }: DigitalAssetsStepProps) {
  const handleAdd = () => {
    const newAsset = {
      id: `digital-${Date.now()}`,
      name: '',
      type: '',
      assignee: '',
      instructions: '',
    };
    onUpdate([...assets, newAsset]);
  };

  const handleUpdate = (id: string, field: keyof WillData['digitalAssets'][0], value: string) => {
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
        <h2 className="text-xl font-bold text-stone-900 mb-2">Digital Assets</h2>
        <p className="text-stone-600">
          Specify digital accounts, cryptocurrency, and online assets
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
                    placeholder="e.g., Gmail Account, Coinbase Wallet"
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
                    <option value="email">Email Account</option>
                    <option value="social">Social Media</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="cloud">Cloud Storage</option>
                    <option value="domain">Domain Name</option>
                    <option value="subscription">Subscription</option>
                    <option value="nft">NFT Collection</option>
                    <option value="other">Other</option>
                  </select>
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

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={asset.instructions}
                  onChange={(e) => handleUpdate(asset.id, 'instructions', e.target.value)}
                  placeholder="Special instructions for handling this asset..."
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
            No digital assets added yet. This step is optional.
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-1">About Digital Assets</h3>
        <p className="text-sm text-blue-800">
          Digital assets include cryptocurrency, NFTs, online accounts, domains, and cloud storage.
          You can link existing records from your Vault or add them manually. Credentials stored in your
          Vault remain secure - only access instructions are included in the will.
        </p>
      </div>
    </div>
  );
}
