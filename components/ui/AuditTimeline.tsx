import { LucideIcon } from "lucide-react";

interface AuditEvent {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  actor: string;
  icon: LucideIcon;
}

interface AuditTimelineProps {
  events: AuditEvent[];
}

export default function AuditTimeline({ events }: AuditTimelineProps) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline Icon */}
          <div className="relative flex-shrink-0">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
            >
              <event.icon className="h-5 w-5" />
            </div>
            {index < events.length - 1 && (
              <div
                className="absolute left-1/2 top-10 h-8 w-0.5 -ml-px"
                style={{ backgroundColor: "var(--border)" }}
              />
            )}
          </div>

          {/* Event Details */}
          <div className="flex-1 pb-8">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-medium" style={{ color: "var(--text-primary)" }}>
                {event.action}
              </h4>
              <span
                className="text-xs font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                {event.timestamp}
              </span>
            </div>
            <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              {event.description}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              by {event.actor}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
