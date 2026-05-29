// Estate Readiness Score calculation
// Based on simplified architecture spec

import { loadBeneficiaries, loadVaultRecords, hasWill, getMinorChildren, loadWill } from "@/lib/store";

export interface EstateData {
  hasWill: boolean;
  hasExecutor: boolean;
  beneficiaryCount: number;
  vaultItemCount: number;
  itemsWithBeneficiaries: number;
  totalItems: number;
  hasProofOfLife: boolean;
  hasMinorChildren: boolean; // conditional: drives the Guardian requirement
  hasGuardian: boolean;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  percentage: number;
  guidance: string;
  breakdown: {
    label: string;
    points: number;
    maxPoints: number;
    completed: boolean;
  }[];
}

export function calculateEstateScore(data: EstateData): ScoreResult {
  const breakdown = [
    {
      label: "Will uploaded",
      points: data.hasWill ? 25 : 0,
      maxPoints: 25,
      completed: data.hasWill,
    },
    {
      label: "Executor assigned",
      points: data.hasExecutor ? 20 : 0,
      maxPoints: 20,
      completed: data.hasExecutor,
    },
    {
      label: "Beneficiaries added",
      points: data.beneficiaryCount > 0 ? 15 : 0,
      maxPoints: 15,
      completed: data.beneficiaryCount > 0,
    },
    {
      label: "Vault items added",
      points: data.vaultItemCount > 0 ? 15 : 0,
      maxPoints: 15,
      completed: data.vaultItemCount > 0,
    },
    {
      label: "Important documents stored",
      points: data.vaultItemCount >= 3 ? 10 : 0,
      maxPoints: 10,
      completed: data.vaultItemCount >= 3,
    },
    {
      label: "Items have beneficiaries",
      points:
        data.totalItems > 0 && data.itemsWithBeneficiaries === data.totalItems
          ? 10
          : 0,
      maxPoints: 10,
      completed:
        data.totalItems > 0 && data.itemsWithBeneficiaries === data.totalItems,
    },
    {
      label: "Proof of life configured",
      points: data.hasProofOfLife ? 5 : 0,
      maxPoints: 5,
      completed: data.hasProofOfLife,
    },
  ];

  // Conditional requirement: minor children ⇒ a Guardian is required (Part B
  // Clause 4). Added dynamically so it lowers the score until satisfied.
  if (data.hasMinorChildren) {
    breakdown.push({
      label: "Guardian appointed",
      points: data.hasGuardian ? 15 : 0,
      maxPoints: 15,
      completed: data.hasGuardian,
    });
  }

  const totalScore = breakdown.reduce((sum, item) => sum + item.points, 0);
  const maxScore = breakdown.reduce((sum, item) => sum + item.maxPoints, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  const guidance = getScoreGuidance(data, percentage);

  return {
    score: totalScore,
    maxScore,
    percentage,
    guidance,
    breakdown,
  };
}

function getScoreGuidance(data: EstateData, percentage: number): string {
  if (percentage === 100) {
    return "Your estate is fully prepared! Review regularly to keep it up to date.";
  }

  if (!data.hasWill) {
    return "Upload or create your will to improve your score by 25%";
  }

  if (!data.hasExecutor) {
    return "Add an executor to manage your estate";
  }

  if (data.hasMinorChildren && !data.hasGuardian) {
    return "You have minor children — appoint a Guardian on the People page";
  }

  if (data.beneficiaryCount === 0) {
    return "Add beneficiaries who will inherit your assets";
  }

  if (data.beneficiaryCount < 2) {
    return "Consider adding more beneficiaries to your estate";
  }

  if (data.vaultItemCount === 0) {
    return "Start adding items to your Digital Vault";
  }

  if (data.vaultItemCount < 3) {
    return "Add more important documents and assets to your vault";
  }

  if (data.totalItems > 0 && data.itemsWithBeneficiaries < data.totalItems) {
    const unassigned = data.totalItems - data.itemsWithBeneficiaries;
    return `Assign beneficiaries to ${unassigned} ${
      unassigned === 1 ? "item" : "items"
    } in your vault`;
  }

  if (!data.hasProofOfLife) {
    return "Configure your Proof of Life settings to complete your estate";
  }

  return "You're almost there! Complete remaining items to reach 100%";
}

export function getEstateDataFromLocalStorage(): EstateData {
  if (typeof window === "undefined") {
    return {
      hasWill: false,
      hasExecutor: false,
      beneficiaryCount: 0,
      vaultItemCount: 0,
      itemsWithBeneficiaries: 0,
      totalItems: 0,
      hasProofOfLife: false,
      hasMinorChildren: false,
      hasGuardian: false,
    };
  }

  // Will status from the unified store — a generated template will counts the
  // same as an uploaded one (both flip getWillStatus to a completed state).
  const willPresent = hasWill();

  // Beneficiaries from the unified store (same source the dashboard/beneficiaries read)
  const beneficiaries = loadBeneficiaries();
  const hasExecutor = beneficiaries.some((b) => b.role === "executor");
  const beneficiaryCount = beneficiaries.length;

  // Conditional: minor children require a Guardian (a person with the guardian
  // role, or one named in the will).
  const hasMinorChildren = getMinorChildren().length > 0;
  const hasGuardian =
    beneficiaries.some((b) => b.role === "guardian") || !!loadWill().doc?.guardians?.primary?.full_name;

  // Vault items from the unified store
  const vaultRecords = loadVaultRecords();
  const vaultItemCount = vaultRecords.length;

  // Check items with beneficiaries
  const itemsWithBeneficiaries = vaultRecords.filter(
    (r) => r.beneficiaries && r.beneficiaries.length > 0
  ).length;

  const totalItems = vaultRecords.length;

  // Check proof of life (placeholder - would check actual settings)
  const hasProofOfLife = false;

  return {
    hasWill: willPresent,
    hasExecutor,
    beneficiaryCount,
    vaultItemCount,
    itemsWithBeneficiaries,
    totalItems,
    hasProofOfLife,
    hasMinorChildren,
    hasGuardian,
  };
}
