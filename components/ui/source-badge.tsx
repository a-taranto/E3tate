import { COLORS } from "@/lib/constants";
import type { RecordSource } from "@/types";

interface SourceBadgeProps {
  source: RecordSource;
  size?: "sm" | "md";
}

export function SourceBadge({ source, size = "sm" }: SourceBadgeProps) {
  // Only show badge for profile-created records
  if (source !== "profile") {
    return null;
  }

  const config = COLORS.source.profile;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      From Profile
    </span>
  );
}
