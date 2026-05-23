import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon
        className="h-16 w-16 mx-auto mb-4"
        style={{ color: "var(--text-muted)" }}
        strokeWidth={1.5}
      />
      <h3 className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
