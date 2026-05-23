"use client";

import { useEffect } from "react";
import { runStorageMigration } from "@/lib/store";

// Runs the one-time localStorage migration as early as possible on the client,
// so legacy keys are consolidated and seed data exists before any page reads.
// The migration is idempotent, so this is just a belt-and-suspenders trigger —
// every store read also ensures it has run.
export default function StoreBootstrap() {
  useEffect(() => {
    runStorageMigration();
  }, []);
  return null;
}
