"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { User, Users, Globe, Wallet, ScrollText, Check } from "lucide-react";

const ESTATE_STEPS = [
  { id: "about", path: "/my-estate/about", label: "You", icon: User },
  { id: "people", path: "/my-estate/people", label: "People", icon: Users },
  { id: "online", path: "/my-estate/online", label: "Online", icon: Globe },
  { id: "assets", path: "/my-estate/assets", label: "Assets", icon: Wallet },
  { id: "will", path: "/my-estate/will", label: "Will", icon: ScrollText },
];

export default function MyEstateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine current step
  const currentStepIndex = ESTATE_STEPS.findIndex((step) => pathname.startsWith(step.path));
  const currentStep = ESTATE_STEPS[currentStepIndex] || ESTATE_STEPS[0];

  // For demo purposes, mark completed steps (in real app, check localStorage)
  const completedSteps = new Set<string>();

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="My Estate"
        subtitle="Manage your digital estate in one place"
      />

      <div className="container mx-auto px-8 py-8 max-w-6xl">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Connection Line */}
            <div
              className="absolute top-6 left-0 right-0 h-0.5"
              style={{ backgroundColor: "var(--border)", zIndex: 0 }}
            />

            {ESTATE_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = pathname.startsWith(step.path);
              const isCompleted = completedSteps.has(step.id);
              const isPast = index < currentStepIndex;

              return (
                <Link
                  key={step.id}
                  href={step.path}
                  className="flex flex-col items-center gap-2 relative z-10"
                  style={{ flex: 1 }}
                >
                  {/* Circle */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      border: `3px solid ${
                        isActive || isCompleted || isPast ? "var(--accent)" : "var(--border)"
                      }`,
                      color: isActive || isCompleted || isPast
                        ? "var(--accent)"
                        : "var(--text-muted)",
                    }}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isActive
                        ? "var(--accent)"
                        : isCompleted || isPast
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    }}
                  >
                    {step.label}
                  </span>

                  {/* Step Number (mobile) */}
                  <span className="text-xs md:hidden" style={{ color: "var(--text-muted)" }}>
                    Step {index + 1}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
