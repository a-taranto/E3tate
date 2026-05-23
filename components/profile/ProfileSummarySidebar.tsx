"use client";

import { Card, Button } from "@/components/ui";
import {
  User,
  Wallet,
  Gem,
  FileText,
  ScrollText,
  Key,
  Edit,
  Check,
  Lock,
  Home,
  Car,
  Coins,
  Building2,
  Briefcase,
  Shield,
  Globe,
  IdCard,
} from "lucide-react";
import { COLORS } from "@/lib/constants";
import type { RecordType } from "@/types";

// Current data structure interfaces (matching existing profile page)
interface Asset {
  id: string;
  type: "home" | "crypto" | "car" | "cash";
  name: string;
  description?: string;
  value?: string;
  details: { [key: string]: string };
}

interface Account {
  id: string;
  type: "bank" | "super" | "insurance" | "digital";
  accountType?: string;
  name: string;
  accountNumber?: string;
  institution?: string;
  details: { [key: string]: string };
  vaultRecordId?: string;
  hasVaultCredentials?: boolean;
}

interface Identity {
  id: string;
  type: "ssn" | "license" | "medicare" | "passport";
  number: string;
  issueDate?: string;
  expiryDate?: string;
}

// Group structure for Vault types
interface VaultGroup {
  type: RecordType;
  icon: any;
  color: string;
  bgColor: string;
  items: Array<{
    id: string;
    name: string;
    subtitle?: string;
    icon: any;
    hasVaultCredentials?: boolean;
    onEdit: () => void;
  }>;
}

interface ProfileSummarySidebarProps {
  assets: Asset[];
  accounts: Account[];
  identities: Identity[];
  uploadedDocuments: string[];
  personalInfo: any;
  onEditAsset: (id: string) => void;
  onEditAccount: (id: string) => void;
  onEditIdentity: (id: string) => void;
  onCompleteSetup: () => void;
}

export function ProfileSummarySidebar({
  assets,
  accounts,
  identities,
  uploadedDocuments,
  personalInfo,
  onEditAsset,
  onEditAccount,
  onEditIdentity,
  onCompleteSetup,
}: ProfileSummarySidebarProps) {
  // Calculate completion percentage
  const personalInfoCount = [
    personalInfo.fullName,
    personalInfo.dateOfBirth,
    personalInfo.email,
    personalInfo.address,
  ].filter(Boolean).length;
  const totalItems =
    assets.length +
    accounts.length +
    identities.length +
    uploadedDocuments.length +
    personalInfoCount;
  const completionPercentage = Math.min(
    100,
    Math.round((totalItems / 15) * 100)
  );

  const hasChanges = totalItems > 0;

  // Transform data into Vault type groups
  const vaultGroups: VaultGroup[] = [
    {
      type: "Identity",
      icon: User,
      color: COLORS.type.Identity.color,
      bgColor: COLORS.type.Identity.bg,
      items: identities.map((identity) => {
        const typeLabels: { [key: string]: string } = {
          ssn: "SSN",
          license: "Driver's License",
          medicare: "Medicare",
          passport: "Passport",
        };
        return {
          id: identity.id,
          name: typeLabels[identity.type],
          subtitle: `•••• ${identity.number.slice(-4)}`,
          icon: IdCard,
          onEdit: () => onEditIdentity(identity.id),
        };
      }),
    },
    {
      type: "Financial",
      icon: Wallet,
      color: COLORS.type.Financial.color,
      bgColor: COLORS.type.Financial.bg,
      items: accounts
        .filter((acc) => acc.type !== "digital") // Digital/Social goes to Credentials
        .map((account) => {
          const Icon =
            account.type === "bank"
              ? Building2
              : account.type === "super"
              ? Briefcase
              : account.type === "insurance"
              ? Shield
              : Wallet;
          return {
            id: account.id,
            name: account.name,
            subtitle: undefined,
            icon: Icon,
            hasVaultCredentials: account.hasVaultCredentials,
            onEdit: () => onEditAccount(account.id),
          };
        }),
    },
    {
      type: "Assets",
      icon: Gem,
      color: COLORS.type.Assets.color,
      bgColor: COLORS.type.Assets.bg,
      items: assets.map((asset) => {
        const Icon =
          asset.type === "home"
            ? Home
            : asset.type === "crypto"
            ? Coins
            : asset.type === "car"
            ? Car
            : Wallet;
        return {
          id: asset.id,
          name: asset.name,
          subtitle: asset.value ? `$${asset.value}` : undefined,
          icon: Icon,
          onEdit: () => onEditAsset(asset.id),
        };
      }),
    },
    {
      type: "Documents",
      icon: FileText,
      color: COLORS.type.Documents.color,
      bgColor: COLORS.type.Documents.bg,
      items: uploadedDocuments.map((docType) => ({
        id: docType,
        name: docType,
        subtitle: undefined,
        icon: FileText,
        onEdit: () => {}, // Documents don't have edit functionality currently
      })),
    },
    {
      type: "Instructions",
      icon: ScrollText,
      color: COLORS.type.Instructions.color,
      bgColor: COLORS.type.Instructions.bg,
      items: [], // Will be populated when wishes data is integrated
    },
    {
      type: "Credentials",
      icon: Key,
      color: COLORS.type.Credentials.color,
      bgColor: COLORS.type.Credentials.bg,
      items: accounts
        .filter((acc) => acc.type === "digital") // Digital/Social accounts
        .map((account) => ({
          id: account.id,
          name: account.name,
          subtitle: undefined,
          icon: Globe,
          hasVaultCredentials: account.hasVaultCredentials,
          onEdit: () => onEditAccount(account.id),
        })),
    },
  ];

  // Filter out empty groups
  const activeGroups = vaultGroups.filter((group) => group.items.length > 0);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Profile Summary
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--text-secondary)" }}>Completion</span>
            <span
              className="font-semibold"
              style={{
                color:
                  completionPercentage === 100
                    ? "var(--success)"
                    : "var(--accent)",
              }}
            >
              {completionPercentage}%
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full"
            style={{ backgroundColor: "var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionPercentage}%`,
                background:
                  completionPercentage === 100
                    ? "var(--success)"
                    : "var(--accent-gradient)",
              }}
            />
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {totalItems === 0
              ? "Start adding items to complete your profile"
              : completionPercentage === 100
              ? "Profile complete!"
              : `Add ${Math.ceil((15 - totalItems) * 0.7)} more items to reach 100%`}
          </p>
        </div>
      </div>

      {/* Items Summary - Grouped by Vault Type */}
      <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
        {totalItems === 0 ? (
          <div className="p-8 text-center">
            <div className="mb-3">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-dim)" }}
              >
                <FileText className="h-8 w-8" style={{ color: "var(--accent)" }} />
              </div>
            </div>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Your Profile is Empty
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Start adding your assets, accounts, and documents. They'll appear
              here as you add them.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {activeGroups.map((group) => (
              <div key={group.type} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <group.icon className="h-4 w-4" style={{ color: group.color }} />
                  <h4
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {group.type} ({group.items.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-2 rounded hover:bg-surface transition-colors cursor-pointer"
                      style={{ backgroundColor: "var(--bg-card)" }}
                      onClick={item.onEdit}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <item.icon
                          className="h-3.5 w-3.5 flex-shrink-0"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.name}
                          </p>
                          {item.subtitle && (
                            <p
                              className={`text-xs ${
                                item.subtitle.startsWith("$")
                                  ? ""
                                  : "font-mono"
                              }`}
                              style={{
                                color: item.subtitle.startsWith("$")
                                  ? "var(--success)"
                                  : "var(--text-muted)",
                              }}
                            >
                              {item.subtitle}
                            </p>
                          )}
                          {item.hasVaultCredentials && (
                            <div
                              className="flex items-center gap-1 text-xs"
                              style={{ color: "var(--success)" }}
                            >
                              <Lock className="h-3 w-3" />
                              <span>In Vault</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1 hover:bg-hover rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onEdit();
                          }}
                          title="Edit"
                        >
                          <Edit
                            className="h-3.5 w-3.5"
                            style={{ color: "var(--text-muted)" }}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Setup Button */}
      {hasChanges && (
        <div
          className="p-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <Button variant="primary" className="w-full" onClick={onCompleteSetup}>
            <Check className="h-4 w-4" />
            Save & Complete Setup
          </Button>
          <p
            className="text-xs text-center mt-2"
            style={{ color: "var(--text-muted)" }}
          >
            All changes are auto-saved
          </p>
        </div>
      )}
    </Card>
  );
}
