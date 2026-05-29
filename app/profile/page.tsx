"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { Card, Button } from "@/components/ui";
import { User, MapPin, Calendar, Heart, Info, ScrollText, Users } from "lucide-react";
import { loadProfile, saveProfile, type Profile } from "@/lib/store";
import { toast } from "@/components/ui/Toaster";

const MARITAL_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    dateOfBirth: "",
    address: "",
    maritalStatus: "",
    spouseName: "",
  });

  useEffect(() => {
    setProfile({ fullName: "", dateOfBirth: "", address: "", maritalStatus: "", spouseName: "", ...loadProfile() });
  }, []);

  const update = (field: keyof Profile, value: string) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    saveProfile(profile);
    toast("Profile saved");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Profile" subtitle="Your personal details, reused across your estate and will" />
      <div className="container mx-auto px-8 py-8 max-w-3xl">
        {/* Where it's used */}
        <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--info)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Enter these once here. They prefill your will wizard and any legal documents, so you never re-type them.
            </p>
          </div>
        </Card>

        {/* Basic information */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6" style={{ color: "var(--accent)" }} />
            <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Basic Information
            </h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Full Legal Name
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="John Michael Smith"
                value={profile.fullName || ""}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "var(--text-muted)" }} />
                <input
                  type="date"
                  className="input w-full pl-10"
                  value={profile.dateOfBirth || ""}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Residential Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5" style={{ color: "var(--text-muted)" }} />
                <textarea
                  className="input w-full pl-10"
                  rows={3}
                  placeholder="123 Main Street&#10;Sydney NSW 2000, Australia"
                  value={profile.address || ""}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Marital status */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-6 w-6" style={{ color: "var(--accent)" }} />
            <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Marital Status
            </h3>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {MARITAL_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors border-2"
                  style={{
                    borderColor: profile.maritalStatus === option.value ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <input
                    type="radio"
                    name="maritalStatus"
                    value={option.value}
                    checked={profile.maritalStatus === option.value}
                    onChange={(e) => update("maritalStatus", e.target.value)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            {profile.maritalStatus === "married" && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Spouse&apos;s Full Name
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Jane Doe Smith"
                  value={profile.spouseName || ""}
                  onChange={(e) => update("spouseName", e.target.value)}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Family note — children & spouse now live on the People page */}
        <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--info)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Your spouse and children are managed on the{" "}
              <button onClick={() => router.push("/people")} className="underline" style={{ color: "var(--accent)" }}>
                People
              </button>{" "}
              page, where you can also assign them gifts. Children under 18 there drive the guardian requirement.
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="secondary" onClick={() => router.push("/will/create")}>
            <ScrollText className="h-4 w-4" />
            Use in Will
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
