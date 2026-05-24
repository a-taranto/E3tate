"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Card, Button, Badge, StatusIndicator } from "@/components/ui";
import { loadSettings, saveSettings, DEFAULT_SETTINGS, type AppSettings } from "@/lib/store";
import { logActivity } from "@/lib/activityLogger";
import {
  Zap,
  Clock,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Activity,
  Settings as SettingsIcon,
} from "lucide-react";

export default function TriggersPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const refresh = () => setSettings(loadSettings());
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const isArmed = settings.executionStatus === "armed";

  const toggleArmed = () => {
    const next = isArmed ? "disarmed" : "armed";
    setSettings(saveSettings({ executionStatus: next }));
    logActivity(
      next === "armed" ? "Triggers Armed" : "Triggers Disarmed",
      "trigger",
      next === "armed"
        ? "All execution triggers armed"
        : "All execution triggers disarmed"
    );
  };

  const toggleTrigger = (id: string, name: string, enabled: boolean) => {
    setSettings(
      saveSettings({ triggersEnabled: { ...settings.triggersEnabled, [id]: enabled } })
    );
    logActivity(
      enabled ? "Trigger Enabled" : "Trigger Disabled",
      "trigger",
      `${name} ${enabled ? "enabled" : "disabled"}`
    );
  };

  // Display-only mock data
  const executionStatus = {
    armedDate: "45 days ago",
    lastHeartbeat: "6 hours ago",
    nextCheckIn: "18 hours",
  };

  const triggers = [
    {
      id: 1,
      name: "Inactivity Monitor",
      type: "heartbeat",
      enabled: true,
      description: "Triggers if no activity detected for specified period",
      configuration: {
        inactivityPeriod: "90 days",
        coolingOffPeriod: "14 days",
        checkInFrequency: "24 hours",
      },
      lastTriggered: "Never",
    },
    {
      id: 2,
      name: "Manual Executor Trigger",
      type: "manual",
      enabled: true,
      description: "Allows designated executor to manually initiate execution",
      configuration: {
        requiredExecutors: 2,
        coolingOffPeriod: "7 days",
        requiresConsensus: true,
      },
      lastTriggered: "Never",
    },
    {
      id: 3,
      name: "Legal Proof Upload",
      type: "legal",
      enabled: false,
      description: "Triggers upon verified death certificate or court order",
      configuration: {
        requiredDocuments: ["Death Certificate", "Court Order"],
        verificationMethod: "Notarized",
        coolingOffPeriod: "3 days",
      },
      lastTriggered: "Never",
    },
  ];

  const isTriggerEnabled = (t: (typeof triggers)[number]) =>
    settings.triggersEnabled[String(t.id)] ?? t.enabled;
  const activeTriggerCount = triggers.filter(isTriggerEnabled).length;

  const executionTimeline = [
    {
      id: 1,
      event: "Execution Armed",
      timestamp: "45 days ago",
      status: "completed" as const,
      description: "System armed and monitoring initiated",
    },
    {
      id: 2,
      event: "Heartbeat Check",
      timestamp: "6 hours ago",
      status: "completed" as const,
      description: "Regular activity detected",
    },
    {
      id: 3,
      event: "Next Check-In Due",
      timestamp: "In 18 hours",
      status: "pending" as const,
      description: "Automated heartbeat verification",
    },
  ];

  return (
    <div>
      <Header
        title="Triggers & Execution"
        subtitle="Configure and monitor execution triggers and conditions"
      />

      {/* Execution arm/disarm control */}
      <Card className={`mb-6 border-l-4 ${isArmed ? "border-l-warning bg-warning/5" : "border-l-border"}`}>
        <div className="flex items-start gap-4">
          <AlertTriangle className={`h-6 w-6 flex-shrink-0 mt-0.5 ${isArmed ? "text-warning" : "text-text-muted"}`} />
          <div className="flex-1">
            <h3 className="font-medium text-lg mb-1">
              {isArmed ? "Critical System Armed" : "Execution Disarmed"}
            </h3>
            <p className="text-text-secondary text-sm mb-3">
              {isArmed
                ? "Your execution triggers are currently armed. Beneficiaries will receive vault access if trigger conditions are met and cooling-off periods expire."
                : "Execution is disarmed. No triggers will release vault access until you arm the system again."}
            </p>
            <Button variant={isArmed ? "danger" : "primary"} size="sm" onClick={toggleArmed}>
              <Shield className="h-4 w-4" />
              {isArmed ? "Disarm All Triggers" : "Arm All Triggers"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Execution Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-text-muted text-sm mb-2">System Status</p>
          <StatusIndicator status={settings.executionStatus} size="lg" />
          <p className="text-xs text-text-muted mt-2">
            {isArmed ? `Armed ${executionStatus.armedDate}` : "System disarmed"}
          </p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm mb-2">Last Heartbeat</p>
          <p className="text-xl font-semibold">{executionStatus.lastHeartbeat}</p>
          <div className="flex items-center gap-1 text-xs text-green-400 mt-2">
            <Activity className="h-3 w-3" />
            Active
          </div>
        </Card>
        <Card>
          <p className="text-text-muted text-sm mb-2">Next Check-In</p>
          <p className="text-xl font-semibold">{executionStatus.nextCheckIn}</p>
          <p className="text-xs text-text-muted mt-2">Automatic verification</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm mb-2">Active Triggers</p>
          <p className="text-xl font-semibold">{activeTriggerCount} / {triggers.length}</p>
          <p className="text-xs text-text-muted mt-2">Monitoring enabled</p>
        </Card>
      </div>

      {/* Trigger Configuration */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Trigger Configuration</h2>
          <Button variant="secondary" size="sm" disabled title="Coming soon">
            <SettingsIcon className="h-4 w-4" />
            Configure
          </Button>
        </div>

        <div className="space-y-4">
          {triggers.map((trigger) => {
            const enabled = isTriggerEnabled(trigger);
            return (
            <Card key={trigger.id} padding="none">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      enabled ? "bg-accent-muted" : "bg-gray-800"
                    }`}>
                      {trigger.type === "heartbeat" && (
                        <Activity className={`h-6 w-6 ${
                          enabled ? "text-accent" : "text-gray-500"
                        }`} />
                      )}
                      {trigger.type === "manual" && (
                        <Zap className={`h-6 w-6 ${
                          enabled ? "text-accent" : "text-gray-500"
                        }`} />
                      )}
                      {trigger.type === "legal" && (
                        <FileCheck className={`h-6 w-6 ${
                          enabled ? "text-accent" : "text-gray-500"
                        }`} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{trigger.name}</h3>
                        <Badge variant={enabled ? "success" : "default"}>
                          {enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary mb-3">
                        {trigger.description}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={enabled}
                      onChange={(e) => toggleTrigger(String(trigger.id), trigger.name, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>

                {/* Configuration Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  {Object.entries(trigger.configuration).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-text-muted mb-1 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-sm font-medium">{value.toString()}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" size="sm" disabled title="Coming soon">
                    Edit Configuration
                  </Button>
                  <Button variant="ghost" size="sm" disabled title="Coming soon">
                    Test Trigger
                  </Button>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      </div>

      {/* Execution Timeline */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Execution Timeline</h2>
        <Card padding="none">
          <div className="divide-y divide-border">
            {executionTimeline.map((event, index) => (
              <div key={event.id} className="p-5">
                <div className="flex items-start gap-4">
                  {/* Timeline Icon */}
                  <div className="relative">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      event.status === "completed"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-accent-muted text-accent"
                    }`}>
                      {event.status === "completed" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    {index < executionTimeline.length - 1 && (
                      <div className="absolute left-1/2 top-10 h-8 w-0.5 bg-border -ml-px" />
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{event.event}</h3>
                      <Badge
                        variant={event.status === "completed" ? "success" : "warning"}
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-1">
                      {event.description}
                    </p>
                    <p className="text-xs text-text-muted font-mono">
                      {event.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
