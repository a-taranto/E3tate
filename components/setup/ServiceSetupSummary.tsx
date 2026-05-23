"use client";

import { Card, Button } from "@/components/ui";
import { CheckCircle, ArrowRight, Plus } from "lucide-react";
import { getServiceById } from "@/lib/services";

interface ServiceSetupSummaryProps {
  serviceIds: string[];
  setupData: { [serviceId: string]: any };
  onContinue: () => void;
  onAddMore: () => void;
}

export default function ServiceSetupSummary({
  serviceIds,
  setupData,
  onContinue,
  onAddMore,
}: ServiceSetupSummaryProps) {
  const services = serviceIds.map((id) => {
    const service = getServiceById(id);
    const data = setupData[id] || {};
    return {
      id,
      name: service?.name || "Unknown Service",
      logo: service?.logo,
      hasCredentials: !!data.credentials?.username || !!data.credentials?.password,
      wish: data.wish,
      subscription: data.subscription,
    };
  });

  const withCredentials = services.filter((s) => s.hasCredentials).length;
  const withWishes = services.filter((s) => s.wish?.action).length;
  const totalCost = services
    .filter((s) => s.subscription?.cost)
    .reduce((sum, s) => sum + parseFloat(s.subscription.cost || "0"), 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircle
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: "var(--success)" }}
        />
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Online Accounts Set Up
        </h2>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          You've configured {services.length} {services.length === 1 ? "service" : "services"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card padding="md" className="text-center">
          <p
            className="text-3xl font-bold mb-1"
            style={{ color: "var(--accent)" }}
          >
            {services.length}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {services.length === 1 ? "Service" : "Services"}
          </p>
        </Card>
        <Card padding="md" className="text-center">
          <p
            className="text-3xl font-bold mb-1"
            style={{ color: "var(--success)" }}
          >
            {withCredentials}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Credentials Stored
          </p>
        </Card>
        <Card padding="md" className="text-center">
          <p
            className="text-3xl font-bold mb-1"
            style={{ color: "var(--info)" }}
          >
            {withWishes}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Wishes Set
          </p>
        </Card>
      </div>

      {/* Subscription tracking */}
      {totalCost > 0 && (
        <Card padding="md" className="mb-8">
          <div className="flex items-center justify-between">
            <span style={{ color: "var(--text-secondary)" }}>
              Total Monthly Subscriptions
            </span>
            <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              ${totalCost.toFixed(2)}/mo
            </span>
          </div>
        </Card>
      )}

      {/* Service list */}
      <Card padding="md" className="mb-8">
        <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Configured Services
        </h3>
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center gap-3 py-2 border-b last:border-0"
              style={{ borderColor: "var(--border)" }}
            >
              {service.logo && (
                <img src={service.logo} alt="" className="w-6 h-6" />
              )}
              <span className="flex-1" style={{ color: "var(--text-primary)" }}>
                {service.name}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {service.wish?.action === "transfer"
                  ? `→ ${service.wish.transferTo}`
                  : service.wish?.action === "delete"
                  ? "Delete"
                  : service.wish?.action === "memorialize"
                  ? "Memorialize"
                  : service.wish?.action || "No action set"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="secondary" onClick={onAddMore}>
          <Plus className="h-4 w-4" />
          Add More Services
        </Button>
        <Button variant="primary" onClick={onContinue} className="flex-1">
          Continue to Assets
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
