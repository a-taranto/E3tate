"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import {
  CheckCircle,
  Sparkles,
  Globe,
  Lock,
  Heart,
  DollarSign,
  Wallet,
  ScrollText,
  ArrowRight,
  Vault,
  LayoutDashboard,
} from "lucide-react";
import { getSetupSummary, processSetupServices } from "@/lib/vaultUtils";

export default function SetupCompletePage() {
  const router = useRouter();
  const [summary, setSummary] = useState({
    servicesSetUp: 0,
    credentialsStored: 0,
    wishesRecorded: 0,
    monthlySubscriptionCost: 0,
    assetsAssigned: 0,
    willStatus: "none" as "created" | "uploaded" | "none",
  });

  useEffect(() => {
    // Process all services and create vault records
    processSetupServices();

    // Get summary
    const stats = getSetupSummary();
    setSummary(stats);
  }, []);

  const handleGoToDashboard = () => {
    router.push("/");
  };

  const handleGoToVault = () => {
    router.push("/vault");
  };

  const getWillStatusLabel = () => {
    switch (summary.willStatus) {
      case "created":
        return "Created from template";
      case "uploaded":
        return "Uploaded";
      default:
        return "Not added";
    }
  };

  const getWillStatusColor = () => {
    return summary.willStatus !== "none" ? "var(--success)" : "var(--text-muted)";
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-12">
        <div
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ background: "var(--accent-gradient)" }}
        >
          <CheckCircle className="h-12 w-12" style={{ color: "var(--text-inverse)" }} />
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Setup Complete!
        </h1>
        <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
          Your digital estate is now organized and protected
        </p>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {/* Services Set Up */}
        <Card padding="md">
          <div className="text-center">
            <Globe className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--accent)" }} />
            <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {summary.servicesSetUp}
            </div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Services Set Up
            </div>
          </div>
        </Card>

        {/* Credentials Stored */}
        <Card padding="md">
          <div className="text-center">
            <Lock className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--success)" }} />
            <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {summary.credentialsStored}
            </div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Credentials Secured
            </div>
          </div>
        </Card>

        {/* Wishes Recorded */}
        <Card padding="md">
          <div className="text-center">
            <Heart className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--info)" }} />
            <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {summary.wishesRecorded}
            </div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Wishes Recorded
            </div>
          </div>
        </Card>

        {/* Subscription Cost */}
        <Card padding="md">
          <div className="text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--warning)" }} />
            <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              ${summary.monthlySubscriptionCost.toFixed(0)}
            </div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Monthly Subscriptions
            </div>
          </div>
        </Card>

        {/* Assets Assigned */}
        <Card padding="md">
          <div className="text-center">
            <Wallet className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--accent)" }} />
            <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {summary.assetsAssigned}
            </div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Assets Assigned
            </div>
          </div>
        </Card>

        {/* Will Status */}
        <Card padding="md">
          <div className="text-center">
            <ScrollText
              className="h-8 w-8 mx-auto mb-3"
              style={{ color: getWillStatusColor() }}
            />
            <div className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {getWillStatusLabel()}
            </div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Will Status
            </div>
          </div>
        </Card>
      </div>

      {/* What's Next */}
      <Card padding="lg" className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6" style={{ color: "var(--accent)" }} />
          <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            What's Next?
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--accent)", color: "var(--text-inverse)" }}>
              1
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                Review your Vault
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                All your services and assets have been added to your encrypted Vault. Review and update them anytime.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--accent)", color: "var(--text-inverse)" }}>
              2
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                Set up triggers
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Configure how and when your beneficiaries will be notified and gain access.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--accent)", color: "var(--text-inverse)" }}>
              3
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                Keep it updated
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Remember to update your estate when you add new accounts, acquire assets, or make life changes.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="primary" onClick={handleGoToDashboard} className="w-full" size="lg">
          <LayoutDashboard className="h-5 w-5" />
          Go to Dashboard
          <ArrowRight className="h-5 w-5" />
        </Button>
        <Button variant="secondary" onClick={handleGoToVault} className="w-full" size="lg">
          <Vault className="h-5 w-5" />
          View Your Vault
        </Button>
      </div>

      {/* Encouragement Message */}
      <Card padding="md" className="mt-8" style={{ backgroundColor: "var(--success-bg)" }}>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "var(--success)" }}>
            🎉 Great job! You've taken an important step in protecting your digital legacy.
          </p>
        </div>
      </Card>
    </div>
  );
}
