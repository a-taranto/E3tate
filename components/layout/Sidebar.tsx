"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadSettings, getCheckInStatus } from "@/lib/store";
import { SERVICE_CATEGORIES } from "@/lib/services";
import {
  LayoutDashboard,
  Vault,
  Zap,
  User,
  History,
  Settings,
  Shield,
  HelpCircle,
  Menu,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type NavNode = {
  name: string;
  href: string;
  icon?: LucideIcon;
  children?: NavNode[];
};

// Top-level nav supports nested, expandable groups (My Estate, and Online &
// Digital within it). Other pages can gain sub-menus the same way.
const navigation: NavNode[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  // Vault = the inventory/"wallet": you add the details of everything you hold.
  {
    name: "Vault",
    href: "/vault",
    icon: Vault,
    children: [
      { name: "Assets", href: "/vault/assets" },
      { name: "Liabilities", href: "/vault/liabilities" },
      {
        name: "Accounts & Online",
        href: "/vault/online",
        children: SERVICE_CATEGORIES.map((c) => ({
          name: c.label,
          href: `/vault/online#${c.id}`,
        })),
      },
      { name: "Documents", href: "/vault" },
    ],
  },
  // My Estate = the plan: who gets what, read from the Vault inventory.
  {
    name: "My Estate",
    href: "/people",
    icon: User,
    children: [
      { name: "People", href: "/people" },
      { name: "Specific Gifts", href: "/my-estate/gifts" },
      { name: "Cash Legacies", href: "/my-estate/legacies" },
      { name: "Residuary Estate", href: "/my-estate/residuary" },
      { name: "Digital Register", href: "/my-estate/digital" },
      { name: "Testamentary Trust", href: "/my-estate/trust" },
      { name: "Guardian & Wishes", href: "/my-estate/wishes" },
      { name: "Will", href: "/will" },
    ],
  },
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [currentHash, setCurrentHash] = useState("");

  // Track the URL hash so only the matching sub-item (e.g. a category section)
  // highlights — usePathname() excludes the hash.
  useEffect(() => {
    const update = () => setCurrentHash(typeof window !== "undefined" ? window.location.hash.slice(1) : "");
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);

  const hrefMatches = (href: string) => {
    const [base, hash] = href.split("#");
    if (base === "/") return pathname === "/";
    const pathOk = pathname === base || pathname.startsWith(base + "/");
    if (!pathOk) return false;
    // A hash link is active only when its hash matches the current one; a plain
    // link is active on any path match.
    return hash ? currentHash === hash : true;
  };
  const isDescendantActive = (node: NavNode): boolean =>
    hrefMatches(node.href) || (node.children?.some(isDescendantActive) ?? false);
  const isGroupExpanded = (node: NavNode) =>
    expandedGroups[node.href] ?? isDescendantActive(node);

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

  const renderNode = (node: NavNode, depth: number) => {
    const Icon = node.icon;
    const hasChildren = !!node.children?.length;
    const active = hrefMatches(node.href);
    const expanded = hasChildren && isGroupExpanded(node);
    return (
      <div key={`${node.href}-${node.name}`}>
        <div className="flex items-center">
          <Link
            href={node.href}
            onClick={() => {
              setOpen(false);
              // Next's hash navigation doesn't reliably fire `hashchange`, so
              // update the active hash + scroll directly. (Cross-page loads are
              // handled by the target page reading location.hash on mount.)
              const hash = node.href.split("#")[1];
              if (hash) {
                setCurrentHash(hash);
                setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
              }
            }}
            className="flex-1 flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors min-w-0"
            style={{
              paddingLeft: `${12 + depth * 16}px`,
              paddingRight: "8px",
              backgroundColor: active ? "var(--accent-dim)" : "transparent",
              color: active ? "var(--accent)" : depth > 0 ? "var(--text-muted)" : "var(--text-inverse)",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.backgroundColor = "var(--bg-sidebar-hover)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {Icon ? (
              <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "currentColor", opacity: 0.45 }} />
            )}
            <span className="truncate">{node.name}</span>
          </Link>
          {hasChildren && (
            <button
              type="button"
              onClick={() => setExpandedGroups((g) => ({ ...g, [node.href]: !isGroupExpanded(node) }))}
              className="p-1.5 mr-1 rounded-md flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
              aria-label={`Toggle ${node.name}`}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>
        {hasChildren && expanded && (
          <div className="mt-1 space-y-1">{node.children!.map((c) => renderNode(c, depth + 1))}</div>
        )}
      </div>
    );
  };

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

        {/* Navigation — supports nested, expandable groups */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((node) => renderNode(node, 0))}
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
          <Link href="/profile" className="flex items-center gap-3">
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
                {profileName ? "Profile & family" : "Set up your profile"}
              </p>
            </div>
          </Link>
        </div>
      </div>
      </aside>
    </>
  );
}
