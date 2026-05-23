"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, Badge, Button, Input } from "@/components/ui";
import {
  History,
  User,
  Vault,
  Shield,
  Edit,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  Download,
  Search,
  Filter,
  Clock,
} from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  category: "profile" | "vault" | "beneficiary" | "trigger" | "settings" | "system";
  description: string;
  icon: any;
  metadata?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
  };
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    // Load activity log from localStorage
    const loadActivities = () => {
      const savedActivities = localStorage.getItem("activityLog");
      if (savedActivities) {
        setActivities(JSON.parse(savedActivities));
      } else {
        // Initialize with welcome message
        const initialLog: ActivityLog[] = [
          {
            id: "init-1",
            timestamp: new Date().toISOString(),
            action: "Account Created",
            category: "system",
            description: "Your Keepr-E3tate account has been created. All changes will be tracked here.",
            icon: Shield,
          },
        ];
        setActivities(initialLog);
        localStorage.setItem("activityLog", JSON.stringify(initialLog));
      }
    };

    loadActivities();

    // Listen for new activity logs
    const handleActivityLogged = () => {
      loadActivities();
    };

    window.addEventListener("activityLogged", handleActivityLogged);

    return () => {
      window.removeEventListener("activityLogged", handleActivityLogged);
    };
  }, []);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case "profile":
        return User;
      case "vault":
        return Vault;
      case "beneficiary":
        return User;
      case "trigger":
        return Shield;
      case "settings":
        return Edit;
      default:
        return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "profile":
        return "var(--type-identity)";
      case "vault":
        return "var(--type-documents)";
      case "beneficiary":
        return "var(--role-beneficiary)";
      case "trigger":
        return "var(--accent)";
      case "settings":
        return "var(--text-secondary)";
      default:
        return "var(--text-muted)";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportActivityLog = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `keepr-activity-log-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || activity.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCount = (category: string) => {
    return activities.filter((a) => a.category === category).length;
  };

  return (
    <div>
      <Header
        title="Activity Log"
        subtitle="Complete audit trail of all changes to your digital estate"
        action={
          <Button variant="secondary" onClick={exportActivityLog}>
            <Download className="h-4 w-4" />
            Export Log
          </Button>
        }
      />

      {/* Info Card */}
      <Card className="mb-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
        <div className="flex items-start gap-4">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: "var(--info-bg)" }}
          >
            <History className="h-5 w-5" style={{ color: "var(--info)" }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Comprehensive Activity Tracking
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Every change you make is automatically logged and encrypted. This audit trail helps you
              track modifications and provides transparency for executors. All logs are included when
              the vault is triggered.
            </p>
          </div>
        </div>
      </Card>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search activity..."
            className="input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={filterCategory === "all" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setFilterCategory("all")}
        >
          All ({activities.length})
        </Button>
        <Button
          variant={filterCategory === "profile" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setFilterCategory("profile")}
        >
          <User className="h-4 w-4" />
          Profile ({categoryCount("profile")})
        </Button>
        <Button
          variant={filterCategory === "vault" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setFilterCategory("vault")}
        >
          <Vault className="h-4 w-4" />
          Vault ({categoryCount("vault")})
        </Button>
        <Button
          variant={filterCategory === "beneficiary" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setFilterCategory("beneficiary")}
        >
          <User className="h-4 w-4" />
          Beneficiaries ({categoryCount("beneficiary")})
        </Button>
        <Button
          variant={filterCategory === "trigger" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setFilterCategory("trigger")}
        >
          <Shield className="h-4 w-4" />
          Triggers ({categoryCount("trigger")})
        </Button>
        <Button
          variant={filterCategory === "system" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setFilterCategory("system")}
        >
          <FileText className="h-4 w-4" />
          System ({categoryCount("system")})
        </Button>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => {
            const Icon = getIconForCategory(activity.category);
            const color = getCategoryColor(activity.category);

            return (
              <Card key={activity.id} hover padding="none">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Timeline Icon */}
                    <div className="relative">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      {index < filteredActivities.length - 1 && (
                        <div
                          className="absolute left-1/2 top-10 h-8 w-0.5 -ml-px"
                          style={{ backgroundColor: "var(--border)" }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3
                          className="font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {activity.action}
                        </h3>
                        <Badge
                          className="text-xs capitalize"
                          style={{
                            backgroundColor: `${color}20`,
                            color: color,
                          }}
                        >
                          {activity.category}
                        </Badge>
                      </div>
                      <p
                        className="text-sm mb-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {activity.description}
                      </p>

                      {/* Metadata */}
                      {activity.metadata && (
                        <div
                          className="text-xs p-2 rounded mt-2"
                          style={{
                            backgroundColor: "var(--bg-surface)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {activity.metadata.field && (
                            <div>
                              <strong>Field:</strong> {activity.metadata.field}
                            </div>
                          )}
                          {activity.metadata.oldValue && (
                            <div>
                              <strong>Previous:</strong> {activity.metadata.oldValue}
                            </div>
                          )}
                          {activity.metadata.newValue && (
                            <div>
                              <strong>New:</strong> {activity.metadata.newValue}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 mt-2">
                        <Clock
                          className="h-3 w-3"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <span
                          className="text-xs font-mono"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="text-center py-12">
            <History
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: "var(--text-muted)" }}
            />
            <h3
              className="text-xl font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No activity found
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>
              {searchQuery
                ? `No activities match "${searchQuery}"`
                : "Start making changes to see your activity log"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
