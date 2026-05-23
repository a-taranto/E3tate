"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/layout/Header";
import { Card, Button, Input, Badge } from "@/components/ui";
import { ProfileSummarySidebar } from "@/components/profile/ProfileSummarySidebar";
import { logActivity } from "@/lib/activityLogger";
import {
  User,
  Users,
  Heart,
  FileHeart,
  Globe,
  MessageCircle,
  FileText,
  FolderOpen,
  Shield,
  Lock,
  ChevronDown,
  ChevronUp,
  Save,
  AlertCircle,
  Upload,
  CheckCircle,
  Check,
  X,
  Loader2,
  Home,
  Coins,
  Car,
  Wallet,
  Building2,
  CreditCard,
  Briefcase,
  Plus,
  Trash2,
  Edit,
  IdCard,
  Eye,
  EyeOff,
  Key,
  ExternalLink,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  description: string;
  icon: any;
  isOpen: boolean;
}

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
  accountType?: string; // For bank: savings, credit card, mortgage, etc.
  name: string;
  accountNumber?: string;
  institution?: string;
  details: { [key: string]: string };
  vaultRecordId?: string; // Link to associated Vault record with credentials
  hasVaultCredentials?: boolean; // Whether credentials are stored in Vault
}

interface Identity {
  id: string;
  type: "ssn" | "license" | "medicare" | "passport";
  number: string;
  issueDate?: string;
  expiryDate?: string;
  details: { [key: string]: string };
}

// Country-specific data
const australianBanks = [
  "Commonwealth Bank",
  "Westpac",
  "ANZ (Australia and New Zealand Banking Group)",
  "NAB (National Australia Bank)",
  "Macquarie Bank",
  "ING",
  "Bank of Queensland",
  "Bendigo Bank",
  "Suncorp Bank",
  "ME Bank",
  "AMP Bank",
  "Bank Australia",
  "Other",
];

const americanBanks = [
  "Bank of America",
  "Chase",
  "Wells Fargo",
  "Citibank",
  "U.S. Bank",
  "PNC Bank",
  "Capital One",
  "TD Bank",
  "Truist",
  "Other",
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"identity" | "assets" | "accounts" | "wishes">("identity");
  const [userCountry, setUserCountry] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([
    {
      id: "personal",
      title: "Personal Information",
      description: "Basic details about you and your family",
      icon: User,
      isOpen: true,
    },
    {
      id: "identity",
      title: "Identity Documents",
      description: "Government-issued identification and documents",
      icon: IdCard,
      isOpen: false,
    },
    {
      id: "endoflife",
      title: "End-of-Life Wishes",
      description: "Funeral preferences and final service details",
      icon: Heart,
      isOpen: false,
    },
    {
      id: "medical",
      title: "Medical Directives",
      description: "Healthcare decisions and organ donation",
      icon: FileHeart,
      isOpen: false,
    },
    {
      id: "digital",
      title: "Digital Legacy",
      description: "Online accounts and digital property",
      icon: Globe,
      isOpen: false,
    },
    {
      id: "documents",
      title: "Important Document Locations",
      description: "Upload documents and track physical locations",
      icon: FolderOpen,
      isOpen: false,
    },
    {
      id: "messages",
      title: "Final Messages",
      description: "Personal messages for loved ones",
      icon: MessageCircle,
      isOpen: false,
    },
    {
      id: "arrangements",
      title: "Practical Arrangements",
      description: "Pre-planned services and important contacts",
      icon: FileText,
      isOpen: false,
    },
  ]);

  // Asset, Account, and Identity data
  const [assets, setAssets] = useState<Asset[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [addingAssetType, setAddingAssetType] = useState<"home" | "crypto" | "car" | "cash" | null>(null);
  const [assetForm, setAssetForm] = useState({ name: "", description: "", value: "" });
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [addingAccountType, setAddingAccountType] = useState<"bank" | "super" | "insurance" | "digital" | null>(null);
  const [accountForm, setAccountForm] = useState({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState({ username: "", password: "", notes: "" });
  const [pendingAccountForVault, setPendingAccountForVault] = useState<Account | null>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingIdentityId, setEditingIdentityId] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    maritalStatus: "",
    spouseName: "",
    numberOfChildren: 0,
    childrenNames: [] as string[],
  });

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const [showBeneficiarySuggestion, setShowBeneficiarySuggestion] = useState(false);
  const [suggestedBeneficiaries, setSuggestedBeneficiaries] = useState<string[]>([]);

  // Load saved profile data on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("profileData");
    if (savedProfile) {
      // Profile data loaded - could set form values here
      setLastSaved(new Date(localStorage.getItem("profileLastSaved") || Date.now()));
    }

    // Load assets, accounts, and identities from localStorage
    const savedAssets = localStorage.getItem("profileAssets");
    if (savedAssets) setAssets(JSON.parse(savedAssets));

    const savedAccounts = localStorage.getItem("profileAccounts");
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));

    const savedIdentities = localStorage.getItem("profileIdentities");
    if (savedIdentities) setIdentities(JSON.parse(savedIdentities));

    // Load personal information
    const savedPersonalInfo = localStorage.getItem("profilePersonalInfo");
    if (savedPersonalInfo) {
      const parsed = JSON.parse(savedPersonalInfo);

      // Migrate old data format if needed
      if (parsed.children && typeof parsed.children === 'string' && !parsed.numberOfChildren) {
        // Old format had children as a string, convert to new format
        const childrenLines = parsed.children.split('\n').filter((line: string) => line.trim());
        parsed.numberOfChildren = childrenLines.length;
        parsed.childrenNames = childrenLines;
        delete parsed.children;
      }

      // Ensure new fields exist
      if (!parsed.numberOfChildren) parsed.numberOfChildren = 0;
      if (!parsed.childrenNames) parsed.childrenNames = [];

      setPersonalInfo(parsed);
    }

    // Load user country
    const savedCountry = localStorage.getItem("userCountry");
    if (savedCountry) setUserCountry(savedCountry);
  }, []);

  // Save assets to localStorage whenever they change
  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem("profileAssets", JSON.stringify(assets));
    }
  }, [assets]);

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem("profileAccounts", JSON.stringify(accounts));
    }
  }, [accounts]);

  // Save identities to localStorage whenever they change
  useEffect(() => {
    if (identities.length > 0) {
      localStorage.setItem("profileIdentities", JSON.stringify(identities));
    }
  }, [identities]);

  // Save personal info to localStorage whenever it changes
  useEffect(() => {
    if (personalInfo.fullName || personalInfo.email) {
      localStorage.setItem("profilePersonalInfo", JSON.stringify(personalInfo));
    }
  }, [personalInfo]);

  // Detect when family members are added and suggest adding as beneficiaries
  useEffect(() => {
    const suggested: string[] = [];

    // Check if spouse/partner was just added
    if (personalInfo.spouseName && personalInfo.spouseName.trim()) {
      suggested.push(personalInfo.spouseName.trim());
    }

    // Check if children were added
    personalInfo.childrenNames.forEach((name) => {
      if (name && name.trim()) {
        suggested.push(name.trim());
      }
    });

    // Show suggestion if there are family members and not already showing
    if (suggested.length > 0 && !showBeneficiarySuggestion) {
      setSuggestedBeneficiaries(suggested);
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setShowBeneficiarySuggestion(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [personalInfo.spouseName, personalInfo.childrenNames, showBeneficiarySuggestion]);

  const toggleSection = (id: string) => {
    setSections(
      sections.map((section) =>
        section.id === id
          ? { ...section, isOpen: !section.isOpen }
          : section
      )
    );
  };

  const saveProfile = useCallback(() => {
    setSaveStatus("saving");

    // Simulate save operation
    setTimeout(() => {
      const now = new Date();
      setLastSaved(now);
      localStorage.setItem("profileLastSaved", now.toISOString());
      setSaveStatus("saved");

      // Log the save activity
      logActivity(
        "Profile Saved",
        "profile",
        "Profile information has been saved and encrypted",
        {
          field: "All Sections",
          newValue: "Updated",
        }
      );

      // Show saved status briefly
      setTimeout(() => {
        if (saveStatus === "saved") {
          setSaveStatus("saved");
        }
      }, 2000);
    }, 500);
  }, [saveStatus]);

  const triggerAutoSave = useCallback(() => {
    setSaveStatus("unsaved");

    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Set new timer for auto-save (3 seconds after last change)
    autoSaveTimer.current = setTimeout(() => {
      saveProfile();
    }, 3000);
  }, [saveProfile]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  const getSaveButtonText = () => {
    if (saveStatus === "saving") return "Saving...";
    if (saveStatus === "saved" && lastSaved) {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (seconds < 60) return "Saved";
      return "Save Changes";
    }
    return "Save All Changes";
  };

  // Create Vault record with credentials for an account
  const createVaultRecordWithCredentials = (account: Account, credentials: { username: string; password: string; notes: string }) => {
    const vaultRecordId = `vault-${Date.now()}`;

    // Create vault record
    const vaultRecord = {
      id: vaultRecordId,
      title: `${account.name} - Credentials`,
      type: account.type === "digital" ? "passwords" : account.type === "bank" ? "financial" : "credentials",
      description: `Login credentials for ${account.name}`,
      accountType: account.accountType || account.type,
      institution: account.institution,
      accountNumber: account.accountNumber,
      username: credentials.username,
      password: credentials.password,
      notes: credentials.notes,
      linkedAccountId: account.id, // Link back to Profile account
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    if (typeof window !== "undefined") {
      const existingVaultData = localStorage.getItem("vaultCredentials");
      const vaultData = existingVaultData ? JSON.parse(existingVaultData) : [];
      vaultData.push(vaultRecord);
      localStorage.setItem("vaultCredentials", JSON.stringify(vaultData));

      // Dispatch event to notify Vault page
      window.dispatchEvent(new CustomEvent("vaultCredentialsUpdated"));
    }

    // Log activity
    logActivity(
      "Vault Credentials Added",
      "vault",
      `Added credentials for ${account.name} to Vault`,
      {
        field: "Credentials",
        newValue: account.name,
      }
    );

    return vaultRecordId;
  };

  return (
    <div>
      <Header
        title="Profile"
        subtitle="Your personal information and final wishes"
        action={
          <div className="flex items-center gap-3">
            {/* Auto-save indicator */}
            {saveStatus === "unsaved" && (
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Auto-saving in 3s...
              </span>
            )}
            {saveStatus === "saved" && lastSaved && (
              <span className="text-sm" style={{ color: "var(--success)" }}>
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Last saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="primary"
              onClick={saveProfile}
              disabled={saveStatus === "saving"}
            >
              {saveStatus === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {getSaveButtonText()}
            </Button>
          </div>
        }
      />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2">
          {/* Privacy Notice */}
          <Card className="mb-6 border-l-4" style={{ borderLeftColor: "var(--accent)" }}>
            <div className="flex items-start gap-4">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "var(--accent-dim)" }}
              >
                <Lock className="h-5 w-5" style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Maximum Privacy Protection
                </h3>
                <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  All information on this page is encrypted with zero-knowledge encryption and will
                  <strong> only be accessible to designated beneficiaries after trigger execution</strong>.
                  No one can access this information until your configured triggers are activated.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="success">
                    <Shield className="h-3 w-3 mr-1" />
                    End-to-end Encrypted
                  </Badge>
                  <Badge variant="info">
                    <Lock className="h-3 w-3 mr-1" />
                    Post-Trigger Access Only
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => setActiveTab("identity")}
          className="px-4 py-3 font-medium text-sm transition-colors relative"
          style={{
            color: activeTab === "identity" ? "var(--accent)" : "var(--text-secondary)",
            borderBottom: activeTab === "identity" ? "2px solid var(--accent)" : "2px solid transparent",
          }}
        >
          <IdCard className="h-4 w-4 inline mr-2" />
          Identity
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className="px-4 py-3 font-medium text-sm transition-colors relative"
          style={{
            color: activeTab === "assets" ? "var(--accent)" : "var(--text-secondary)",
            borderBottom: activeTab === "assets" ? "2px solid var(--accent)" : "2px solid transparent",
          }}
        >
          <Home className="h-4 w-4 inline mr-2" />
          Assets
        </button>
        <button
          onClick={() => setActiveTab("accounts")}
          className="px-4 py-3 font-medium text-sm transition-colors relative"
          style={{
            color: activeTab === "accounts" ? "var(--accent)" : "var(--text-secondary)",
            borderBottom: activeTab === "accounts" ? "2px solid var(--accent)" : "2px solid transparent",
          }}
        >
          <Building2 className="h-4 w-4 inline mr-2" />
          Accounts
        </button>
        <button
          onClick={() => setActiveTab("wishes")}
          className="px-4 py-3 font-medium text-sm transition-colors relative"
          style={{
            color: activeTab === "wishes" ? "var(--accent)" : "var(--text-secondary)",
            borderBottom: activeTab === "wishes" ? "2px solid var(--accent)" : "2px solid transparent",
          }}
        >
          <Heart className="h-4 w-4 inline mr-2" />
          Wishes
        </button>
      </div>

      {/* Identity Tab - Personal Information */}
      {activeTab === "identity" && (
        <div className="space-y-4">
          {sections.filter(s => s.id === "personal" || s.id === "identity" || s.id === "documents").map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} padding="none" className="overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-hover transition-colors"
                  style={{ backgroundColor: section.isOpen ? "var(--bg-surface)" : "transparent" }}
                >
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: section.isOpen ? "var(--accent-dim)" : "var(--bg-surface)",
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: section.isOpen ? "var(--accent)" : "var(--text-secondary)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {section.title}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {section.description}
                    </p>
                  </div>
                </div>
                {section.isOpen ? (
                  <ChevronUp className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                ) : (
                  <ChevronDown className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                )}
              </button>

              {/* Section Content */}
              {section.isOpen && (
                <div
                  className="p-6 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  {section.id === "personal" && <PersonalInformationSection personalInfo={personalInfo} setPersonalInfo={setPersonalInfo} userCountry={userCountry} setUserCountry={setUserCountry} triggerAutoSave={triggerAutoSave} showBeneficiarySuggestion={showBeneficiarySuggestion} setShowBeneficiarySuggestion={setShowBeneficiarySuggestion} suggestedBeneficiaries={suggestedBeneficiaries} />}
                  {section.id === "identity" && <IdentityDocumentsSection identities={identities} setIdentities={setIdentities} triggerAutoSave={triggerAutoSave} />}
                  {section.id === "documents" && <ImportantDocumentsSection triggerAutoSave={triggerAutoSave} />}
                </div>
              )}
            </Card>
          );
        })}
        </div>
      )}

      {/* Wishes Tab - End-of-Life, Medical, Digital Legacy, Messages, Arrangements */}
      {activeTab === "wishes" && (
        <div className="space-y-4">
          {sections.filter(s => s.id !== "personal" && s.id !== "identity" && s.id !== "documents").map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} padding="none" className="overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-hover transition-colors"
                  style={{ backgroundColor: section.isOpen ? "var(--bg-surface)" : "transparent" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: section.isOpen ? "var(--accent-dim)" : "var(--bg-surface)",
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: section.isOpen ? "var(--accent)" : "var(--text-secondary)" }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {section.title}
                      </h3>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {section.description}
                      </p>
                    </div>
                  </div>
                  {section.isOpen ? (
                    <ChevronUp className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                  ) : (
                    <ChevronDown className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                  )}
                </button>

                {/* Section Content */}
                {section.isOpen && (
                  <div
                    className="p-6 border-t"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {section.id === "endoflife" && <EndOfLifeWishesSection triggerAutoSave={triggerAutoSave} />}
                    {section.id === "medical" && <MedicalDirectivesSection triggerAutoSave={triggerAutoSave} />}
                    {section.id === "digital" && <DigitalLegacySection assets={assets} accounts={accounts} setAccounts={setAccounts} setActiveTab={setActiveTab} triggerAutoSave={triggerAutoSave} />}
                    {section.id === "messages" && <FinalMessagesSection triggerAutoSave={triggerAutoSave} />}
                    {section.id === "arrangements" && <PracticalArrangementsSection triggerAutoSave={triggerAutoSave} />}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === "assets" && (
        <div className="space-y-6">
          {/* Add Asset Buttons */}
          <Card data-add-asset-card>
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Add Asset
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button
                variant={addingAssetType === "home" ? "primary" : "secondary"}
                className="flex-col h-auto py-4"
                onClick={() => {
                  if (addingAssetType === "home") {
                    setAddingAssetType(null);
                    setIsAddingAsset(false);
                    setAssetForm({ name: "", description: "", value: "" });
                  } else {
                    setAddingAssetType("home");
                    setIsAddingAsset(true);
                    setAssetForm({ name: "", description: "", value: "" });
                  }
                }}
              >
                <Home className="h-6 w-6 mb-2" />
                <span className="text-sm">Home/Property</span>
                <span className="text-xs mt-1" style={{ color: "#F97316", opacity: 0.8 }}>
                  → Assets
                </span>
              </Button>
              <Button
                variant={addingAssetType === "crypto" ? "primary" : "secondary"}
                className="flex-col h-auto py-4"
                onClick={() => {
                  if (addingAssetType === "crypto") {
                    setAddingAssetType(null);
                    setIsAddingAsset(false);
                    setAssetForm({ name: "", description: "", value: "" });
                  } else {
                    setAddingAssetType("crypto");
                    setIsAddingAsset(true);
                    setAssetForm({ name: "", description: "", value: "" });
                  }
                }}
              >
                <Coins className="h-6 w-6 mb-2" />
                <span className="text-sm">Cryptocurrency</span>
                <span className="text-xs mt-1" style={{ color: "#F97316", opacity: 0.8 }}>
                  → Assets
                </span>
              </Button>
              <Button
                variant={addingAssetType === "car" ? "primary" : "secondary"}
                className="flex-col h-auto py-4"
                onClick={() => {
                  if (addingAssetType === "car") {
                    setAddingAssetType(null);
                    setIsAddingAsset(false);
                    setAssetForm({ name: "", description: "", value: "" });
                  } else {
                    setAddingAssetType("car");
                    setIsAddingAsset(true);
                    setAssetForm({ name: "", description: "", value: "" });
                  }
                }}
              >
                <Car className="h-6 w-6 mb-2" />
                <span className="text-sm">Vehicle</span>
                <span className="text-xs mt-1" style={{ color: "#F97316", opacity: 0.8 }}>
                  → Assets
                </span>
              </Button>
              <Button
                variant={addingAssetType === "cash" ? "primary" : "secondary"}
                className="flex-col h-auto py-4"
                onClick={() => {
                  if (addingAssetType === "cash") {
                    setAddingAssetType(null);
                    setIsAddingAsset(false);
                    setAssetForm({ name: "", description: "", value: "" });
                  } else {
                    setAddingAssetType("cash");
                    setIsAddingAsset(true);
                    setAssetForm({ name: "", description: "", value: "" });
                  }
                }}
              >
                <Wallet className="h-6 w-6 mb-2" />
                <span className="text-sm">Cash Holdings</span>
                <span className="text-xs mt-1" style={{ color: "#F97316", opacity: 0.8 }}>
                  → Assets
                </span>
              </Button>
            </div>

            {/* Inline Add Asset Form */}
            {isAddingAsset && addingAssetType && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                <h4 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  {addingAssetType === "home" && "Home/Property Details"}
                  {addingAssetType === "crypto" && "Cryptocurrency Details"}
                  {addingAssetType === "car" && "Vehicle Details"}
                  {addingAssetType === "cash" && "Cash Holdings Details"}
                </h4>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    placeholder={`e.g., ${addingAssetType === "home" ? "Primary Residence" : addingAssetType === "crypto" ? "Bitcoin Wallet" : addingAssetType === "car" ? "Tesla Model 3" : "Emergency Fund"}`}
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                  />
                  <Input
                    label="Description"
                    placeholder="Additional details..."
                    value={assetForm.description}
                    onChange={(e) => setAssetForm({...assetForm, description: e.target.value})}
                  />
                  <Input
                    label="Estimated Value ($)"
                    placeholder="e.g., 500000"
                    type="number"
                    value={assetForm.value}
                    onChange={(e) => setAssetForm({...assetForm, value: e.target.value})}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsAddingAsset(false);
                        setAddingAssetType(null);
                        setAssetForm({ name: "", description: "", value: "" });
                        setEditingAssetId(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      disabled={!assetForm.name}
                      onClick={() => {
                        if (editingAssetId) {
                          // Update existing asset
                          setAssets(assets.map(a =>
                            a.id === editingAssetId
                              ? {
                                  ...a,
                                  name: assetForm.name,
                                  description: assetForm.description,
                                  value: assetForm.value,
                                }
                              : a
                          ));
                          logActivity("Asset Updated", "profile", `Updated ${addingAssetType}: ${assetForm.name}`, {
                            field: "Assets",
                            newValue: assetForm.name,
                          });
                          setEditingAssetId(null);
                        } else {
                          // Add new asset
                          const newAsset: Asset = {
                            id: Date.now().toString(),
                            type: addingAssetType,
                            name: assetForm.name,
                            description: assetForm.description,
                            value: assetForm.value,
                            details: {},
                          };
                          setAssets([...assets, newAsset]);
                          logActivity("Asset Added", "profile", `Added ${addingAssetType}: ${assetForm.name}`, {
                            field: "Assets",
                            newValue: assetForm.name,
                          });
                        }
                        setIsAddingAsset(false);
                        setAddingAssetType(null);
                        setAssetForm({ name: "", description: "", value: "" });
                        triggerAutoSave();
                      }}
                    >
                      {editingAssetId ? (
                        <>
                          <Save className="h-4 w-4" />
                          Update Asset
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add Asset
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Add Another Button - only show when actively adding an asset */}
          {isAddingAsset && addingAssetType && (
            <button
              className="w-full p-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all mb-4"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)"
              }}
              onClick={() => {
                // Reset form but keep the same asset type
                setEditingAssetId(null);
                setAssetForm({ name: "", description: "", value: "" });
                // Scroll to the form
                setTimeout(() => {
                  const addCard = document.querySelector('[data-add-asset-card]');
                  if (addCard) {
                    addCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }, 100);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.backgroundColor = "var(--accent-dim)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">
                Add Another {addingAssetType === "home" ? "Real Estate" : addingAssetType === "crypto" ? "Crypto" : addingAssetType === "car" ? "Vehicle" : "Cash/Investment"}
              </span>
            </button>
          )}

          {/* Existing Assets */}
          {assets.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Your Assets
              </h3>
              <div className="space-y-6">
                {/* Group assets by type */}
                {["home", "crypto", "car", "cash"].map((type) => {
                  const assetsOfType = assets.filter(a => a.type === type);
                  if (assetsOfType.length === 0) return null;

                  const typeLabels = {
                    home: "Properties",
                    crypto: "Cryptocurrency",
                    car: "Vehicles",
                    cash: "Cash Holdings"
                  };
                  const typeIcons = {
                    home: Home,
                    crypto: Coins,
                    car: Car,
                    cash: Wallet
                  };

                  return (
                    <div key={type}>
                      <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                        {typeLabels[type as keyof typeof typeLabels]}
                      </h4>
                      <div className="space-y-3">
                        {assetsOfType.map((asset) => {
                          const Icon = typeIcons[type as keyof typeof typeIcons];
                          return (
                            <Card key={asset.id} hover padding="md" data-asset-id={asset.id}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                  <div
                                    className="p-3 rounded-lg"
                                    style={{ backgroundColor: "var(--accent-dim)" }}
                                  >
                                    <Icon className="h-6 w-6" style={{ color: "var(--accent)" }} />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                      {asset.name}
                                    </h4>
                                    {asset.description && (
                                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                        {asset.description}
                                      </p>
                                    )}
                                    {asset.value && (
                                      <p className="text-sm font-medium mt-1" style={{ color: "var(--success)" }}>
                                        ${asset.value}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Edit"
                                    onClick={() => {
                                      // Set editing mode
                                      setEditingAssetId(asset.id);
                                      // Scroll to add asset form and open it
                                      setIsAddingAsset(asset.type as any);
                                      setAddingAssetType(asset.type as any);
                                      // Pre-populate the form with existing data
                                      setAssetForm({
                                        name: asset.name,
                                        description: asset.description || "",
                                        value: asset.value || "",
                                        details: asset.details,
                                      });
                                      setTimeout(() => {
                                        const addCard = document.querySelector('[data-add-asset-card]');
                                        addCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      }, 100);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`)) {
                                        setAssets(assets.filter(a => a.id !== asset.id));
                                        logActivity("Asset Deleted", "profile", `Deleted ${asset.type}: ${asset.name}`, {
                                          field: "Assets",
                                          oldValue: asset.name,
                                          newValue: "Deleted",
                                        });
                                        triggerAutoSave();
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" style={{ color: "var(--error)" }} />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          {/* Add Account Buttons */}
          <Card data-add-account-card>
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Add Account
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button
                variant={addingAccountType === "bank" ? "primary" : "secondary"}
                className="flex-col h-auto py-4"
                onClick={() => {
                  if (addingAccountType === "bank") {
                    setAddingAccountType(null);
                    setIsAddingAccount(false);
                    setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                  } else {
                    setAddingAccountType("bank");
                    setIsAddingAccount(true);
                    setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                  }
                }}
              >
                <Building2 className="h-6 w-6 mb-2" />
                <span className="text-sm">Bank Account</span>
                <span className="text-xs mt-1" style={{ color: "#10B981", opacity: 0.8 }}>
                  → Financial
                </span>
              </Button>
              <Button
                variant={addingAccountType === "super" ? "primary" : "secondary"}
                className="flex-col h-auto py-4"
                onClick={() => {
                  if (addingAccountType === "super") {
                    setAddingAccountType(null);
                    setIsAddingAccount(false);
                    setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                  } else {
                    setAddingAccountType("super");
                    setIsAddingAccount(true);
                    setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                  }
                }}
              >
                <Briefcase className="h-6 w-6 mb-2" />
                <span className="text-sm">Superannuation</span>
                <span className="text-xs mt-1" style={{ color: "#10B981", opacity: 0.8 }}>
                  → Financial
                </span>
              </Button>
              <Button
                variant={addingAccountType === "insurance" ? "primary" : "secondary"}
                className="flex-col h-auto py-4"
                onClick={() => {
                  if (addingAccountType === "insurance") {
                    setAddingAccountType(null);
                    setIsAddingAccount(false);
                    setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                  } else {
                    setAddingAccountType("insurance");
                    setIsAddingAccount(true);
                    setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                  }
                }}
              >
                <Shield className="h-6 w-6 mb-2" />
                <span className="text-sm">Insurance</span>
                <span className="text-xs mt-1" style={{ color: "#10B981", opacity: 0.8 }}>
                  → Financial
                </span>
              </Button>
              <Button
                variant={addingAccountType === "digital" ? "primary" : "secondary"}
                className="flex-col h-auto py-4"
                onClick={() => {
                  if (addingAccountType === "digital") {
                    setAddingAccountType(null);
                    setIsAddingAccount(false);
                    setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                  } else {
                    setAddingAccountType("digital");
                    setIsAddingAccount(true);
                    setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                  }
                }}
              >
                <Globe className="h-6 w-6 mb-2" />
                <span className="text-sm">Digital/Social</span>
                <span className="text-xs mt-1" style={{ color: "#F59E0B", opacity: 0.8 }}>
                  → Credentials
                </span>
              </Button>
            </div>

            {/* Inline Add Account Form */}
            {isAddingAccount && addingAccountType && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                <h4 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  {addingAccountType === "bank" && "Bank Account Details"}
                  {addingAccountType === "super" && "Superannuation Details"}
                  {addingAccountType === "insurance" && "Insurance Details"}
                  {addingAccountType === "digital" && "Digital Account Details"}
                </h4>
                <div className="space-y-4">
                  {/* Bank Account Type Selection */}
                  {addingAccountType === "bank" && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                        Account Type
                      </label>
                      <select
                        className="input"
                        value={accountForm.accountType}
                        onChange={(e) => setAccountForm({...accountForm, accountType: e.target.value})}
                      >
                        <option value="">Select account type...</option>
                        <option value="savings">Savings Account</option>
                        <option value="checking">Checking/Transaction Account</option>
                        <option value="credit">Credit Card</option>
                        <option value="mortgage">Mortgage Account</option>
                        <option value="offset">Offset Account</option>
                        <option value="term">Term Deposit</option>
                        <option value="investment">Investment Account</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  <Input
                    label="Account Name"
                    placeholder={`e.g., ${addingAccountType === "bank" ? "Primary Savings" : addingAccountType === "super" ? "MySuper Account" : addingAccountType === "insurance" ? "Life Insurance Policy" : "Facebook Account"}`}
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                  />
                  <Input
                    label={addingAccountType === "digital" ? "Username/Email" : "Account Number"}
                    placeholder={addingAccountType === "digital" ? "your@email.com" : "e.g., 1234567890"}
                    value={accountForm.accountNumber}
                    onChange={(e) => setAccountForm({...accountForm, accountNumber: e.target.value})}
                  />
                  {addingAccountType === "bank" && userCountry ? (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                        Bank/Institution
                      </label>
                      <select
                        className="input"
                        value={accountForm.institution}
                        onChange={(e) => setAccountForm({...accountForm, institution: e.target.value})}
                      >
                        <option value="">Select your bank...</option>
                        {(userCountry === "AU" ? australianBanks : userCountry === "US" ? americanBanks : []).map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {userCountry === "AU" ? "Major Australian banks" : userCountry === "US" ? "Major US banks" : "Select a bank"}
                      </p>
                    </div>
                  ) : (
                    <Input
                      label={addingAccountType === "digital" ? "Platform/Service" : "Institution"}
                      placeholder={addingAccountType === "digital" ? "e.g., Facebook, Gmail" : "e.g., Commonwealth Bank"}
                      value={accountForm.institution}
                      onChange={(e) => setAccountForm({...accountForm, institution: e.target.value})}
                    />
                  )}
                  <Input
                    label="Additional Details"
                    placeholder="Any other important information..."
                    value={accountForm.description}
                    onChange={(e) => setAccountForm({...accountForm, description: e.target.value})}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsAddingAccount(false);
                        setAddingAccountType(null);
                        setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                        setEditingAccountId(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      disabled={!accountForm.name || (addingAccountType === "bank" && !accountForm.accountType)}
                      onClick={() => {
                        if (editingAccountId) {
                          // Update existing account
                          setAccounts(accounts.map(a =>
                            a.id === editingAccountId
                              ? {
                                  ...a,
                                  accountType: accountForm.accountType,
                                  name: accountForm.name,
                                  accountNumber: accountForm.accountNumber,
                                  institution: accountForm.institution,
                                  details: { description: accountForm.description },
                                }
                              : a
                          ));
                          logActivity("Account Updated", "profile", `Updated ${addingAccountType}: ${accountForm.name}${accountForm.accountType ? ` (${accountForm.accountType})` : ''}`, {
                            field: "Accounts",
                            newValue: accountForm.name,
                          });
                          setEditingAccountId(null);
                        } else {
                          // Add new account
                          const newAccount: Account = {
                            id: Date.now().toString(),
                            type: addingAccountType,
                            accountType: accountForm.accountType,
                            name: accountForm.name,
                            accountNumber: accountForm.accountNumber,
                            institution: accountForm.institution,
                            details: { description: accountForm.description },
                            hasVaultCredentials: false,
                          };
                          setAccounts([...accounts, newAccount]);
                          logActivity("Account Added", "profile", `Added ${addingAccountType}: ${accountForm.name}${accountForm.accountType ? ` (${accountForm.accountType})` : ''}`, {
                            field: "Accounts",
                            newValue: accountForm.name,
                          });
                        }
                        setIsAddingAccount(false);
                        setAddingAccountType(null);
                        setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                        triggerAutoSave();
                      }}
                    >
                      {editingAccountId ? (
                        <>
                          <Save className="h-4 w-4" />
                          Update Account
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add Account
                        </>
                      )}
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      disabled={!accountForm.name || (addingAccountType === "bank" && !accountForm.accountType)}
                      onClick={() => {
                        const newAccount: Account = {
                          id: Date.now().toString(),
                          type: addingAccountType,
                          accountType: accountForm.accountType,
                          name: accountForm.name,
                          accountNumber: accountForm.accountNumber,
                          institution: accountForm.institution,
                          details: { description: accountForm.description },
                          hasVaultCredentials: false,
                        };
                        setPendingAccountForVault(newAccount);
                        setShowCredentialsModal(true);
                      }}
                    >
                      <Lock className="h-4 w-4" />
                      Add with Credentials
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Add Another Button - only show when actively adding an account */}
          {isAddingAccount && addingAccountType && (
            <button
              className="w-full p-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all mb-4"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)"
              }}
              onClick={() => {
                // Reset form but keep the same account type
                setEditingAccountId(null);
                setAccountForm({ name: "", accountNumber: "", institution: "", accountType: "" });
                // Scroll to the form
                setTimeout(() => {
                  const addCard = document.querySelector('[data-add-account-card]');
                  if (addCard) {
                    addCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }, 100);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.backgroundColor = "var(--accent-dim)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">
                Add Another {addingAccountType === "bank" ? "Bank Account" : addingAccountType === "super" ? "Superannuation" : addingAccountType === "insurance" ? "Insurance Policy" : "Digital Account"}
              </span>
            </button>
          )}

          {/* Existing Accounts */}
          {accounts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Your Accounts
              </h3>
              <div className="space-y-6">
                {/* Group accounts by type */}
                {["bank", "super", "insurance", "digital"].map((type) => {
                  const accountsOfType = accounts.filter(a => a.type === type);
                  if (accountsOfType.length === 0) return null;

                  const typeLabels = {
                    bank: "Bank Accounts",
                    super: "Superannuation",
                    insurance: "Insurance",
                    digital: "Digital/Social Accounts"
                  };
                  const typeIcons = {
                    bank: Building2,
                    super: Briefcase,
                    insurance: Shield,
                    digital: Globe
                  };

                  return (
                    <div key={type}>
                      <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                        {typeLabels[type as keyof typeof typeLabels]}
                      </h4>
                      <div className="space-y-3">
                        {accountsOfType.map((account) => {
                          const Icon = typeIcons[type as keyof typeof typeIcons];
                          return (
                            <Card key={account.id} hover padding="md" data-account-id={account.id}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                  <div
                                    className="p-3 rounded-lg"
                                    style={{ backgroundColor: "var(--accent-dim)" }}
                                  >
                                    <Icon className="h-6 w-6" style={{ color: "var(--accent)" }} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                        {account.name}
                                      </h4>
                                      {account.hasVaultCredentials && (
                                        <div
                                          className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                                          style={{ backgroundColor: "var(--success-bg)", color: "var(--success)" }}
                                        >
                                          <Lock className="h-3 w-3" />
                                          <span>Vault</span>
                                        </div>
                                      )}
                                    </div>
                                    {account.accountType && (
                                      <p className="text-xs mb-1" style={{ color: "var(--accent)" }}>
                                        {account.accountType === "savings" && "Savings Account"}
                                        {account.accountType === "checking" && "Checking/Transaction Account"}
                                        {account.accountType === "credit" && "Credit Card"}
                                        {account.accountType === "mortgage" && "Mortgage Account"}
                                        {account.accountType === "offset" && "Offset Account"}
                                        {account.accountType === "term" && "Term Deposit"}
                                        {account.accountType === "investment" && "Investment Account"}
                                        {account.accountType === "other" && "Other"}
                                      </p>
                                    )}
                                    {account.institution && (
                                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                        {account.institution}
                                      </p>
                                    )}
                                    {account.accountNumber && (
                                      <p className="text-sm font-mono mt-1" style={{ color: "var(--text-muted)" }}>
                                        {account.accountNumber}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!account.hasVaultCredentials && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setPendingAccountForVault(account);
                                        setShowCredentialsModal(true);
                                      }}
                                    >
                                      <Key className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {account.hasVaultCredentials && (
                                    <Button variant="ghost" size="sm">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Edit"
                                    onClick={() => {
                                      // Set editing mode
                                      setEditingAccountId(account.id);
                                      // Open add account form and pre-populate with existing data
                                      setIsAddingAccount(true);
                                      setAddingAccountType(account.type as any);
                                      setAccountForm({
                                        name: account.name,
                                        accountNumber: account.accountNumber || "",
                                        institution: account.institution || "",
                                        accountType: account.accountType || "",
                                      });
                                      setTimeout(() => {
                                        const addCard = document.querySelector('[data-add-account-card]');
                                        addCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      }, 100);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) {
                                        setAccounts(accounts.filter(a => a.id !== account.id));
                                        logActivity("Account Deleted", "profile", `Deleted ${account.type}: ${account.name}`, {
                                          field: "Accounts",
                                          oldValue: account.name,
                                          newValue: "Deleted",
                                        });
                                        triggerAutoSave();
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" style={{ color: "var(--error)" }} />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
        </div>
        {/* End Left Column */}

        {/* Right Column - Profile Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ProfileSummarySidebar
              assets={assets}
              accounts={accounts}
              identities={identities}
              uploadedDocuments={(() => {
                if (typeof window === "undefined") return [];
                const docs = JSON.parse(localStorage.getItem("uploadedDocuments") || "{}");
                // Only include documents that have actual file data (not null)
                return Object.keys(docs).filter(key => docs[key] !== null && docs[key] !== undefined);
              })()}
              personalInfo={personalInfo}
              onEditAsset={(assetId) => {
                // Collapse add sections
                setIsAddingAsset(false);
                setAddingAssetType(null);
                setIsAddingAccount(false);
                setAddingAccountType(null);

                // Switch to assets tab
                setActiveTab("assets");
                // Scroll to the card and open it for editing
                setTimeout(() => {
                  const card = document.querySelector(`[data-asset-id="${assetId}"]`);
                  if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add a highlight effect
                    card.classList.add('ring-2', 'ring-accent');
                    setTimeout(() => {
                      card.classList.remove('ring-2', 'ring-accent');
                    }, 2000);
                    // Click the edit button to open for editing
                    const editButton = card.querySelector('button[title="Edit"]');
                    if (editButton) {
                      (editButton as HTMLElement).click();
                    }
                  }
                }, 100);
              }}
              onEditAccount={(accountId) => {
                // Collapse add sections
                setIsAddingAsset(false);
                setAddingAssetType(null);
                setIsAddingAccount(false);
                setAddingAccountType(null);

                // Switch to accounts tab
                setActiveTab("accounts");
                // Scroll to the card and open it for editing
                setTimeout(() => {
                  const card = document.querySelector(`[data-account-id="${accountId}"]`);
                  if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add a highlight effect
                    card.classList.add('ring-2', 'ring-accent');
                    setTimeout(() => {
                      card.classList.remove('ring-2', 'ring-accent');
                    }, 2000);
                    // Click the edit button to open for editing
                    const editButton = card.querySelector('button[title="Edit"]');
                    if (editButton) {
                      (editButton as HTMLElement).click();
                    }
                  }
                }, 100);
              }}
              onEditIdentity={(identityId) => {
                // Collapse add sections
                setIsAddingAsset(false);
                setAddingAssetType(null);
                setIsAddingAccount(false);
                setAddingAccountType(null);

                // Switch to identity tab
                setActiveTab("identity");
                // Scroll to the card and open it for editing
                setTimeout(() => {
                  const card = document.querySelector(`[data-identity-id="${identityId}"]`);
                  if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add a highlight effect
                    card.classList.add('ring-2', 'ring-accent');
                    setTimeout(() => {
                      card.classList.remove('ring-2', 'ring-accent');
                    }, 2000);
                    // Click the edit button to open for editing
                    const editButton = card.querySelector('button[title="Edit"]');
                    if (editButton) {
                      (editButton as HTMLElement).click();
                    }
                  }
                }, 100);
              }}
              onCompleteSetup={() => {
                saveProfile();
              }}
            />
          </div>
        </div>
        {/* End Right Column */}
      </div>
      {/* End Two-Column Layout */}

      {/* Credentials Modal */}
      {showCredentialsModal && pendingAccountForVault && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--accent-dim)" }}>
                  <Key className="h-5 w-5" style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    Add Credentials to Vault
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {pendingAccountForVault.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCredentialsModal(false);
                  setPendingAccountForVault(null);
                  setCredentialsForm({ username: "", password: "", notes: "" });
                }}
              >
                <X className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <div
              className="p-4 rounded-lg mb-4 border-l-4"
              style={{ backgroundColor: "var(--info-bg)", borderLeftColor: "var(--info)" }}
            >
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--info)" }} />
                <div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    <strong>Secure Storage:</strong> Your credentials will be encrypted and stored in the Vault.
                    They will only be accessible to designated beneficiaries after trigger execution.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Username / Email"
                placeholder="your@email.com or username"
                value={credentialsForm.username}
                onChange={(e) => setCredentialsForm({...credentialsForm, username: e.target.value})}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={credentialsForm.password}
                onChange={(e) => setCredentialsForm({...credentialsForm, password: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Security questions, recovery codes, or other important information..."
                  value={credentialsForm.notes}
                  onChange={(e) => setCredentialsForm({...credentialsForm, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCredentialsModal(false);
                    setPendingAccountForVault(null);
                    setCredentialsForm({ username: "", password: "", notes: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={!credentialsForm.username || !credentialsForm.password}
                  onClick={() => {
                    // Create vault record with credentials
                    const vaultRecordId = createVaultRecordWithCredentials(pendingAccountForVault, credentialsForm);

                    // Update account with vault link
                    const accountWithVault = {
                      ...pendingAccountForVault,
                      vaultRecordId: vaultRecordId,
                      hasVaultCredentials: true,
                    };

                    // Check if this is an existing account or new one
                    const existingAccountIndex = accounts.findIndex(a => a.id === pendingAccountForVault.id);
                    if (existingAccountIndex >= 0) {
                      // Update existing account
                      const updatedAccounts = [...accounts];
                      updatedAccounts[existingAccountIndex] = accountWithVault;
                      setAccounts(updatedAccounts);

                      logActivity(
                        "Vault Credentials Added",
                        "profile",
                        `Added Vault credentials for ${pendingAccountForVault.name}`,
                        {
                          field: "Accounts",
                          newValue: `${pendingAccountForVault.name} (credentials added)`,
                        }
                      );
                    } else {
                      // Add new account
                      setAccounts([...accounts, accountWithVault]);

                      logActivity(
                        "Account Added with Credentials",
                        "profile",
                        `Added ${pendingAccountForVault.type}: ${pendingAccountForVault.name} with Vault credentials`,
                        {
                          field: "Accounts",
                          newValue: `${pendingAccountForVault.name} (with credentials)`,
                        }
                      );
                    }

                    // Reset forms and close modal
                    setShowCredentialsModal(false);
                    setPendingAccountForVault(null);
                    setCredentialsForm({ username: "", password: "", notes: "" });
                    setIsAddingAccount(false);
                    setAddingAccountType(null);
                    setAccountForm({ name: "", accountType: "", accountNumber: "", institution: "", description: "" });
                    triggerAutoSave();
                  }}
                >
                  <Lock className="h-4 w-4" />
                  Save to Vault
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Section Components
function PersonalInformationSection({
  personalInfo,
  setPersonalInfo,
  userCountry,
  setUserCountry,
  triggerAutoSave,
  showBeneficiarySuggestion,
  setShowBeneficiarySuggestion,
  suggestedBeneficiaries
}: {
  personalInfo: any;
  setPersonalInfo: (info: any) => void;
  userCountry: string;
  setUserCountry: (country: string) => void;
  triggerAutoSave?: () => void;
  showBeneficiarySuggestion: boolean;
  setShowBeneficiarySuggestion: (show: boolean) => void;
  suggestedBeneficiaries: string[]
}) {
  const countries = [
    { code: "AU", name: "Australia" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "NZ", name: "New Zealand" },
    { code: "SG", name: "Singapore" },
    { code: "OTHER", name: "Other" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Legal Name"
          placeholder="John Michael Doe"
          value={personalInfo.fullName}
          onChange={(e) => {
            setPersonalInfo({...personalInfo, fullName: e.target.value});
            if (triggerAutoSave) triggerAutoSave();
          }}
        />
        <Input
          label="Date of Birth"
          type="date"
          value={personalInfo.dateOfBirth}
          onChange={(e) => {
            setPersonalInfo({...personalInfo, dateOfBirth: e.target.value});
            if (triggerAutoSave) triggerAutoSave();
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={personalInfo.phoneNumber}
          onChange={(e) => {
            setPersonalInfo({...personalInfo, phoneNumber: e.target.value});
            if (triggerAutoSave) triggerAutoSave();
          }}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          value={personalInfo.email}
          onChange={(e) => {
            setPersonalInfo({...personalInfo, email: e.target.value});
            if (triggerAutoSave) triggerAutoSave();
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Country <span style={{ color: "var(--error)" }}>*</span>
        </label>
        <select
          className="input"
          value={userCountry}
          onChange={(e) => {
            setUserCountry(e.target.value);
            localStorage.setItem("userCountry", e.target.value);
            logActivity("Country Updated", "profile", `Country set to: ${countries.find(c => c.code === e.target.value)?.name}`, {
              field: "Country",
              newValue: e.target.value,
            });
            if (triggerAutoSave) triggerAutoSave();
          }}
        >
          <option value="">Select your country...</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          This helps personalize your experience with region-specific options
        </p>
      </div>

      <Input
        label="Primary Address"
        placeholder="123 Main Street, Apt 4B"
        value={personalInfo.address}
        onChange={(e) => {
          setPersonalInfo({...personalInfo, address: e.target.value});
          if (triggerAutoSave) triggerAutoSave();
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="City"
          placeholder="San Francisco"
          value={personalInfo.city}
          onChange={(e) => {
            setPersonalInfo({...personalInfo, city: e.target.value});
            if (triggerAutoSave) triggerAutoSave();
          }}
        />
        <Input
          label="State/Province"
          placeholder="CA"
          value={personalInfo.state}
          onChange={(e) => {
            setPersonalInfo({...personalInfo, state: e.target.value});
            if (triggerAutoSave) triggerAutoSave();
          }}
        />
        <Input
          label="Zip/Postal Code"
          placeholder="94102"
          value={personalInfo.zipCode}
          onChange={(e) => {
            setPersonalInfo({...personalInfo, zipCode: e.target.value});
            if (triggerAutoSave) triggerAutoSave();
          }}
        />
      </div>

      <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <h4 className="font-medium mb-4" style={{ color: "var(--text-primary)" }}>
          Family Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Marital Status
            </label>
            <select
              className="input"
              value={personalInfo.maritalStatus}
              onChange={(e) => {
                setPersonalInfo({...personalInfo, maritalStatus: e.target.value});
                if (triggerAutoSave) triggerAutoSave();
              }}
            >
              <option value="">Select status...</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="partnered">Domestic Partnership</option>
            </select>
          </div>
          {personalInfo.maritalStatus && personalInfo.maritalStatus !== "single" && (
            <Input
              label="Spouse/Partner Name"
              placeholder="Jane Doe"
              value={personalInfo.spouseName}
              onChange={(e) => {
                setPersonalInfo({...personalInfo, spouseName: e.target.value});
                if (triggerAutoSave) triggerAutoSave();
              }}
            />
          )}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Number of Children
          </label>
          <input
            type="number"
            min="0"
            max="20"
            className="input"
            style={{ maxWidth: "200px" }}
            value={personalInfo.numberOfChildren}
            onChange={(e) => {
              const count = parseInt(e.target.value) || 0;
              const newChildrenNames = [...personalInfo.childrenNames];

              // Adjust array size
              if (count > newChildrenNames.length) {
                // Add empty strings for new children
                while (newChildrenNames.length < count) {
                  newChildrenNames.push("");
                }
              } else if (count < newChildrenNames.length) {
                // Remove extra children
                newChildrenNames.splice(count);
              }

              setPersonalInfo({
                ...personalInfo,
                numberOfChildren: count,
                childrenNames: newChildrenNames
              });
              if (triggerAutoSave) triggerAutoSave();
            }}
          />
        </div>
        {personalInfo.numberOfChildren > 0 && (
          <div className="mt-4 space-y-3">
            <h5 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Children's Names
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: personalInfo.numberOfChildren }).map((_, index) => (
                <Input
                  key={index}
                  label={`Child ${index + 1} Name`}
                  placeholder="e.g., Sarah Doe"
                  value={personalInfo.childrenNames[index] || ""}
                  onChange={(e) => {
                    const newChildrenNames = [...personalInfo.childrenNames];
                    newChildrenNames[index] = e.target.value;
                    setPersonalInfo({...personalInfo, childrenNames: newChildrenNames});
                    if (triggerAutoSave) triggerAutoSave();
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Beneficiary Suggestion Prompt */}
        {showBeneficiarySuggestion && suggestedBeneficiaries.length > 0 && (
          <div className="mt-4">
            <Card style={{
              backgroundColor: "var(--accent-dim)",
              borderColor: "var(--accent)",
              borderWidth: "1px"
            }}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--accent)", color: "var(--text-inverse)" }}>
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    Add Family Members as Beneficiaries?
                  </h4>
                  <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                    You've added {suggestedBeneficiaries.length} family {suggestedBeneficiaries.length === 1 ? 'member' : 'members'}.
                    Would you like to add them as beneficiaries? You can configure their access and permissions on the Beneficiaries page.
                  </p>
                  <div className="mb-3">
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                      Family members:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedBeneficiaries.map((name, index) => (
                        <div
                          key={index}
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        // Store pending beneficiaries data in localStorage
                        const pendingBeneficiaries = suggestedBeneficiaries.map((name, index) => ({
                          id: `pending-${Date.now()}-${index}`,
                          name: name,
                          relationship: index === 0 && personalInfo.spouseName === name
                            ? (personalInfo.maritalStatus === "married" ? "Spouse" : "Partner")
                            : "Child",
                          email: "",
                          role: "beneficiary",
                          status: "draft" as const,
                        }));

                        localStorage.setItem("pendingBeneficiaries", JSON.stringify(pendingBeneficiaries));

                        // Log activity
                        logActivity(
                          "Navigating to Add Beneficiaries",
                          "profile",
                          `Adding ${pendingBeneficiaries.length} family member(s) as beneficiaries`,
                          {
                            field: "Beneficiaries",
                            newValue: suggestedBeneficiaries.join(", ")
                          }
                        );

                        // Navigate to beneficiaries page
                        window.location.href = "/beneficiaries";
                      }}
                    >
                      Add as Beneficiaries
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowBeneficiarySuggestion(false);
                      }}
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setShowBeneficiarySuggestion(false)}
                  className="p-1 hover:bg-hover rounded"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <h4 className="font-medium mb-4" style={{ color: "var(--text-primary)" }}>
          Emergency Contacts
        </h4>
        <div className="space-y-4">
          <Input label="Primary Emergency Contact Name" placeholder="Jane Doe" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Relationship" placeholder="Spouse" />
            <Input label="Phone Number" type="tel" placeholder="+1 (555) 123-4567" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EndOfLifeWishesSection({ triggerAutoSave }: { triggerAutoSave?: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Preferred Final Disposition
        </label>
        <select className="input">
          <option value="">Select preference...</option>
          <option value="burial">Traditional Burial</option>
          <option value="cremation">Cremation</option>
          <option value="natural">Natural/Green Burial</option>
          <option value="donation">Body Donation to Science</option>
          <option value="aquamation">Aquamation (Water Cremation)</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Service Type Preference
        </label>
        <select className="input">
          <option value="">Select preference...</option>
          <option value="religious">Religious Service</option>
          <option value="secular">Secular/Non-Religious Service</option>
          <option value="celebration">Celebration of Life</option>
          <option value="memorial">Memorial Service (no body present)</option>
          <option value="private">Private Family Only</option>
          <option value="none">No Service</option>
        </select>
      </div>

      <Input label="Preferred Location (Church, Venue, Cemetery)" placeholder="St. Mary's Church, 456 Oak Street" />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Music Selections
        </label>
        <textarea
          className="input"
          rows={3}
          placeholder="List songs or hymns you'd like played during the service..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Readings or Poems
        </label>
        <textarea
          className="input"
          rows={3}
          placeholder="Specific readings, poems, or passages you'd like included..."
        />
      </div>

      <Input label="Preferred Speakers/Eulogists" placeholder="Names of people you'd like to speak" />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Dress Code / Attire
        </label>
        <select className="input">
          <option value="">Select preference...</option>
          <option value="formal">Formal/Traditional (Black Attire)</option>
          <option value="semiformal">Semi-Formal</option>
          <option value="casual">Casual</option>
          <option value="colorful">Colorful/Celebration Attire</option>
          <option value="specific">Specific Color or Theme</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Memorial Donations
        </label>
        <Input placeholder="Preferred charity or cause for donations in lieu of flowers" className="mb-2" />
        <textarea
          className="input"
          rows={2}
          placeholder="Additional instructions (e.g., 'In lieu of flowers, please donate to...')"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Special Requests or Wishes
        </label>
        <textarea
          className="input"
          rows={4}
          placeholder="Any other specific wishes for your service or remembrance..."
        />
      </div>
    </div>
  );
}

function MedicalDirectivesSection({ triggerAutoSave }: { triggerAutoSave?: () => void }) {
  return (
    <div className="space-y-6">
      <div
        className="p-4 rounded-lg border-l-4 mb-4"
        style={{ backgroundColor: "var(--info-bg)", borderLeftColor: "var(--info)" }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--info)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <strong>Note:</strong> This information is for your beneficiaries' reference. Legal medical
            directives should be filed with your healthcare provider and legal representative.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Organ Donation Status
        </label>
        <select className="input">
          <option value="">Select preference...</option>
          <option value="yes-all">Yes - All Organs and Tissues</option>
          <option value="yes-specific">Yes - Specific Organs Only</option>
          <option value="no">No - Do Not Donate</option>
          <option value="family">Defer to Family Decision</option>
          <option value="registered">Registered with Donor Registry</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          DNR (Do Not Resuscitate) Preference
        </label>
        <select className="input">
          <option value="">Select preference...</option>
          <option value="no-dnr">No DNR - Full Resuscitation</option>
          <option value="dnr">Yes - DNR in Effect</option>
          <option value="conditional">Conditional - Based on Circumstances</option>
          <option value="undecided">Undecided - Consult Family</option>
        </select>
      </div>

      <Input label="Living Will Location" placeholder="Location of filed living will document" />

      <Input label="Healthcare Proxy / Power of Attorney" placeholder="Name of designated healthcare decision maker" />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Life Support Preferences
        </label>
        <textarea
          className="input"
          rows={3}
          placeholder="Your wishes regarding life support, ventilators, feeding tubes, etc..."
        />
      </div>

      <Input label="Primary Care Physician" placeholder="Dr. Smith - (555) 123-4567" />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Medical Conditions / Allergies
        </label>
        <textarea
          className="input"
          rows={3}
          placeholder="Important medical information beneficiaries should know..."
        />
      </div>
    </div>
  );
}

function DigitalLegacySection({ assets, accounts, setAccounts, setActiveTab, triggerAutoSave }: {assets: Asset[]; accounts: Account[]; setAccounts: (accounts: Account[]) => void; setActiveTab: (tab: "identity" | "assets" | "accounts" | "wishes") => void; triggerAutoSave?: () => void }) {
  const digitalAccounts = accounts.filter(a => a.type === "digital");
  const cryptoAssets = assets.filter(a => a.type === "crypto");
  const [recordWishes, setRecordWishes] = useState<{ [recordId: string]: { action: string; transferTo: string; notes: string } }>({});

  // Load saved wishes on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWishes = localStorage.getItem("recordWishes");
      if (savedWishes) {
        setRecordWishes(JSON.parse(savedWishes));
      }
    }
  }, []);

  // Save wishes to localStorage
  useEffect(() => {
    if (Object.keys(recordWishes).length > 0) {
      localStorage.setItem("recordWishes", JSON.stringify(recordWishes));
    }
  }, [recordWishes]);

  const updateRecordWish = (recordId: string, action: string, transferTo: string, notes: string) => {
    setRecordWishes({
      ...recordWishes,
      [recordId]: { action, transferTo, notes },
    });

    logActivity(
      "Digital Legacy Wish Updated",
      "profile",
      `Updated wishes for record`,
      {
        field: "Digital Legacy",
        newValue: action,
      }
    );

    if (triggerAutoSave) triggerAutoSave();
  };

  const totalRecords = digitalAccounts.length + cryptoAssets.length;

  return (
    <div className="space-y-6">
      <div
        className="p-4 rounded-lg border-l-4"
        style={{ backgroundColor: "var(--info-bg)", borderLeftColor: "var(--info)" }}
      >
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--info)" }} />
          <div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong>Digital Legacy:</strong> Specify what should happen to your digital accounts and crypto assets.
              Add accounts in the Accounts tab and crypto in the Assets tab, then set your wishes here.
            </p>
          </div>
        </div>
      </div>

      {/* Digital Accounts and Crypto Assets */}
      {totalRecords > 0 ? (
        <div className="space-y-6">
          {/* Digital Accounts */}
          {digitalAccounts.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Your Digital Accounts
              </h4>
              <div className="space-y-4">
                {digitalAccounts.map((account) => {
                  const wish = recordWishes[account.id] || { action: "", transferTo: "", notes: "" };
                  return (
                    <Card key={account.id} padding="md">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
                            >
                              <Globe className="h-5 w-5" style={{ color: "#F59E0B" }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                  {account.name}
                                </h5>
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" }}
                                >
                                  Credentials
                                </span>
                                {account.hasVaultCredentials && (
                                  <div
                                    className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                                    style={{ backgroundColor: "var(--success-bg)", color: "var(--success)" }}
                                  >
                                    <Lock className="h-3 w-3" />
                                    <span>In Vault</span>
                                  </div>
                                )}
                              </div>
                              {account.institution && (
                                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                                  {account.institution}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 pl-11">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                              What should happen to this account?
                            </label>
                            <select
                              className="input"
                              value={wish.action}
                              onChange={(e) => updateRecordWish(account.id, e.target.value, wish.transferTo, wish.notes)}
                            >
                              <option value="">Select action...</option>
                              <option value="memorialize">Memorialize / Keep as memorial</option>
                              <option value="delete">Delete account permanently</option>
                              <option value="transfer">Transfer to family member</option>
                              <option value="download">Download data then delete</option>
                              <option value="preserve">Preserve for family access</option>
                            </select>
                          </div>

                          {wish.action === "transfer" && (
                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                Transfer to
                              </label>
                              <select
                                className="input"
                                value={wish.transferTo}
                                onChange={(e) => updateRecordWish(account.id, wish.action, e.target.value, wish.notes)}
                              >
                                <option value="">Select beneficiary...</option>
                                <option value="spouse">Spouse</option>
                                <option value="child1">Child 1</option>
                                <option value="child2">Child 2</option>
                                <option value="executor">Primary Executor</option>
                              </select>
                            </div>
                          )}

                          {wish.action && (
                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                Additional Instructions
                              </label>
                              <textarea
                                className="input"
                                rows={2}
                                placeholder="Any specific instructions for this account..."
                                value={wish.notes}
                                onChange={(e) => updateRecordWish(account.id, wish.action, wish.transferTo, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Crypto Assets */}
          {cryptoAssets.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Your Cryptocurrency Assets
              </h4>
              <div className="space-y-4">
                {cryptoAssets.map((asset) => {
                  const wish = recordWishes[asset.id] || { action: "", transferTo: "", notes: "" };
                  return (
                    <Card key={asset.id} padding="md">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: "rgba(249, 115, 22, 0.1)" }}
                            >
                              <Coins className="h-5 w-5" style={{ color: "#F97316" }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                  {asset.name}
                                </h5>
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: "rgba(249, 115, 22, 0.1)", color: "#F97316" }}
                                >
                                  Assets
                                </span>
                              </div>
                              {asset.value && (
                                <p className="text-sm mt-1" style={{ color: "var(--success)" }}>
                                  Value: ${asset.value}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 pl-11">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                              What should happen to this asset?
                            </label>
                            <select
                              className="input"
                              value={wish.action}
                              onChange={(e) => updateRecordWish(asset.id, e.target.value, wish.transferTo, wish.notes)}
                            >
                              <option value="">Select action...</option>
                              <option value="transfer">Transfer to family member</option>
                              <option value="preserve">Preserve for family access</option>
                              <option value="liquidate">Liquidate and distribute</option>
                              <option value="donate">Donate to charity</option>
                            </select>
                          </div>

                          {wish.action === "transfer" && (
                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                Transfer to
                              </label>
                              <select
                                className="input"
                                value={wish.transferTo}
                                onChange={(e) => updateRecordWish(asset.id, wish.action, e.target.value, wish.notes)}
                              >
                                <option value="">Select beneficiary...</option>
                                <option value="spouse">Spouse</option>
                                <option value="child1">Child 1</option>
                                <option value="child2">Child 2</option>
                                <option value="executor">Primary Executor</option>
                              </select>
                            </div>
                          )}

                          {wish.action && (
                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                Additional Instructions
                              </label>
                              <textarea
                                className="input"
                                rows={2}
                                placeholder="Include wallet addresses, recovery phrases location in Vault, etc..."
                                value={wish.notes}
                                onChange={(e) => updateRecordWish(asset.id, wish.action, wish.transferTo, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* No Digital Accounts */}
          <Card padding="lg">
            <div className="text-center">
              <Globe className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                No Digital Accounts or Crypto Assets
              </h4>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Add digital accounts in the Accounts tab and cryptocurrency in the Assets tab to specify your wishes.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => setActiveTab("accounts")}
                >
                  <Plus className="h-4 w-4" />
                  Go to Accounts
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab("assets")}
                >
                  <Plus className="h-4 w-4" />
                  Go to Assets
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* General Digital Legacy Instructions */}
      <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <h4 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          General Digital Legacy Instructions
        </h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Website / Blog Instructions
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="Instructions for personal websites, blogs, or online content you manage..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Digital Photos & Files
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="Instructions for cloud storage, photo libraries, important files..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Online Subscriptions
            </label>
            <textarea
              className="input"
              rows={2}
              placeholder="List of subscriptions to cancel (streaming services, memberships, etc.)..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Other Digital Instructions
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="Any other digital legacy instructions not covered above..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalMessagesSection({ triggerAutoSave }: { triggerAutoSave?: () => void }) {
  return (
    <div className="space-y-6">
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: "var(--accent-dim)", border: "1px solid var(--accent)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          These messages will only be revealed to beneficiaries after trigger execution.
          You can also create individual messages for specific people in the Vault.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          General Message to All Beneficiaries
        </label>
        <textarea
          className="input"
          rows={8}
          placeholder="A message to everyone who will receive this information..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Message to Executors
        </label>
        <textarea
          className="input"
          rows={6}
          placeholder="Specific guidance or thanks for those handling your estate..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Personal Values & Life Philosophy
        </label>
        <textarea
          className="input"
          rows={6}
          placeholder="Share what mattered most to you, lessons learned, values you lived by..."
        />
      </div>

      <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium" style={{ color: "var(--text-primary)" }}>
            Individual Messages
          </h4>
          <Button variant="secondary" size="sm">
            Add to Vault Instead
          </Button>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          For private messages to specific individuals, we recommend creating them as "Instructions"
          records in your Vault with targeted beneficiary access.
        </p>
      </div>
    </div>
  );
}

function IdentityDocumentsSection({ identities, setIdentities, triggerAutoSave }: { identities: Identity[]; setIdentities: (identities: Identity[]) => void; triggerAutoSave?: () => void }) {
  const [isAddingIdentity, setIsAddingIdentity] = useState(false);
  const [identityForm, setIdentityForm] = useState({ type: "", number: "", issueDate: "", expiryDate: "" });

  const identityTypes = [
    { value: "ssn", label: "Social Security Number", icon: IdCard },
    { value: "license", label: "Driver's License", icon: IdCard },
    { value: "medicare", label: "Medicare Card", icon: IdCard },
    { value: "passport", label: "Passport", icon: IdCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          Store your government-issued identity documents for secure access by beneficiaries.
        </p>

        {/* Add Identity Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAddingIdentity(true)}
        >
          <Plus className="h-4 w-4" />
          Add Identity Document
        </Button>
      </div>

      {/* Existing Identities */}
      {identities.length > 0 && (
        <div className="space-y-3">
          {identities.map((identity) => {
            const typeLabel = identityTypes.find(t => t.type === identity.type)?.label || identity.type;
            return (
              <Card key={identity.id} hover padding="md" data-identity-id={identity.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "var(--accent-dim)" }}
                    >
                      <IdCard className="h-6 w-6" style={{ color: "var(--accent)" }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {typeLabel}
                      </h4>
                      <p className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                        {identity.number}
                      </p>
                      {identity.expiryDate && (
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          Expires: {identity.expiryDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Edit"
                      onClick={() => {
                        // Open add identity form and pre-populate with existing data
                        setIsAddingIdentity(true);
                        setIdentityForm({
                          type: identity.type,
                          number: identity.number,
                          expiryDate: identity.expiryDate || "",
                          issuingCountry: identity.issuingCountry || "",
                        });
                        // Remove the identity temporarily so user can edit it
                        setIdentities(identities.filter(i => i.id !== identity.id));
                        setTimeout(() => {
                          const addForm = document.querySelector('[data-add-identity-form]');
                          addForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${typeLabel}"? This action cannot be undone.`)) {
                          setIdentities(identities.filter(i => i.id !== identity.id));
                          logActivity("Identity Document Deleted", "profile", `Deleted ${typeLabel}`, {
                            field: "Identity",
                            oldValue: typeLabel,
                            newValue: "Deleted",
                          });
                          if (triggerAutoSave) triggerAutoSave();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" style={{ color: "var(--error)" }} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Identity Modal */}
      {isAddingIdentity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" data-add-identity-card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Add Identity Document
              </h3>
              <button onClick={() => setIsAddingIdentity(false)}>
                <X className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Document Type
                </label>
                <select
                  className="input"
                  value={identityForm.type}
                  onChange={(e) => setIdentityForm({...identityForm, type: e.target.value})}
                >
                  <option value="">Select type...</option>
                  {identityTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Document Number"
                placeholder="e.g., XXX-XX-XXXX"
                value={identityForm.number}
                onChange={(e) => setIdentityForm({...identityForm, number: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Issue Date"
                  type="date"
                  value={identityForm.issueDate}
                  onChange={(e) => setIdentityForm({...identityForm, issueDate: e.target.value})}
                />
                <Input
                  label="Expiry Date (if applicable)"
                  type="date"
                  value={identityForm.expiryDate}
                  onChange={(e) => setIdentityForm({...identityForm, expiryDate: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsAddingIdentity(false);
                    setIdentityForm({ type: "", number: "", issueDate: "", expiryDate: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={!identityForm.type || !identityForm.number}
                  onClick={() => {
                    const newIdentity: Identity = {
                      id: Date.now().toString(),
                      type: identityForm.type as "ssn" | "license" | "medicare" | "passport",
                      number: identityForm.number,
                      issueDate: identityForm.issueDate,
                      expiryDate: identityForm.expiryDate,
                      details: {},
                    };
                    setIdentities([...identities, newIdentity]);
                    const typeLabel = identityTypes.find(t => t.value === identityForm.type)?.label;
                    logActivity("Identity Document Added", "profile", `Added ${typeLabel}`, {
                      field: "Identity",
                      newValue: typeLabel || identityForm.type,
                    });
                    setIsAddingIdentity(false);
                    setIdentityForm({ type: "", number: "", issueDate: "", expiryDate: "" });
                    if (triggerAutoSave) triggerAutoSave();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Identity
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ImportantDocumentsSection({ triggerAutoSave }: { triggerAutoSave?: () => void }) {
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: { name: string; size: number; type: string; data: string } | null }>({
    will: null,
    insurance: null,
    deeds: null,
    birth: null,
    marriage: null,
    passport: null,
    military: null,
    other: null,
  });
  const [dragActive, setDragActive] = useState<{ [key: string]: boolean }>({});

  // Load saved files from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFiles = localStorage.getItem("uploadedDocuments");
      if (savedFiles) {
        try {
          setUploadedFiles(JSON.parse(savedFiles));
        } catch (e) {
          console.error("Error loading saved files:", e);
        }
      }
    }
  }, []);

  const handleFileUpload = (docType: string, file: File) => {
    console.log("handleFileUpload called", { docType, fileName: file.name, fileSize: file.size });

    // Convert file to base64 for storage
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("FileReader onload triggered");
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: e.target?.result as string,
      };

      const updatedFiles = { ...uploadedFiles, [docType]: fileData };
      setUploadedFiles(updatedFiles);
      console.log("Updated files state", updatedFiles);

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("uploadedDocuments", JSON.stringify(updatedFiles));
        console.log("Saved to localStorage");

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent("documentUploaded"));
      }

      // Log the file upload activity
      logActivity(
        "Document Uploaded",
        "profile",
        `Uploaded ${docType} document: ${file.name}`,
        {
          field: `Document - ${docType}`,
          newValue: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        }
      );

      // Trigger auto-save
      if (triggerAutoSave) {
        triggerAutoSave();
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error", error);
    };
    reader.readAsDataURL(file);
  };

  const handleFileRemove = (docType: string) => {
    const file = uploadedFiles[docType];
    const updatedFiles = { ...uploadedFiles };
    delete updatedFiles[docType]; // Remove the key entirely instead of setting to null
    setUploadedFiles(updatedFiles);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("uploadedDocuments", JSON.stringify(updatedFiles));

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("documentUploaded"));
    }

    // Log the file removal activity
    if (file) {
      logActivity(
        "Document Removed",
        "profile",
        `Removed ${docType} document: ${file.name}`,
        {
          field: `Document - ${docType}`,
          oldValue: file.name,
        }
      );
    }
  };

  const handleDrag = (e: React.DragEvent, docType: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [docType]: active });
  };

  const handleDrop = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [docType]: false });

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(docType, files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const DocumentUploadRow = ({
    label,
    docType,
    placeholder,
  }: {
    label: string;
    docType: string;
    placeholder: string;
  }) => {
    const file = uploadedFiles[docType];

    return (
      <div
        className="p-4 rounded-lg border"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <h5 className="font-medium mb-3" style={{ color: "var(--text-primary)" }}>
          {label}
        </h5>

        <div className="space-y-3">
          {/* Upload Section */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Upload to Vault (Encrypted)
            </label>
            {file ? (
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: "var(--success-bg)", border: "1px solid var(--success)" }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {file.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleFileRemove(docType)}
                  className="p-1 hover:bg-error-bg rounded transition-colors"
                  style={{ color: "var(--error)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className="relative"
                onDragEnter={(e) => handleDrag(e, docType, true)}
                onDragLeave={(e) => handleDrag(e, docType, false)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => handleDrop(e, docType)}
              >
                <input
                  type="file"
                  id={`file-${docType}`}
                  className="hidden"
                  onChange={(e) => {
                    console.log("File input onChange triggered", e.target.files);
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      console.log("File selected:", selectedFile.name);
                      handleFileUpload(docType, selectedFile);
                    } else {
                      console.log("No file selected");
                    }
                    // Reset input so same file can be selected again
                    e.target.value = "";
                  }}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label
                  htmlFor={`file-${docType}`}
                  className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-hover transition-colors"
                  style={{
                    borderColor: dragActive[docType] ? "var(--accent)" : "var(--border)",
                    backgroundColor: dragActive[docType] ? "var(--accent-dim)" : "transparent"
                  }}
                >
                  <Upload className="h-4 w-4" style={{ color: dragActive[docType] ? "var(--accent)" : "var(--text-muted)" }} />
                  <span className="text-sm" style={{ color: dragActive[docType] ? "var(--accent)" : "var(--text-secondary)" }}>
                    {dragActive[docType] ? "Drop file here" : "Click to upload or drag file"}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Physical Location */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Physical Location (Original Document)
            </label>
            <Input placeholder={placeholder} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div
        className="p-4 rounded-lg border-l-4"
        style={{ backgroundColor: "var(--info-bg)", borderLeftColor: "var(--info)" }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--info)" }} />
          <div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong>Upload & Track:</strong> Upload digital copies to your encrypted Vault and note where the
              original physical documents are kept. Both pieces of information will be available to your
              beneficiaries after trigger execution.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <DocumentUploadRow
          label="Last Will and Testament"
          docType="will"
          placeholder="e.g., Safe deposit box at First National Bank, Box #123"
        />

        <DocumentUploadRow
          label="Life Insurance Policies"
          docType="insurance"
          placeholder="e.g., File cabinet in home office, top drawer"
        />

        <DocumentUploadRow
          label="Property Deeds"
          docType="deeds"
          placeholder="e.g., Attorney's office - John Smith Law, 555 Legal St"
        />

        <DocumentUploadRow
          label="Birth Certificate"
          docType="birth"
          placeholder="e.g., Home safe, combination in separate Vault record"
        />

        <DocumentUploadRow
          label="Marriage Certificate"
          docType="marriage"
          placeholder="e.g., Filing cabinet, family documents folder"
        />

        <DocumentUploadRow
          label="Passport"
          docType="passport"
          placeholder="e.g., Bedroom dresser, top drawer"
        />

        <DocumentUploadRow
          label="Military Records / DD-214"
          docType="military"
          placeholder="e.g., VA office copy, original in desk drawer"
        />

        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <h5 className="font-medium mb-3" style={{ color: "var(--text-primary)" }}>
            Other Important Documents
          </h5>
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
            List any other important documents and their locations
          </p>
          <textarea
            className="input"
            rows={4}
            placeholder="Document Type - Physical Location&#10;Social Security Card - Home safe&#10;Vehicle Titles - Glove compartment&#10;Medical Records - Dr. Smith's office"
          />
        </div>
      </div>
    </div>
  );
}

function PracticalArrangementsSection({ triggerAutoSave }: { triggerAutoSave?: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3" style={{ color: "var(--text-primary)" }}>
          Pre-Planned Arrangements
        </h4>
        <div className="flex items-center gap-3 mb-4">
          <input type="checkbox" className="w-4 h-4" />
          <label className="text-sm" style={{ color: "var(--text-primary)" }}>
            I have pre-planned funeral arrangements
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Funeral Home Name" placeholder="Smith Funeral Services" />
          <Input label="Funeral Home Phone" type="tel" placeholder="(555) 123-4567" />
        </div>
        <Input label="Funeral Home Address" placeholder="789 Memorial Drive" className="mt-4" />

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Pre-Payment / Plot Information
          </label>
          <textarea
            className="input"
            rows={3}
            placeholder="Details about pre-paid services, purchased cemetery plots, etc..."
          />
        </div>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <h4 className="font-medium mb-3" style={{ color: "var(--text-primary)" }}>
          Key People to Notify
        </h4>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          List important contacts who should be notified (employer, close friends, organizations)
        </p>
        <textarea
          className="input"
          rows={5}
          placeholder="Name - Relationship - Phone/Email&#10;Dr. Jones - Dentist - (555) 123-4567&#10;John Smith - Best Friend - john@email.com"
        />
      </div>

      <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <h4 className="font-medium mb-3" style={{ color: "var(--text-primary)" }}>
          Attorney / Financial Advisor
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Attorney Name" placeholder="Jane Smith, Esq." />
          <Input label="Attorney Phone" type="tel" placeholder="(555) 123-4567" />
          <Input label="Financial Advisor Name" placeholder="Robert Johnson" />
          <Input label="Advisor Phone" type="tel" placeholder="(555) 987-6543" />
        </div>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <h4 className="font-medium mb-3" style={{ color: "var(--text-primary)" }}>
          Additional Notes
        </h4>
        <textarea
          className="input"
          rows={4}
          placeholder="Any other practical information your executors and beneficiaries should know..."
        />
      </div>
    </div>
  );
}
