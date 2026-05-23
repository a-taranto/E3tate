"use client";

import { useState } from 'react';
import { WillData } from '@/types/will';
import Button from '@/components/ui/Button';
import { Plus, Trash2, Star } from 'lucide-react';

interface ExecutorsStepProps {
  executors: WillData['executors'];
  onUpdate: (executors: WillData['executors']) => void;
}

export function ExecutorsStep({ executors, onUpdate }: ExecutorsStepProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    const newExecutor = {
      id: `executor-${Date.now()}`,
      name: '',
      relationship: '',
      email: '',
      phone: '',
      isPrimary: executors.length === 0, // First executor is primary by default
    };
    onUpdate([...executors, newExecutor]);
    setIsAdding(false);
  };

  const handleUpdate = (id: string, field: keyof WillData['executors'][0], value: string | boolean) => {
    onUpdate(
      executors.map((exec) =>
        exec.id === id ? { ...exec, [field]: value } : exec
      )
    );
  };

  const handleSetPrimary = (id: string) => {
    onUpdate(
      executors.map((exec) => ({
        ...exec,
        isPrimary: exec.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    const updated = executors.filter((exec) => exec.id !== id);
    // If we deleted the primary, make the first one primary
    if (updated.length > 0 && !updated.some((e) => e.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Executors</h2>
        <p className="text-stone-600">
          Choose who will manage your estate and carry out your wishes
        </p>
      </div>

      <div className="space-y-4">
        {executors.map((executor) => (
          <div
            key={executor.id}
            className="border border-stone-200 rounded-lg p-4 bg-stone-50 relative"
          >
            {executor.isPrimary && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Primary
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={executor.name}
                    onChange={(e) => handleUpdate(executor.id, 'name', e.target.value)}
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
                    value={executor.relationship}
                    onChange={(e) => handleUpdate(executor.id, 'relationship', e.target.value)}
                    placeholder="e.g., Spouse, Child, Friend"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={executor.email}
                    onChange={(e) => handleUpdate(executor.id, 'email', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={executor.phone || ''}
                    onChange={(e) => handleUpdate(executor.id, 'phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {!executor.isPrimary && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSetPrimary(executor.id)}
                    className="bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Set as Primary
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(executor.id)}
                  className="bg-white border-stone-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}

        {executors.length === 0 && (
          <div className="text-center py-8 text-stone-500">
            No executors added yet. Add at least one executor to continue.
          </div>
        )}

        <Button
          variant="secondary"
          onClick={handleAdd}
          className="w-full bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Executor
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-1">About Executors</h3>
        <p className="text-sm text-blue-800">
          Your executor will be responsible for managing your estate, paying debts, and distributing assets.
          Choose someone you trust who is organized and responsible. It's wise to name a backup executor.
        </p>
      </div>
    </div>
  );
}
