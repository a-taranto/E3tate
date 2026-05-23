"use client";

import { useState } from "react";
import Badge from "./Badge";

interface Beneficiary {
  id: string;
  name: string;
  email: string;
  role: "executor" | "beneficiary" | "observer";
}

interface BeneficiarySelection {
  beneficiaryId: string;
  accessScope: "full" | "partial" | "metadata";
}

interface BeneficiarySelectorProps {
  beneficiaries: Beneficiary[];
  selected: BeneficiarySelection[];
  onChange: (selected: BeneficiarySelection[]) => void;
}

export default function BeneficiarySelector({
  beneficiaries,
  selected,
  onChange,
}: BeneficiarySelectorProps) {
  const isSelected = (id: string) =>
    selected.some((s) => s.beneficiaryId === id);

  const getAccessScope = (id: string) =>
    selected.find((s) => s.beneficiaryId === id)?.accessScope || "full";

  const handleToggle = (id: string) => {
    if (isSelected(id)) {
      onChange(selected.filter((s) => s.beneficiaryId !== id));
    } else {
      onChange([...selected, { beneficiaryId: id, accessScope: "full" }]);
    }
  };

  const handleScopeChange = (id: string, scope: "full" | "partial" | "metadata") => {
    onChange(
      selected.map((s) =>
        s.beneficiaryId === id ? { ...s, accessScope: scope } : s
      )
    );
  };

  const roleConfig = {
    executor: { variant: "success" as const, label: "Executor" },
    beneficiary: { variant: "info" as const, label: "Beneficiary" },
    observer: { variant: "default" as const, label: "Observer" },
  };

  return (
    <div className="space-y-3">
      {beneficiaries.map((beneficiary) => {
        const checked = isSelected(beneficiary.id);
        const scope = getAccessScope(beneficiary.id);

        return (
          <div
            key={beneficiary.id}
            className="p-4 rounded-lg border transition-all"
            style={{
              backgroundColor: checked ? "var(--accent-dim)" : "var(--bg-card)",
              borderColor: checked ? "var(--accent)" : "var(--border)",
            }}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(beneficiary.id)}
                className="mt-1 h-5 w-5 rounded border-border text-accent focus:ring-accent focus:ring-offset-0"
                style={{
                  accentColor: "var(--accent)",
                }}
              />

              {/* Beneficiary Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {beneficiary.name}
                  </h4>
                  <Badge variant={roleConfig[beneficiary.role].variant}>
                    {roleConfig[beneficiary.role].label}
                  </Badge>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {beneficiary.email}
                </p>

                {/* Access Scope Selector */}
                {checked && (
                  <div className="mt-3">
                    <label
                      className="block text-xs font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Access Scope
                    </label>
                    <div className="flex gap-2">
                      {["full", "partial", "metadata"].map((scopeOption) => (
                        <button
                          key={scopeOption}
                          onClick={() =>
                            handleScopeChange(
                              beneficiary.id,
                              scopeOption as "full" | "partial" | "metadata"
                            )
                          }
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            scope === scopeOption
                              ? "text-primary"
                              : ""
                          }`}
                          style={{
                            backgroundColor:
                              scope === scopeOption
                                ? "var(--accent)"
                                : "var(--bg-hover)",
                            color:
                              scope === scopeOption
                                ? "var(--bg-primary)"
                                : "var(--text-secondary)",
                          }}
                        >
                          {scopeOption === "full" && "Full Access"}
                          {scopeOption === "partial" && "Partial"}
                          {scopeOption === "metadata" && "Metadata Only"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
