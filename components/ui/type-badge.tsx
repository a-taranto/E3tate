import { COLORS } from "@/lib/constants";
import type { RecordType } from "@/types";

interface TypeBadgeProps {
  type: RecordType;
  size?: "sm" | "md";
}

export function TypeBadge({ type, size = "sm" }: TypeBadgeProps) {
  const config = COLORS.type[type];

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
      {type}
    </span>
  );
}
