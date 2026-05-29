"use client";

import { useState } from "react";
import { ServiceDefinition } from "@/lib/services";
import { type Beneficiary } from "@/lib/store";
import { Card, Button } from "@/components/ui";
import {
  Eye,
  EyeOff,
  Lock,
  ExternalLink,
  Info,
  Shield,
  Users,
  Heart,
} from "lucide-react";
import Image from "next/image";

interface ServiceFormData {
  // Account details (dynamic based on service.fields)
  accountDetails: { [fieldId: string]: string };

  // Credentials
  storeCredentials: boolean;
  password?: string;
  twoFactorMethod?: string;
  recoveryCodes?: string;

  // Wishes
  wishAction: string;
  transferBeneficiary?: string;
  legacyContact?: string;
  additionalInstructions?: string;

  // Subscription (if applicable)
  monthlyCost?: string;
  plan?: string;
}

interface ServiceSetupFormProps {
  service: ServiceDefinition;
  beneficiaries: Beneficiary[];
  currentIndex?: number;
  totalServices?: number;
  initialData?: ServiceFormData; // prefill when editing an already-set-up service
  onSave: (formData: ServiceFormData) => void;
  onSkip: () => void;
}

export default function ServiceSetupForm({
  service,
  beneficiaries,
  currentIndex = 0,
  totalServices = 1,
  initialData,
  onSave,
  onSkip,
}: ServiceSetupFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>(
    initialData ?? {
      accountDetails: {},
      storeCredentials: true,
      wishAction: service.defaultAction,
    }
  );

  const [showPassword, setShowPassword] = useState(false);
  const [imageError, setImageError] = useState(false);

  const updateFormData = (field: keyof ServiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAccountDetail = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      accountDetails: { ...prev.accountDetails, [fieldId]: value },
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const executorBeneficiaries = beneficiaries.filter((b) => b.role === "executor");

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator — only when stepping through multiple services */}
      {totalServices > 1 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Setting up service {currentIndex + 1} of {totalServices}
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              {Math.round(((currentIndex + 1) / totalServices) * 100)}%
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                backgroundColor: "var(--accent)",
                width: `${((currentIndex + 1) / totalServices) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 flex items-center justify-center flex-shrink-0">
            {service.logo && !imageError ? (
              <img
                src={service.logo}
                alt={service.name}
                className="w-12 h-12 object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className="text-3xl font-bold"
                style={{ color: "var(--accent)" }}
              >
                {service.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {service.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1 rounded-full font-medium border" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                {service.category}
              </span>
              {service.hasSubscription && (
                <span className="text-xs px-3 py-1 rounded-full font-medium border" style={{ borderColor: "var(--warning)", color: "var(--warning)" }}>
                  Paid Service
                </span>
              )}
              {service.has2FA && (
                <span className="text-xs px-3 py-1 rounded-full font-medium border" style={{ borderColor: "var(--success)", color: "var(--success)" }}>
                  2FA Supported
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Death Policy Link */}
        {service.deathPolicyUrl && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <a
              href={service.deathPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm flex items-center gap-2 hover:underline"
              style={{ color: "var(--info)" }}
            >
              <Info className="h-4 w-4" />
              View {service.name}'s death policy
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </Card>

      {/* Account Details */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-6 w-6" style={{ color: "var(--accent)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Account Details
          </h3>
        </div>

        <div className="space-y-4">
          {service.fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                {field.label}
                {field.required && <span style={{ color: "var(--error)" }}> *</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  className="input w-full"
                  rows={3}
                  placeholder={field.placeholder}
                  value={formData.accountDetails[field.id] || ""}
                  onChange={(e) => updateAccountDetail(field.id, e.target.value)}
                  required={field.required}
                />
              ) : field.type === "select" && field.options ? (
                <select
                  className="input w-full"
                  value={formData.accountDetails[field.id] || ""}
                  onChange={(e) => updateAccountDetail(field.id, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="input w-full"
                  placeholder={field.placeholder}
                  value={formData.accountDetails[field.id] || ""}
                  onChange={(e) => updateAccountDetail(field.id, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>

        {/* Subscription Info */}
        {service.hasSubscription && (
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>
              Subscription Details (Optional)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Plan Type
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Premium, Pro"
                  value={formData.plan || ""}
                  onChange={(e) => updateFormData("plan", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Monthly Cost
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., $14.99"
                  value={formData.monthlyCost || ""}
                  onChange={(e) => updateFormData("monthlyCost", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Credentials */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-6 w-6" style={{ color: "var(--accent)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Secure Credentials
          </h3>
        </div>

        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.storeCredentials}
            onChange={(e) => updateFormData("storeCredentials", e.target.checked)}
            className="w-5 h-5 rounded"
            style={{ accentColor: "var(--accent)" }}
          />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Store credentials securely in encrypted vault
          </span>
        </label>

        {formData.storeCredentials && (
          <div className="space-y-4 p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-start gap-2 mb-4">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                All credentials are encrypted end-to-end and only accessible by you and your designated executors after trigger activation.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input w-full pr-10"
                  placeholder="Enter password"
                  value={formData.password || ""}
                  onChange={(e) => updateFormData("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {service.has2FA && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  2FA Method
                </label>
                <select
                  className="input w-full"
                  value={formData.twoFactorMethod || ""}
                  onChange={(e) => updateFormData("twoFactorMethod", e.target.value)}
                >
                  <option value="">Select 2FA method...</option>
                  <option value="app">Authenticator App</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="hardware">Hardware Key</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Recovery Codes (Optional)
              </label>
              <textarea
                className="input w-full"
                rows={3}
                placeholder="Paste backup/recovery codes here, one per line"
                value={formData.recoveryCodes || ""}
                onChange={(e) => updateFormData("recoveryCodes", e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Wishes */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-6 w-6" style={{ color: "var(--accent)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            What should happen to this account?
          </h3>
        </div>

        <div className="space-y-3 mb-4">
          {service.availableActions.map((action) => {
            const labels: { [key: string]: string } = {
              cancel: "Cancel subscription",
              delete: "Delete account permanently",
              transfer: "Transfer account to someone",
              memorialize: "Memorialize account",
              download_first: "Download data, then delete",
              keep_active: "Keep account active",
              close_account: "Close account",
              liquidate: "Liquidate and transfer funds",
            };

            return (
              <label
                key={action}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor:
                    formData.wishAction === action ? "var(--accent-dim)" : "transparent",
                  border: `2px solid ${
                    formData.wishAction === action ? "var(--accent)" : "var(--border)"
                  }`,
                }}
              >
                <input
                  type="radio"
                  name="wishAction"
                  value={action}
                  checked={formData.wishAction === action}
                  onChange={(e) => updateFormData("wishAction", e.target.value)}
                  style={{ accentColor: "var(--accent)" }}
                />
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {labels[action] || action}
                </span>
              </label>
            );
          })}
        </div>

        {/* Transfer Beneficiary Selector */}
        {formData.wishAction === "transfer" && (
          <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Transfer to
            </label>
            <select
              className="input w-full"
              value={formData.transferBeneficiary || ""}
              onChange={(e) => updateFormData("transferBeneficiary", e.target.value)}
            >
              <option value="">Select beneficiary...</option>
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.relationship || b.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Legacy Contact Selector */}
        {formData.wishAction === "memorialize" && service.hasLegacyContact && (
          <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Legacy Contact (Optional)
            </label>
            <select
              className="input w-full"
              value={formData.legacyContact || ""}
              onChange={(e) => updateFormData("legacyContact", e.target.value)}
            >
              <option value="">Select legacy contact...</option>
              {executorBeneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              This person can manage memorial settings on {service.name}
            </p>
          </div>
        )}

        {/* Additional Instructions */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Additional Instructions (Optional)
          </label>
          <textarea
            className="input w-full"
            rows={3}
            placeholder="Any special instructions for your executors..."
            value={formData.additionalInstructions || ""}
            onChange={(e) => updateFormData("additionalInstructions", e.target.value)}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSave}>
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
