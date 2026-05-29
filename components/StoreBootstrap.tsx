"use client";

import { useEffect } from "react";
import { runStorageMigration, migrateEstateAssetsV1, migrateWillV1 } from "@/lib/store";
import { runModelMigrations } from "@/lib/model/migrations";

// Runs the one-time localStorage migrations as early as possible on the client,
// so legacy keys are consolidated and seed data exists before any page reads.
// The migrations are idempotent, so this is just a belt-and-suspenders trigger —
// every store read also ensures they have run.
export default function StoreBootstrap() {
  useEffect(() => {
    runStorageMigration();
    migrateEstateAssetsV1();
    migrateWillV1();
    // MetaLaw model: populate the new schedule slices from the existing data.
    runModelMigrations();
  }, []);
  return null;
}
