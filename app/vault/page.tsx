"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import {
  Card,
  Button,
  Badge,
  SlideOverPanel,
  MultiStepModal,
  EmptyState,
  AuditTimeline,
  FileUpload,
  MaskedInput,
  BeneficiarySelector,
  Input,
} from "@/components/ui";
import DocumentViewer from "@/components/ui/DocumentViewer";
import { VaultCard } from "@/components/vault/VaultCard";
import { documentTypes } from "@/lib/documentConfig";
import { loadVaultRecords, deleteVaultRecord, updateVaultRecord } from "@/lib/store";
import { toast } from "@/components/ui/Toaster";
import ComingSoon from "@/components/ui/ComingSoon";
import EstatePositionSummary from "@/components/dashboard/EstatePositionSummary";
import {
  FileText,
  Wallet,
  Key,
  Globe,
  Plus,
  Search,
  Shield,
  Users,
  Clock,
  Edit,
  Copy,
  Trash2,
  Eye,
  Check,
  Lock,
  Link,
  ExternalLink,
  ChevronDown,
  ScrollText,
} from "lucide-react";

// Simplified 4 categories per architecture
const recordTypeConfig = {
  documents: {
    label: "Documents",
    icon: FileText,
    badgeColor: "badge-documents",
    description: "Legal documents, insurance, property deeds",
    isPrimary: true,
  },
  wallets: {
    label: "Wallets",
    icon: Wallet,
    badgeColor: "badge-wallets",
    description: "Cryptocurrency wallets",
    isPrimary: true,
  },
  credentials: {
    label: "Credentials",
    icon: Key,
    badgeColor: "badge-credentials",
    description: "Bank accounts, investments, financial logins",
    isPrimary: true,
  },
  accounts: {
    label: "Accounts",
    icon: Globe,
    badgeColor: "badge-accounts",
    description: "Email, social media, cloud storage, AI tools",
    isPrimary: true,
  },

  // Legacy types (for backward compatibility with existing data)
  identity: { label: "Identity (Legacy)", icon: FileText, badgeColor: "badge-accounts", description: "", migratesTo: "accounts", isPrimary: false },
  financial: { label: "Financial (Legacy)", icon: Key, badgeColor: "badge-credentials", description: "", migratesTo: "credentials", isPrimary: false },
  instructions: { label: "Instructions (Legacy)", icon: FileText, badgeColor: "badge-documents", description: "", migratesTo: "documents", isPrimary: false },
  assets: { label: "Assets (Legacy)", icon: FileText, badgeColor: "badge-documents", description: "", migratesTo: "documents", isPrimary: false },
};

type RecordType = keyof typeof recordTypeConfig;

// Primary categories for UI display (excludes legacy)
const primaryCategories = Object.entries(recordTypeConfig).filter(
  ([_, config]) => config.isPrimary
) as [RecordType, typeof recordTypeConfig[RecordType]][];

interface VaultRecord {
  id: string;
  title: string;
  type: RecordType;
  description?: string;
  beneficiaries: string[];
  lastModified: string;
  createdAt: string;
  scope?: string;
  encrypted: boolean;
  source?: "profile" | "vault" | "setup";
  fileType?: string;
  fileSize?: string;
  profileLinked?: boolean; // Indicates this record is from Profile page
  metadata?: Record<string, any>; // carries uploaded-file blobs: metadata.file
}

// Mock beneficiaries data
const mockBeneficiaries = [
  { id: "1", name: "Sarah Johnson", email: "sarah.j@example.com", role: "executor" as const },
  { id: "2", name: "Michael Kim", email: "michael.k@example.com", role: "executor" as const },
  { id: "3", name: "Emma Lewis", email: "emma.lewis@example.com", role: "beneficiary" as const },
];

export default function VaultPage() {
  const router = useRouter();

  // State management
  const [selectedRecord, setSelectedRecord] = useState<VaultRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<RecordType | "all">("all");
  const [initialRecordType, setInitialRecordType] = useState<RecordType | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<VaultRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{ docType: string; fileName: string; fileData: string } | null>(null);

  // Load all vault records from the unified store (seeded + migrated on boot).
  useEffect(() => {
    const refresh = () => {
      setRecords(loadVaultRecords());
      setLoaded(true);
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    window.addEventListener("documentUploaded", refresh);
    return () => {
      window.removeEventListener("store-updated", refresh);
      window.removeEventListener("documentUploaded", refresh);
    };
  }, []);

  // Handle viewing a document (reads the file blob the store keeps on the record)
  const handleViewDocument = (recordId: string) => {
    const rec = records.find((r) => r.id === recordId);
    const fileData = rec?.metadata?.file;
    if (fileData) {
      setViewingDocument({
        docType: recordId.replace("uploaded-", ""),
        fileName: fileData.name,
        fileData: fileData.data,
      });
    }
  };

  // Handle saving edited document back to the store
  const handleSaveDocument = (newContent: string) => {
    if (!viewingDocument) return;
    const recordId = `uploaded-${viewingDocument.docType}`;
    const rec = records.find((r) => r.id === recordId);
    if (rec?.metadata?.file) {
      const updated = updateVaultRecord(recordId, {
        metadata: { ...rec.metadata, file: { ...rec.metadata.file, data: newContent } },
      });
      setRecords(updated);
    }
    setViewingDocument(null);
  };

  // Handle deleting a record (single store, so every record is deletable here)
  const handleDeleteRecord = (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      return;
    }
    setRecords(deleteVaultRecord(recordId));
    toast("Record deleted", "info");
    if (selectedRecord?.id === recordId) {
      setIsDetailOpen(false);
      setSelectedRecord(null);
    }
  };

  // Profile/asset/credential records now live in the unified store; their
  // legacy keys are absorbed by the boot migration (see lib/store.ts).

  // Seed/mock records now come from the unified store (lib/store.ts).

  const allRecords: VaultRecord[] = records;

  // Filter records
  const filteredRecords = allRecords.filter((record) => {
    const matchesType = selectedType === "all" || record.type === selectedType;
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Get count for each type
  const getTypeCount = (type: RecordType) =>
    allRecords.filter((r) => r.type === type).length;

  // Handle view record
  const handleViewRecord = (record: VaultRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  // Transform VaultRecord to VaultCard format
  const transformRecordForCard = (record: VaultRecord) => {
    // Generate tags from record properties
    const tags: string[] = [];

    // Add type label as tag (remove Legacy suffix)
    const typeLabel = recordTypeConfig[record.type]?.label?.replace(' (Legacy)', '');
    if (typeLabel && !typeLabel.includes('Legacy')) tags.push(typeLabel);

    // Add scope as tag
    if (record.scope === "executor") tags.push("Executor Only");
    else if (record.scope === "full") tags.push("All Beneficiaries");

    // Add file type if present (map to friendly names)
    if (record.fileType) {
      const fileTypeUpper = record.fileType.toUpperCase();
      if (fileTypeUpper === 'PDF') tags.push('PDF');
      else if (fileTypeUpper.includes('WORD')) tags.push('Word');
      else if (fileTypeUpper.includes('EXCEL') || fileTypeUpper.includes('SPREADSHEET')) tags.push('Excel');
      else if (fileTypeUpper.includes('POWERPOINT') || fileTypeUpper.includes('PRESENTATION')) tags.push('PowerPoint');
      else if (fileTypeUpper.includes('IMAGE')) tags.push('Image');
      else if (!fileTypeUpper.includes('VND.') && !fileTypeUpper.includes('APPLICATION/') && fileTypeUpper.length < 10) {
        tags.push(record.fileType);
      }
    }

    // Add encrypted badge
    if (record.encrypted) tags.push("Encrypted");

    // Add provenance badge
    if (record.profileLinked) tags.push("From Profile");
    else if (record.source === "setup") tags.push("From Setup");

    // Format date
    const formatDate = (dateStr: string) => {
      if (dateStr.includes("ago") || dateStr === "Recently" || dateStr === "From Profile") {
        return dateStr;
      }
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    // Clean up record type for display (strip legacy, map to primary types)
    let displayType: 'documents' | 'wallets' | 'credentials' | 'accounts' | 'financial' | 'assets' | 'identity' | 'instructions' = record.type as any;

    return {
      id: record.id,
      title: record.title,
      subtitle: record.description,
      type: displayType,
      tags: tags,
      date: formatDate(record.lastModified),
      beneficiaryCount: record.beneficiaries.length,
    };
  };

  // Mock audit events for selected record
  const mockAuditEvents = [
    {
      id: "1",
      action: "Record Created",
      description: "Initial record created and encrypted",
      timestamp: selectedRecord?.createdAt || "2024-01-01",
      actor: "You",
      icon: Plus,
    },
    {
      id: "2",
      action: "Beneficiaries Updated",
      description: "Added 2 beneficiaries with full access",
      timestamp: "2024-02-15",
      actor: "You",
      icon: Users,
    },
    {
      id: "3",
      action: "Record Modified",
      description: "Updated record details",
      timestamp: selectedRecord?.lastModified || "Today",
      actor: "You",
      icon: Edit,
    },
  ];

  // Modal steps for adding a record
  const addRecordSteps = [
    {
      title: "Basic Info",
      content: (
        <div className="space-y-4">
          <Input label="Record Title" placeholder="e.g., Primary Bank Account" />
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Record Type
            </label>
            <select className="input" defaultValue={initialRecordType}>
              <option value="">Select a type...</option>
              {primaryCategories.map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            {initialRecordType && (
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Pre-filled based on your current filter
              </p>
            )}
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              {initialRecordType && recordTypeConfig[initialRecordType as RecordType]?.description}
            </p>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Description (Optional)
            </label>
            <textarea
              className="input"
              rows={4}
              placeholder="Add any additional context or notes..."
            />
          </div>
        </div>
      ),
    },
    {
      title: "Content",
      content: (
        <div className="space-y-4">
          <p style={{ color: "var(--text-secondary)" }}>
            Upload documents or enter credential information:
          </p>
          <FileUpload onFilesSelected={(files) => console.log(files)} />
          <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              Or enter credentials manually:
            </p>
            <div className="space-y-3">
              <Input label="Username/Account" placeholder="Enter username" />
              <MaskedInput label="Password/PIN" placeholder="Enter password" />
              <Input label="URL/Location" placeholder="https://..." />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Beneficiaries",
      content: (
        <div className="space-y-4">
          <p style={{ color: "var(--text-secondary)" }}>
            Select who will receive this record and their access level:
          </p>
          <BeneficiarySelector
            beneficiaries={mockBeneficiaries}
            selected={[]}
            onChange={(selected) => console.log(selected)}
          />
        </div>
      ),
    },
    {
      title: "Review",
      content: (
        <div className="space-y-4">
          <div
            className="p-4 rounded-lg border"
            style={{ backgroundColor: "var(--accent-dim)", borderColor: "var(--accent)" }}
          >
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
              <div>
                <h4 className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Ready to Encrypt
                </h4>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Your record will be encrypted with zero-knowledge encryption before being
                  stored. Only designated beneficiaries will be able to decrypt and access this
                  information upon trigger execution.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium" style={{ color: "var(--text-primary)" }}>
              Summary
            </h4>
            <div className="text-sm space-y-2" style={{ color: "var(--text-secondary)" }}>
              <div className="flex justify-between">
                <span>Record Type:</span>
                <span style={{ color: "var(--text-primary)" }}>Documents</span>
              </div>
              <div className="flex justify-between">
                <span>Beneficiaries:</span>
                <span style={{ color: "var(--text-primary)" }}>3 selected</span>
              </div>
              <div className="flex justify-between">
                <span>Encryption:</span>
                <span style={{ color: "var(--success)" }}>Zero-knowledge</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Handler for opening Add Record modal with context
  const handleOpenAddRecord = () => {
    if (selectedType !== "all") {
      setInitialRecordType(selectedType as RecordType);
    } else {
      setInitialRecordType("");
    }
    setIsAddModalOpen(true);
  };

  // Get context-specific button text
  const getAddButtonText = () => {
    if (selectedType === "all") return "Add";
    const config = recordTypeConfig[selectedType as RecordType];
    return `Add ${config?.label || "Record"}`;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        title="Vault"
        subtitle="Manage your encrypted digital estate records"
        action={
          <div className="relative">
            <Button
              variant="primary"
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {getAddButtonText()}
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showAddDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAddDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-20">
                  <button
                    onClick={() => {
                      setShowAddDropdown(false);
                      handleOpenAddRecord();
                    }}
                    className="w-full px-4 py-2.5 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-stone-400" />
                    <div>
                      <div className="font-medium">Add Record</div>
                      <div className="text-xs text-stone-500">Upload document or add credential</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddDropdown(false);
                      router.push('/will/create');
                    }}
                    className="w-full px-4 py-2.5 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                  >
                    <ScrollText className="h-4 w-4 text-violet-500" />
                    <div>
                      <div className="font-medium">Create Will</div>
                      <div className="text-xs text-stone-500">Build your Last Will & Testament</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        }
      />

      {/* Shared net-position summary — the financial overview, now in the Vault too */}
      <EstatePositionSummary className="mb-6" />

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400"
          />
          <input
            type="text"
            placeholder="Search records..."
            className="w-full md:w-80 px-4 py-2.5 pl-10 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Record Type Tabs - Only show 4 primary categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={selectedType === "all" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setSelectedType("all")}
          className={selectedType !== "all" ? "bg-white border-stone-200 text-stone-600 hover:bg-stone-50" : ""}
        >
          All ({allRecords.length})
        </Button>
        {primaryCategories.map(([key, config]) => (
          <Button
            key={key}
            variant={selectedType === key ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedType(key as RecordType)}
            className={selectedType !== key ? "bg-white border-stone-200 text-stone-600 hover:bg-stone-50" : ""}
          >
            <config.icon className="h-4 w-4" />
            {config.label} ({getTypeCount(key as RecordType)})
          </Button>
        ))}
      </div>

      {/* Records Grid */}
      {!loaded ? (
        <div className="text-center py-16">
          <p className="text-stone-500 text-sm">Loading…</p>
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecords.map((record) => (
            <VaultCard
              key={record.id}
              record={transformRecordForCard(record)}
              onClick={() => handleViewRecord(record)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-stone-900 font-medium">
            {searchQuery
              ? "No records found"
              : selectedType === "all"
                ? "No records yet"
                : `No ${recordTypeConfig[selectedType as RecordType].label} yet`}
          </h3>
          <p className="text-stone-500 text-sm mt-1">
            {searchQuery
              ? `No records match "${searchQuery}". Try a different search term.`
              : "Add a record to securely store important information."}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Your First Record
            </Button>
          )}
        </div>
      )}

      {/* Record Detail Slide-Over Panel */}
      <SlideOverPanel
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedRecord?.title || "Record Details"}
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Header with badge */}
            <div className="flex items-center gap-3">
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: `var(--${recordTypeConfig[selectedRecord.type].badgeColor})20`,
                  color: `var(--${recordTypeConfig[selectedRecord.type].badgeColor})`,
                }}
              >
                {recordTypeConfig[selectedRecord.type].label}
              </Badge>
              {selectedRecord.encrypted && (
                <div className="flex items-center gap-1 text-sm" style={{ color: "var(--success)" }}>
                  <Shield className="h-4 w-4" />
                  End-to-end encrypted
                </div>
              )}
            </div>

            {/* Profile Link Notice */}
            {selectedRecord.profileLinked && (
              <div
                className="p-4 rounded-lg border"
                style={{ backgroundColor: "var(--info-bg)", borderColor: "var(--info)" }}
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 flex-shrink-0" style={{ color: "var(--info)" }} />
                  <div>
                    <h4 className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                      Linked to Profile Page
                    </h4>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      This record displays information from your Profile page. To view or edit the content,
                      use the buttons below to navigate to your Profile settings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Overview Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Overview
              </h3>
              <div className="space-y-3 text-sm">
                {selectedRecord.description && (
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Description</p>
                    <p style={{ color: "var(--text-primary)" }}>{selectedRecord.description}</p>
                  </div>
                )}
                <div>
                  <p style={{ color: "var(--text-muted)" }}>Created</p>
                  <p style={{ color: "var(--text-primary)" }}>{selectedRecord.createdAt}</p>
                </div>
                <div>
                  <p style={{ color: "var(--text-muted)" }}>Last Modified</p>
                  <p style={{ color: "var(--text-primary)" }}>{selectedRecord.lastModified}</p>
                </div>
                {selectedRecord.profileLinked && (
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Source</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: "var(--info-bg)", color: "var(--info)" }}
                      >
                        <FileText className="h-3 w-3" />
                        Profile Page
                      </div>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Managed in your Profile settings
                      </span>
                    </div>
                  </div>
                )}
                {selectedRecord.fileType && (
                  <>
                    <div>
                      <p style={{ color: "var(--text-muted)" }}>File Type</p>
                      <p style={{ color: "var(--text-primary)" }}>{selectedRecord.fileType}</p>
                    </div>
                    <div>
                      <p style={{ color: "var(--text-muted)" }}>File Size</p>
                      <p style={{ color: "var(--text-primary)" }}>{selectedRecord.fileSize}</p>
                    </div>
                  </>
                )}
                {selectedRecord.id.startsWith("uploaded-") && (() => {
                  const docType = selectedRecord.id.replace("uploaded-", "");
                  const docConfig = documentTypes[docType];
                  if (docConfig) {
                    return (
                      <div>
                        <p style={{ color: "var(--text-muted)" }}>Document Permissions</p>
                        {docConfig.editable ? (
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                              style={{ backgroundColor: "var(--success-bg)", color: "var(--success)" }}
                            >
                              <Check className="h-3 w-3" />
                              Editable
                            </div>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              Can be viewed and edited with version control
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                              style={{ backgroundColor: "var(--warning-bg)", color: "var(--warning)" }}
                            >
                              <Lock className="h-3 w-3" />
                              View Only
                            </div>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {docConfig.requiresPasswordToView ? "Requires password, cannot be edited" : "View only, cannot be edited"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Beneficiary Access Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Beneficiary Access
              </h3>
              <div className="space-y-2">
                {selectedRecord.beneficiaries.map((beneficiary, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{ backgroundColor: "var(--accent)", color: "var(--bg-primary)" }}
                      >
                        {beneficiary[0]}
                      </div>
                      <span style={{ color: "var(--text-primary)" }}>{beneficiary}</span>
                    </div>
                    <Badge variant="success">Full Access</Badge>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" className="mt-3" disabled>
                <Plus className="h-4 w-4" />
                Add Beneficiary
                <ComingSoon />
              </Button>
            </div>

            {/* Disclosure Rules */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Disclosure Rules
              </h3>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Trigger Type:</span>
                    <span style={{ color: "var(--text-primary)" }}>After cooling-off</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Cooling-off Period:</span>
                    <span style={{ color: "var(--text-primary)" }}>14 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Executor Approval:</span>
                    <span style={{ color: "var(--success)" }}>Required</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit History */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Audit History
              </h3>
              <AuditTimeline events={mockAuditEvents} />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              {selectedRecord.profileLinked ? (
                <>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      router.push("/profile");
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    View in Profile
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      router.push("/profile");
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    Edit in Profile
                  </Button>
                </>
              ) : selectedRecord.id.startsWith("uploaded-") ? (
                <>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      handleViewDocument(selectedRecord.id);
                      setIsDetailOpen(false);
                    }}
                  >
                    {(() => {
                      const docType = selectedRecord.id.replace("uploaded-", "");
                      const docConfig = documentTypes[docType];
                      if (docConfig?.editable) {
                        return (
                          <>
                            <Edit className="h-4 w-4" />
                            Edit Document
                          </>
                        );
                      }
                      return (
                        <>
                          <Eye className="h-4 w-4" />
                          View Document
                        </>
                      );
                    })()}
                  </Button>
                  <Button
                    variant="ghost"
                    style={{ color: "var(--error)" }}
                    onClick={() => handleDeleteRecord(selectedRecord.id)}
                    aria-label="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" className="flex-1" disabled>
                    <Edit className="h-4 w-4" />
                    Edit Record
                    <ComingSoon />
                  </Button>
                  <Button
                    variant="secondary"
                    title="Copy record details"
                    aria-label="Copy record details"
                    onClick={() =>
                      navigator.clipboard?.writeText(
                        `${selectedRecord.title}${selectedRecord.description ? ` — ${selectedRecord.description}` : ""}`
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    style={{ color: "var(--error)" }}
                    onClick={() => handleDeleteRecord(selectedRecord.id)}
                    aria-label="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </SlideOverPanel>

      {/* Add Record Modal */}
      <MultiStepModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Record"
        steps={addRecordSteps}
        onComplete={() => {
          console.log("Record added!");
        }}
      />

      {/* Document Viewer/Editor Modal */}
      {viewingDocument && (
        <DocumentViewer
          docType={viewingDocument.docType}
          fileName={viewingDocument.fileName}
          fileData={viewingDocument.fileData}
          onClose={() => setViewingDocument(null)}
          onSave={handleSaveDocument}
        />
      )}
    </div>
  );
}
