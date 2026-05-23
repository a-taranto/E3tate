import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">{title}</h1>
        {subtitle && <p className="text-text-secondary">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
