"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Will", href: "/will", icon: ScrollText },
  { name: "Vault", href: "/vault", icon: Vault },
  { name: "Beneficiaries", href: "/beneficiaries", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 border-r"
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
            const isActive = pathname === item.href || (item.href === "/my-estate/about" && pathname.startsWith("/my-estate"));
            return (
              <Link
                key={item.name}
                href={item.href}
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
              style={{ backgroundColor: "var(--success)" }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Proof of Life
            </span>
            <span className="text-xs font-semibold ml-auto" style={{ color: "var(--success)" }}>
              Active
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Next check-in: 23 days
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
              U
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--text-inverse)" }}
              >
                User Account
              </p>
              <p
                className="text-xs font-mono truncate"
                style={{ color: "var(--text-muted)" }}
              >
                user@example.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
