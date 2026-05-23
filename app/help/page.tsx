"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, Badge, Button } from "@/components/ui";
import {
  HelpCircle,
  Shield,
  Vault,
  Users,
  Zap,
  Lock,
  FileText,
  Activity,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Rocket,
  Check,
  ArrowRight,
  BookOpen,
  Eye,
  Edit,
  History,
} from "lucide-react";

interface HelpSection {
  id: string;
  title: string;
  icon: any;
  content: HelpItem[];
}

interface HelpItem {
  term: string;
  definition: string;
  details?: string[];
}

export default function HelpPage() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    setup: true,
  });
  const [activeSection, setActiveSection] = useState<string>("overview");

  const toggleSection = (id: string) => {
    setOpenSections({ ...openSections, [id]: !openSections[id] });
  };

  const handleSectionClick = (id: string) => {
    setActiveSection(id);

    // Toggle the section open/closed
    setOpenSections({ ...openSections, [id]: !openSections[id] });
  };


  const helpSections: HelpSection[] = [
    {
      id: "execution",
      title: "Execution Status & Triggers",
      icon: Zap,
      content: [
        {
          term: "Execution Status: Armed",
          definition:
            "Your digital estate is actively monitored and ready to execute. If any of your configured triggers activate, your vault will be automatically released to designated beneficiaries.",
          details: [
            "Your triggers are actively monitoring for execution conditions",
            "Beneficiaries will be notified if triggers activate",
            "All vault contents will be decrypted and distributed according to your settings",
          ],
        },
        {
          term: "Execution Status: Disarmed",
          definition:
            "Your triggers are temporarily paused and will not execute even if conditions are met. Your vault remains secure and inaccessible to beneficiaries.",
          details: [
            "Use this when traveling or during extended absences",
            "You can re-arm your triggers at any time",
            "No notifications will be sent while disarmed",
          ],
        },
        {
          term: "Execution Status: Testing",
          definition:
            "Your triggers are in test mode. Conditions will be monitored but no actual execution will occur. Use this to verify your trigger settings work as expected.",
        },
        {
          term: "Trigger Types",
          definition: "Different methods to automatically activate your digital estate:",
          details: [
            "Inactivity Monitor: Activates after you don't check in for a specified period (e.g., 90 days)",
            "Dead Man's Switch: Requires regular confirmation that you're still active",
            "Third-Party Verification: Requires confirmation from a trusted contact or legal entity",
            "Manual Trigger: Can be activated by you or your designated executor at any time",
          ],
        },
      ],
    },
    {
      id: "vault",
      title: "Vault & Records",
      icon: Vault,
      content: [
        {
          term: "The Vault",
          definition:
            "Your encrypted storage for all digital estate information. Everything stored here is protected with zero-knowledge encryption and only accessible after trigger execution.",
        },
        {
          term: "Record Types",
          definition: "Six categories organize your digital estate:",
          details: [
            "Identity: Personal identification documents (SSN, birth certificate, passport)",
            "Financial: Bank accounts, investment portfolios, credit cards",
            "Credentials: Login information for important accounts",
            "Documents: Legal documents, deeds, certificates, insurance policies",
            "Instructions: Final wishes, funeral arrangements, special messages",
            "Assets: Digital assets, cryptocurrency wallets, valuable collectibles",
          ],
        },
        {
          term: "Encryption Indicator",
          definition:
            "The shield icon (🛡️) indicates that a record is encrypted using zero-knowledge encryption. This means only you can access it now, and only your designated beneficiaries can access it after trigger execution.",
        },
        {
          term: "Access Scope",
          definition: "Controls who can see each record after trigger execution:",
          details: [
            "Full Access: All beneficiaries can view this record",
            "Executor Only: Only designated executors can access",
            "Specific Beneficiaries: Only selected individuals can view",
          ],
        },
      ],
    },
    {
      id: "beneficiaries",
      title: "Beneficiaries & Roles",
      icon: Users,
      content: [
        {
          term: "Beneficiary",
          definition:
            "Someone who will receive access to your digital estate information after trigger execution. They receive view-only access to records you've designated for them.",
        },
        {
          term: "Executor",
          definition:
            "A trusted individual with elevated privileges. Executors can access all records marked for executor access and are responsible for carrying out your wishes.",
          details: [
            "Recommended: 2-3 executors for redundancy",
            "Executors can be family members, attorneys, or trusted advisors",
            "They receive priority notifications when triggers activate",
          ],
        },
        {
          term: "Observer",
          definition:
            "Someone who receives notifications about execution status but has limited access. Useful for keeping family informed without granting full access.",
        },
        {
          term: "Verification Contact",
          definition:
            "A person who can confirm trigger conditions (e.g., verify your passing). They do not receive access to your vault unless also designated as a beneficiary.",
        },
      ],
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: Shield,
      content: [
        {
          term: "Zero-Knowledge Encryption",
          definition:
            "The strongest form of encryption where even Keepr-E3tate cannot access your data. Your vault is encrypted with keys that only you control.",
          details: [
            "All data is encrypted on your device before being stored",
            "Keepr-E3tate servers never have access to your unencrypted data",
            "Decryption keys are distributed to beneficiaries only upon trigger execution",
            "Even if our servers are compromised, your data remains secure",
          ],
        },
        {
          term: "Post-Trigger Access Only",
          definition:
            "Information marked with this designation is completely inaccessible to anyone (including executors and beneficiaries) until your triggers activate. Used for sensitive final wishes and personal information.",
        },
        {
          term: "End-to-End Encrypted",
          definition:
            "Your data is encrypted from the moment you enter it until it's decrypted by your beneficiaries. No intermediate parties can access the content.",
        },
      ],
    },
    {
      id: "activity",
      title: "Activity Log & Audit Trail",
      icon: Activity,
      content: [
        {
          term: "Activity Log",
          definition:
            "A comprehensive record of every change made to your digital estate. This audit trail is included when your vault is triggered, providing transparency to your beneficiaries.",
          details: [
            "Tracks all vault record changes, additions, and deletions",
            "Logs beneficiary modifications",
            "Records trigger configuration changes",
            "Shows document uploads and profile updates",
            "Includes timestamps and detailed metadata",
          ],
        },
        {
          term: "Activity Categories",
          definition: "Activities are organized by type:",
          details: [
            "Profile: Changes to your personal information and documents",
            "Vault: Record additions, modifications, deletions",
            "Beneficiary: Changes to beneficiary list and permissions",
            "Trigger: Arming, disarming, or configuration changes",
            "System: Automated events and security notifications",
          ],
        },
      ],
    },
    {
      id: "profile",
      title: "Profile & Important Documents",
      icon: FileText,
      content: [
        {
          term: "Profile Information",
          definition:
            "Your personal details, end-of-life wishes, medical directives, and final messages. All profile information is post-trigger access only for maximum privacy.",
          details: [
            "Personal Information: Basic details about you and your family",
            "End-of-Life Wishes: Funeral preferences, service details, music selections",
            "Medical Directives: Organ donation, DNR status, healthcare wishes",
            "Digital Legacy: Instructions for social media, email, online accounts",
            "Final Messages: Personal messages to loved ones and executors",
            "Practical Arrangements: Pre-planned services, key contacts, attorney information",
          ],
        },
        {
          term: "Important Document Locations",
          definition:
            "A dual-tracking system for critical documents. You can upload encrypted copies to your vault AND record where physical originals are located.",
          details: [
            "Upload digital copies that are encrypted and stored securely",
            "Note physical locations (safe deposit box, attorney's office, home safe)",
            "Supports: Will, insurance policies, deeds, birth certificate, marriage certificate, passport, military records",
            "All uploaded documents automatically appear in your Vault",
          ],
        },
      ],
    },
    {
      id: "documents",
      title: "Document Management & Viewing",
      icon: Eye,
      content: [
        {
          term: "Viewing Uploaded Documents",
          definition:
            "All documents uploaded from your Profile page automatically appear in your Vault. Click 'View Document' on any uploaded document to open the document viewer.",
          details: [
            "Documents are encrypted and stored securely in your browser",
            "Each document type has specific permissions based on sensitivity",
            "All document views and edits are tracked in the Activity Log",
            "Version history is maintained for editable documents",
          ],
        },
        {
          term: "Editable Documents (Green Badge)",
          definition:
            "These documents can be viewed AND edited directly within the system. Each edit creates a new version with full audit trail.",
          details: [
            "✓ Last Will and Testament - Fully editable with live text editing",
            "✓ Life Insurance Policy - Editable policy details and beneficiaries",
            "Click 'Edit Document' to enable editing mode",
            "Click 'Save Changes' to create a new version",
            "All previous versions are preserved and can be restored",
            "Each version includes timestamp, content, and editor information",
          ],
        },
        {
          term: "View-Only Documents with Password (Yellow Badge)",
          definition:
            "Sensitive legal documents that require password verification to view and cannot be edited to maintain authenticity.",
          details: [
            "✗ Birth Certificate - View only after password verification",
            "✗ Property Deed - View only after password verification",
            "✗ Marriage Certificate - View only after password verification",
            "✗ Passport - View only after password verification",
            "✗ Military Records (DD-214) - View only after password verification",
            "Password: 'secure123' (this should be changed in production)",
            "These documents cannot be edited to preserve legal authenticity",
            "Original documents should be stored securely in physical locations",
          ],
        },
        {
          term: "Version Control System",
          definition:
            "For editable documents, every save creates a new version that is tracked and can be restored.",
          details: [
            "Version number automatically increments with each save",
            "Timestamp records exact date and time of each change",
            "View complete version history by clicking 'Version History'",
            "Revert to any previous version instantly",
            "All version changes are logged in the Activity Log",
            "Beneficiaries will see version history after trigger execution",
          ],
        },
        {
          term: "Document Activity Tracking",
          definition:
            "All document operations are automatically logged to provide a complete audit trail.",
          details: [
            "Tracked Events: Document viewed, edited, saved, reverted to previous version",
            "Each log entry includes timestamp, document name, and action performed",
            "Password verification attempts are logged for security",
            "Version numbers are recorded in activity log entries",
            "View all document activity in the Activity Log page",
          ],
        },
      ],
    },
    {
      id: "badges",
      title: "Status Indicators & Badges",
      icon: CheckCircle,
      content: [
        {
          term: "Record Type Badges",
          definition: "Color-coded badges indicate the category of each vault record:",
          details: [
            "Purple: Identity documents",
            "Green: Financial records",
            "Blue: Documents and legal files",
            "Orange: Credentials and access information",
            "Pink: Instructions and personal messages",
            "Yellow: Digital assets and valuables",
          ],
        },
        {
          term: "Document Permission Badges",
          definition: "Badges on documents indicate their editability and security requirements:",
          details: [
            "Green 'Editable' badge with checkmark: Document can be viewed and edited with version control (e.g., Will, Insurance)",
            "Yellow 'View Only' badge with lock: Sensitive document requires password verification to view, cannot be edited (e.g., Birth Certificate, Passport)",
            "These badges appear in the document viewer when you open a document from the Vault",
          ],
        },
        {
          term: "Encryption Badge",
          definition:
            "Green shield icon with 'End-to-end Encrypted' indicates the record uses zero-knowledge encryption.",
        },
        {
          term: "Access Badge",
          definition:
            "Blue lock icon with 'Post-Trigger Access Only' means the information is completely inaccessible until triggers activate.",
        },
      ],
    },
  ];

  const tableOfContents = [
    { id: "overview", title: "What is Keepr-E3tate?", icon: BookOpen },
    { id: "setup", title: "Initial Setup Guide", icon: Rocket },
    { id: "execution", title: "Execution Status & Triggers", icon: Zap },
    { id: "vault", title: "Vault & Records", icon: Vault },
    { id: "beneficiaries", title: "Beneficiaries & Roles", icon: Users },
    { id: "security", title: "Security & Privacy", icon: Shield },
    { id: "activity", title: "Activity Log & Audit Trail", icon: Activity },
    { id: "profile", title: "Profile & Important Documents", icon: FileText },
    { id: "documents", title: "Document Management & Viewing", icon: Eye },
    { id: "badges", title: "Status Indicators & Badges", icon: CheckCircle },
  ];

  return (
    <div>
      <Header
        title="Help & Documentation"
        subtitle="Learn how Keepr-E3tate protects and manages your digital estate"
      />

      {/* Two Column Layout */}
      <div className="flex gap-6">
        {/* Left Sidebar - Table of Contents */}
        <div className="w-80 flex-shrink-0">
          <Card className="sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--accent-dim)" }}>
                <BookOpen className="h-5 w-5" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Table of Contents
              </h3>
            </div>
            <div className="space-y-2">
              {tableOfContents.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const isOpen = openSections[item.id];

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                    style={{
                      backgroundColor: isActive ? "var(--accent-dim)" : "transparent",
                      border: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                    }}
                  >
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        backgroundColor: isActive ? "var(--accent)" : "var(--bg-surface)",
                        color: isActive ? "var(--text-inverse)" : "var(--text-muted)",
                      }}
                    >
                      {index + 1}
                    </div>
                    <Icon
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: isActive ? "var(--accent)" : "var(--text-secondary)" }}
                    />
                    <span
                      className="text-sm font-medium flex-1"
                      style={{ color: isActive ? "var(--accent)" : "var(--text-primary)" }}
                    >
                      {item.title}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 transition-transform"
                      style={{
                        color: isActive ? "var(--accent)" : "var(--text-muted)",
                        transform: isOpen ? "translateX(4px)" : "translateX(0)"
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <Card className="border-l-4" style={{ borderLeftColor: "var(--info)" }}>
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--info-bg)" }}>
              <HelpCircle className="h-5 w-5" style={{ color: "var(--info)" }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                What is Keepr-E3tate?
              </h3>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                Keepr-E3tate is a zero-knowledge digital estate orchestration platform. It securely
                stores your important information, credentials, and final wishes, then automatically
                releases them to your designated beneficiaries when configured triggers activate.
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                <strong>Key benefit:</strong> Your loved ones will have immediate access to critical
                information exactly when they need it, without lengthy legal processes or missing
                important details.
              </p>
            </div>
          </div>
            </Card>
          )}

          {/* Initial Setup Guide */}
          {activeSection === "setup" && (
            <Card className="border-l-4" style={{ borderLeftColor: "var(--accent)" }}>
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--accent-dim)" }}>
              <Rocket className="h-5 w-5" style={{ color: "var(--accent)" }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                Initial Setup Guide - Best Practices
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Follow this step-by-step guide to properly configure your digital estate. We recommend completing these steps in order.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
              >
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  Complete Your Profile
                  <ArrowRight className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>
                    Go to Profile page
                  </span>
                </h4>
                <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  Fill out your personal information, end-of-life wishes, medical directives, and final messages.
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Essential:</strong> Personal information and emergency contacts</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Important:</strong> Upload critical documents (Will, insurance, deeds) - editable documents like your Will can be updated anytime in the Vault</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Recommended:</strong> Record physical document locations</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
              >
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  Add Beneficiaries
                  <ArrowRight className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>
                    Go to Beneficiaries page
                  </span>
                </h4>
                <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  Choose who will receive access to your digital estate when triggers activate.
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Best Practice:</strong> Designate 2-3 executors for redundancy</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Tip:</strong> Choose executors who are tech-savvy and responsible</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Important:</strong> Inform beneficiaries about Keepr-E3tate (without sharing details)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
              >
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  Populate Your Vault
                  <ArrowRight className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>
                    Go to Vault page
                  </span>
                </h4>
                <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  Add records for accounts, credentials, and information your beneficiaries will need.
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Financial:</strong> Bank accounts, investment portfolios, retirement accounts</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Credentials:</strong> Important account logins, safe combinations, PINs</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Instructions:</strong> Special wishes, funeral arrangements, personal messages</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Assets:</strong> Cryptocurrency wallets, digital assets, valuables</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
              >
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  Configure Triggers
                  <ArrowRight className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>
                    Go to Triggers page
                  </span>
                </h4>
                <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  Set up automated triggers that will release your vault when needed.
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Recommended:</strong> Start with 90-day inactivity monitor</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Best Practice:</strong> Use multiple trigger types for redundancy</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Important:</strong> Test triggers before arming them</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
              >
                5
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Arm Your System & Set Reminders
                </h4>
                <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  Once everything is configured, arm your triggers to activate monitoring.
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Set calendar reminders:</strong> Review vault every 6 months</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Update after major life events:</strong> Marriage, divorce, births, deaths</span>
                  </li>
                  <li className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span><strong>Disarm when traveling:</strong> Temporarily pause during extended trips</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div
            className="mt-6 p-4 rounded-lg"
            style={{ backgroundColor: "var(--success-bg)", border: "1px solid var(--success)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              <strong>Time to Complete:</strong> Most users complete initial setup in 1-2 hours. You can save progress at any time and return later.
            </p>
          </div>
            </Card>
          )}

          {/* Help Sections */}
          {helpSections.map((section) => {
            const Icon = section.icon;
            const isOpen = openSections[section.id];

            if (activeSection !== section.id) return null;

            return (
              <Card key={section.id} className="border-l-4" style={{ borderLeftColor: "var(--accent)" }}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--accent-dim)" }}>
                    <Icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                      {section.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-6">
                  {section.content.map((item, index) => (
                    <div key={index}>
                      <h4
                        className="font-semibold mb-2 flex items-center gap-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <div
                          className="w-1 h-4 rounded"
                          style={{ backgroundColor: "var(--accent)" }}
                        />
                        {item.term}
                      </h4>
                      <p
                        className="text-sm mb-2 ml-5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.definition}
                      </p>
                      {item.details && (
                        <ul className="space-y-1 ml-5">
                          {item.details.map((detail, detailIndex) => (
                            <li
                              key={detailIndex}
                              className="text-sm flex items-start gap-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <span
                                className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                                style={{ backgroundColor: "var(--text-muted)" }}
                              />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

          {/* Status Indicator Examples */}
          {activeSection === "badges" && (
            <Card className="border-l-4" style={{ borderLeftColor: "var(--accent)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Execution Status Examples
          </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" style={{ color: "var(--success)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--success)" }}>
                Armed
              </span>
            </div>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              - Triggers are active and monitoring
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                Disarmed
              </span>
            </div>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              - Triggers are paused and will not execute
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" style={{ color: "var(--warning)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--warning)" }}>
                Testing
              </span>
            </div>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              - Monitoring conditions but not executing
            </span>
          </div>
        </div>
            </Card>
          )}

          {/* Need More Help - Always show */}
          <Card className="mt-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--info-bg)" }}>
            <HelpCircle className="h-5 w-5" style={{ color: "var(--info)" }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Need More Help?
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              If you have questions not covered in this help guide, please contact our support team
              at{" "}
              <a
                href="mailto:support@keepr-e3tate.com"
                className="font-medium"
                style={{ color: "var(--info)" }}
              >
                support@keepr-e3tate.com
              </a>
              . We're here to help ensure your digital estate is properly configured and secure.
            </p>
          </div>
        </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
