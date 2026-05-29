"use client";

import Header from "@/components/layout/Header";

// My Estate sections are navigated from the main sidebar's "My Estate" group.
// This layout just frames the section content.
export default function MyEstateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="My Estate" subtitle="Your complete net-worth picture — update any section anytime" />
      <div className="container mx-auto px-8 py-8 max-w-4xl">{children}</div>
    </div>
  );
}
