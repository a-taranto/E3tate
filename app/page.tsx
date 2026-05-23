"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import EstateReadinessScore from "@/components/dashboard/EstateReadinessScore";
import { Card, Button, StatusIndicator, Badge } from "@/components/ui";
import {
  FileText,
  Users,
  Shield,
  Plus,
  Eye,
  Settings as SettingsIcon,
  Clock,
  ScrollText,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  // Mock data
  const willStatus = {
    exists: false, // Set to true to show "will exists" state
    lastUpdated: "3 days ago",
  };

  const vaultStats = {
    totalRecords: 24,
    lastUpdated: "2 hours ago",
    executionStatus: "armed" as const,
  };

  const quickActions = [
    { label: "Add Record", icon: Plus, href: "/vault" },
    { label: "View Vault", icon: Eye, href: "/vault" },
    { label: "Manage Beneficiaries", icon: Users, href: "/beneficiaries" },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Updated record",
      record: "Primary Bank Account",
      timestamp: "2 hours ago",
      type: "update",
    },
    {
      id: 2,
      action: "Added beneficiary",
      record: "Sarah Johnson",
      timestamp: "1 day ago",
      type: "add",
    },
    {
      id: 3,
      action: "Armed execution trigger",
      record: "Inactivity Monitor",
      timestamp: "3 days ago",
      type: "trigger",
    },
    {
      id: 4,
      action: "Created record",
      record: "Investment Portfolio Access",
      timestamp: "5 days ago",
      type: "create",
    },
  ];

  return (
    <div>
      <Header
        title="Overview"
        subtitle="Track your progress and manage your digital estate"
      />

      {/* Estate Readiness Score */}
      <EstateReadinessScore />

      {/* Complete Setup Button */}
      <Card className="mb-6 border-l-4" style={{ borderLeftColor: "var(--accent)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg mb-1" style={{ color: "var(--text-primary)" }}>
              Complete Your Estate Setup
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Follow our guided wizard to set up your digital estate step by step
            </p>
          </div>
          <Button variant="primary" onClick={() => router.push("/my-estate/about")}>
            <ArrowRight className="h-4 w-4" />
            Start Setup
          </Button>
        </div>
      </Card>

      {/* Will Status Card */}
      <Card className="mb-6 border-l-4" style={{ borderLeftColor: willStatus.exists ? "var(--accent)" : "var(--warning)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {willStatus.exists ? (
              <>
                <ScrollText className="h-6 w-6 text-accent" />
                <div>
                  <h3 className="font-medium text-lg mb-1">Your Will</h3>
                  <p className="text-sm text-text-muted">
                    Last updated {willStatus.lastUpdated}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-warning" />
                <div>
                  <h3 className="font-medium text-lg mb-1">No Will Created Yet</h3>
                  <p className="text-sm text-text-muted">
                    Create a will to ensure your wishes are documented
                  </p>
                </div>
              </>
            )}
          </div>
          <Button
            variant={willStatus.exists ? "secondary" : "primary"}
            size="sm"
            onClick={() => router.push("/will")}
          >
            {willStatus.exists ? (
              <>
                <Eye className="h-4 w-4" />
                View Will
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Will
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Execution Status Alert */}
      <Card className="mb-6 border-l-4 border-l-accent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-accent" />
            <div>
              <h3 className="font-medium text-lg mb-1">Execution Status</h3>
              <StatusIndicator status={vaultStats.executionStatus} size="md" />
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => router.push("/triggers")}>
            <SettingsIcon className="h-4 w-4" />
            Configure Triggers
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card hover className="cursor-pointer" onClick={() => router.push("/vault")}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm mb-2">Total Records</p>
              <p className="text-4xl font-semibold">{vaultStats.totalRecords}</p>
            </div>
            <FileText className="h-8 w-8 text-accent" strokeWidth={1.5} />
          </div>
          <p className="text-text-muted text-sm mt-4">
            Across 6 categories
          </p>
        </Card>

        <Card hover className="cursor-pointer" onClick={() => router.push("/beneficiaries")}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm mb-2">Beneficiaries</p>
              <p className="text-4xl font-semibold">5</p>
            </div>
            <Users className="h-8 w-8 text-accent" strokeWidth={1.5} />
          </div>
          <p className="text-text-muted text-sm mt-4">
            3 executors, 2 observers
          </p>
        </Card>

        <Card hover className="cursor-pointer" onClick={() => router.push("/activity")}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm mb-2">Last Updated</p>
              <p className="text-2xl font-semibold">{vaultStats.lastUpdated}</p>
            </div>
            <Clock className="h-8 w-8 text-accent" strokeWidth={1.5} />
          </div>
          <p className="text-text-muted text-sm mt-4">
            Auto-backup enabled
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              hover
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => router.push(action.href)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-muted">
                <action.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-medium">{action.label}</p>
                <p className="text-sm text-text-muted">View →</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push("/activity")}>
            View All →
          </Button>
        </div>
        <Card padding="none">
          <div className="divide-y divide-border">
            {recentActivity.map((activity) => {
              const getActivityRoute = () => {
                if (activity.type === "trigger") return "/triggers";
                if (activity.type === "add") return "/beneficiaries";
                return "/vault";
              };

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 hover:bg-accent-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(getActivityRoute())}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-muted">
                      {activity.type === "update" && (
                        <FileText className="h-5 w-5 text-accent" />
                      )}
                      {activity.type === "add" && (
                        <Plus className="h-5 w-5 text-accent" />
                      )}
                      {activity.type === "trigger" && (
                        <Shield className="h-5 w-5 text-accent" />
                      )}
                      {activity.type === "create" && (
                        <Plus className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-text-muted">
                        {activity.record}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-text-muted">{activity.timestamp}</p>
                </div>
              );
            })}
            {/* Activity Log Link */}
            <div
              className="p-4 text-center hover:bg-accent-muted/50 transition-colors cursor-pointer border-t"
              style={{ borderColor: "var(--border)" }}
              onClick={() => router.push("/activity")}
            >
              <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                View Complete Activity Log →
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
