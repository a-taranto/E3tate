"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { Info, TrendingUp, CheckCircle } from "lucide-react";
import {
  calculateEstateScore,
  getEstateDataFromLocalStorage,
  type ScoreResult,
} from "@/lib/estate-score";

export default function EstateReadinessScore() {
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  useEffect(() => {
    const data = getEstateDataFromLocalStorage();
    const result = calculateEstateScore(data);
    setScoreResult(result);
  }, []);

  if (!scoreResult) {
    return null;
  }

  const { percentage, guidance, breakdown } = scoreResult;

  // Color based on score
  const getScoreColor = () => {
    if (percentage >= 80) return "var(--success)";
    if (percentage >= 50) return "var(--warning)";
    return "var(--error)";
  };

  return (
    <Card padding="lg" className="mb-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Estate Readiness Score
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Track your progress toward a complete digital estate
          </p>
        </div>
        <div className="text-right">
          <div
            className="text-4xl font-bold mb-1"
            style={{ color: getScoreColor() }}
          >
            {percentage}%
          </div>
          <div className="flex items-center gap-1 text-sm">
            {percentage === 100 ? (
              <>
                <CheckCircle
                  className="h-4 w-4"
                  style={{ color: "var(--success)" }}
                />
                <span style={{ color: "var(--success)" }}>Complete</span>
              </>
            ) : (
              <>
                <TrendingUp
                  className="h-4 w-4"
                  style={{ color: getScoreColor() }}
                />
                <span style={{ color: "var(--text-muted)" }}>In Progress</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--border)" }}
        >
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: getScoreColor(),
            }}
          />
        </div>
      </div>

      {/* Guidance */}
      <div
        className="flex items-start gap-3 p-4 rounded-lg mb-6"
        style={{
          backgroundColor: "var(--info-bg)",
          borderLeft: "3px solid var(--info)",
        }}
      >
        <Info
          className="h-5 w-5 flex-shrink-0 mt-0.5"
          style={{ color: "var(--info)" }}
        />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {guidance}
        </p>
      </div>

      {/* Breakdown (collapsible) */}
      <details className="group">
        <summary
          className="cursor-pointer text-sm font-medium list-none flex items-center justify-between"
          style={{ color: "var(--text-primary)" }}
        >
          <span>View score breakdown</span>
          <span className="text-xs group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <div className="mt-4 space-y-2">
          {breakdown.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: item.completed
                  ? "var(--success-bg)"
                  : "var(--bg-sidebar)",
              }}
            >
              <div className="flex items-center gap-2">
                {item.completed ? (
                  <CheckCircle
                    className="h-4 w-4"
                    style={{ color: "var(--success)" }}
                  />
                ) : (
                  <div
                    className="h-4 w-4 rounded-full border-2"
                    style={{ borderColor: "var(--border)" }}
                  />
                )}
                <span
                  className="text-sm"
                  style={{
                    color: item.completed
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  }}
                >
                  {item.label}
                </span>
              </div>
              <span
                className="text-sm font-medium"
                style={{
                  color: item.completed
                    ? "var(--success)"
                    : "var(--text-muted)",
                }}
              >
                {item.points}/{item.maxPoints} pts
              </span>
            </div>
          ))}
        </div>
      </details>
    </Card>
  );
}
