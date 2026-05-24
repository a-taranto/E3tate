"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadSettings, getCheckInStatus } from "@/lib/store";
import {
  LayoutDashboard,
  Vault,
  Users,
  Zap,
  User,
  History,
  Settings,
  Shield,
  HelpCircle,
  ScrollText,
  Menu,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "My Estate", href: "/my-estate/about", icon: User },
  { name: "Will", href: "/will", icon: ScrollText },
  { name: "Vault", href: "/vault", icon: Vault },
  { name: "Beneficiaries", href: "/beneficiaries", icon: Users },
  { name: "Triggers", href: "/triggers", icon: Zap },
  { name: "Activity", href: "/activity", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [armed, setArmed] = useState(true);
  const [checkInLabel, setCheckInLabel] = useState("");
  const [profileName, setProfileName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const s = loadSettings();
      setArmed(s.executionStatus === "armed");
      const ci = getCheckInStatus();
      const overdueDays = Math.abs(ci.daysRemaining);
      setCheckInLabel(
        ci.overdue
          ? `Check-in overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`
          : `Next check-in: ${ci.nextDate}`
      );
      try {
        const info = JSON.parse(localStorage.getItem("setup_personal_info") || "{}");
        setProfileName(info.fullName || "");
      } catch {
        setProfileName("");
      }
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, [pathname]);

  const initials =
    profileName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <>
      {/* Mobile hamburger (hidden while the drawer is open) */}
      {!open && (
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="fixed top-3 left-3 z-50 rounded-md p-2 md:hidden"
          style={{
            backgroundColor: "var(--bg-sidebar)",
            color: "var(--text-inverse)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r transform transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--bg-sidebar)",
          borderColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div
          className="flex h-16 items-center gap-3 border-b px-6"
          style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <div
            className="p-1.5 rounded-lg"
            style={{ background: "var(--accent-gradient)" }}
          >
            <Shield className="h-5 w-5" style={{ color: "var(--text-inverse)" }} strokeWidth={2} />
          </div>
          <div>
            <h1
              className="text-lg font-semibold tracking-tight"
              style={{ color: "var(--text-inverse)" }}
            >
              Keepr<span style={{ color: "var(--accent)" }}>-E3tate</span>
            </h1>
            <p
              className="text-xs font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              Zero-knowledge
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/") ||
                  (item.href.startsWith("/my-estate") && pathname.startsWith("/my-estate"));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? "var(--accent-dim)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-inverse)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "var(--bg-sidebar-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Proof of Life Status */}
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: armed ? "var(--success)" : "var(--text-muted)" }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Proof of Life
            </span>
            <span
              className="text-xs font-semibold ml-auto"
              style={{ color: armed ? "var(--success)" : "var(--text-muted)" }}
            >
              {armed ? "Active" : "Paused"}
            </span>
          </div>
          <p className="text-xs" style={{ color: armed ? "var(--text-muted)" : "var(--warning)" }}>
            {checkInLabel}
          </p>
        </div>

        {/* Footer */}
        <div
          className="border-t p-4"
          style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm"
              style={{
                background: "var(--accent-gradient)",
                color: "var(--text-inverse)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--text-inverse)" }}
              >
                {profileName || "Your Account"}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {profileName ? "Estate owner" : "Setup incomplete"}
              </p>
            </div>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}
