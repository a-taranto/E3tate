"use client";

import Header from "@/components/layout/Header";
import { Card, Button, Badge, Input } from "@/components/ui";
import {
  Shield,
  Smartphone,
  Key,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Lock,
  Database,
  FileKey,
  Activity,
  HelpCircle,
  Clock,
  Bell,
} from "lucide-react";

export default function SettingsPage() {
  // Mock data
  const securitySettings = {
    mfaEnabled: true,
    trustedDevices: 3,
    lastPasswordChange: "2 months ago",
    recoverySetup: true,
  };

  const devices = [
    {
      id: 1,
      name: "MacBook Pro",
      type: "Desktop",
      lastActive: "Active now",
      trusted: true,
    },
    {
      id: 2,
      name: "iPhone 14 Pro",
      type: "Mobile",
      lastActive: "2 hours ago",
      trusted: true,
    },
    {
      id: 3,
      name: "iPad Air",
      type: "Tablet",
      lastActive: "1 week ago",
      trusted: true,
    },
  ];

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Manage your account security and preferences"
      />

      {/* Security Overview */}
      <Card className="mb-8 border-l-4 border-l-accent">
        <div className="flex items-start gap-4">
          <Shield className="h-8 w-8 text-accent flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-lg mb-2">Security Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">MFA</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Enabled</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Devices</p>
                <span className="text-sm">{securitySettings.trustedDevices} trusted</span>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Password</p>
                <span className="text-sm">Changed {securitySettings.lastPasswordChange}</span>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Recovery</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Configured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Security */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">Account Security</h2>

        {/* Email & Password */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Lock className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-medium text-lg mb-1">Email & Password</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Manage your login credentials
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-text-muted">Email Address</p>
                    <p className="text-sm font-mono">user@example.com</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Last Password Change</p>
                    <p className="text-sm">{securitySettings.lastPasswordChange}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm">
                Change Email
              </Button>
              <Button variant="secondary" size="sm">
                Change Password
              </Button>
            </div>
          </div>
        </Card>

        {/* Multi-Factor Authentication */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Smartphone className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-medium text-lg mb-1">Multi-Factor Authentication</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Add an extra layer of security to your account
                </p>
                <Badge variant="success">Enabled</Badge>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Manage MFA
            </Button>
          </div>
        </Card>

        {/* Trusted Devices */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Key className="h-6 w-6 text-accent" />
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">Trusted Devices</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Devices that have been verified and can access your account
                </p>

                <div className="space-y-3">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary-bg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-text-muted" />
                        <div>
                          <p className="font-medium text-sm">{device.name}</p>
                          <p className="text-xs text-text-muted">
                            {device.type} • {device.lastActive}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recovery Options */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">Recovery Options</h2>

        {/* Shamir Shards */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <FileKey className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-medium text-lg mb-1">Shamir Secret Sharing</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Split your recovery key into encrypted shards for distributed recovery
                </p>
                <Badge variant="success">Configured (3 of 5 shards)</Badge>
                <p className="text-xs text-text-muted mt-2">
                  Your vault can be recovered with any 3 shards
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Reconfigure Shards
            </Button>
          </div>
        </Card>

        {/* Backup & Export */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Database className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-medium text-lg mb-1">Backup & Export</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Download encrypted backups of your vault
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-text-muted">Last Backup</p>
                    <p className="text-sm">3 days ago (Automatic)</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Backup Size</p>
                    <p className="text-sm font-mono">2.4 MB encrypted</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                Download Backup
              </Button>
              <Button variant="ghost" size="sm">
                <Upload className="h-4 w-4" />
                Restore Backup
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Proof of Life */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">Proof of Life</h2>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Activity className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-medium text-lg mb-1">Check-in Settings</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Configure how often you need to check in and what triggers vault execution
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <p className="text-sm font-medium">Check-in Frequency</p>
                      <p className="text-xs text-text-muted">How often you'll be asked to confirm you're active</p>
                    </div>
                    <select className="input w-32">
                      <option>30 days</option>
                      <option>60 days</option>
                      <option>90 days</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <p className="text-sm font-medium">Inactivity Trigger</p>
                      <p className="text-xs text-text-muted">Days without check-in before vault is released</p>
                    </div>
                    <select className="input w-32">
                      <option>90 days</option>
                      <option>120 days</option>
                      <option>180 days</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "var(--success)", backgroundColor: "var(--success-bg)" }}>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-xs text-text-muted">Next check-in: 23 days</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Bell className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-medium text-lg mb-1">Notifications</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Configure email alerts and notifications
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ borderColor: "var(--border)" }}>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">Check-in reminders</p>
                      <p className="text-xs text-text-muted">Receive email when check-in is due</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ borderColor: "var(--border)" }}>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">Activity notifications</p>
                      <p className="text-xs text-text-muted">Receive alerts for important account activity</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Log */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">Activity Log</h2>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-medium text-lg mb-1">Recent Activity</h3>
                <p className="text-sm text-text-secondary mb-4">
                  View all actions taken in your account
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => window.location.href = '/activity'}>
              View Full Log
            </Button>
          </div>
        </Card>
      </div>

      {/* Help & Support */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">Help & Support</h2>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <HelpCircle className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-medium text-lg mb-1">Documentation & Support</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Get help and learn how to use E3tate
                </p>
                <div className="space-y-2">
                  <Button variant="secondary" size="sm" onClick={() => window.location.href = '/help'}>
                    View Documentation
                  </Button>
                  <p className="text-xs text-text-muted mt-2">
                    Access guides, FAQs, and support resources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Danger Zone */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>

        <Card className="border-red-500/30">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1 text-red-400">
                Delete Account
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Permanently delete your account and all associated data. This action
                cannot be undone. All beneficiaries will be notified and lose access.
              </p>
              <div className="space-y-3">
                <Input
                  placeholder='Type "DELETE" to confirm'
                  className="max-w-md"
                />
                <Button variant="danger" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Permanently Delete Account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
