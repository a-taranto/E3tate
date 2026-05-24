interface StatusIndicatorProps {
  status: "draft" | "armed" | "disarmed" | "triggered" | "active" | "pending" | "completed";
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function StatusIndicator({
  status,
  label,
  size = "md",
}: StatusIndicatorProps) {
  const statusConfig = {
    draft: { color: "bg-gray-500", label: "Draft" },
    armed: { color: "bg-accent", label: "Armed" },
    disarmed: { color: "bg-gray-500", label: "Disarmed" },
    triggered: { color: "bg-warning", label: "Triggered" },
    active: { color: "bg-green-500", label: "Active" },
    pending: { color: "bg-yellow-500", label: "Pending" },
    completed: { color: "bg-blue-500", label: "Completed" },
  };

  const sizeStyles = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`${sizeStyles[size]} ${config.color} rounded-full animate-pulse`} />
      <span className="text-sm text-text-secondary">{displayLabel}</span>
    </div>
  );
}
