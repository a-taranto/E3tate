"use client";

// Generic inline editor for one Digital Register section (a list of items with
// the same field shape). Driven by a declarative field config so all five list
// sections share one well-tested form. Fields marked `secretGuarded` are run
// through scanForSecret on save — the register records WHERE access lives, never
// the secret itself.

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { Plus, Pencil, Trash2, Check, X, type LucideIcon } from "lucide-react";
import { scanForSecret } from "@/lib/model/secretGuard";

export type FieldType = "text" | "number" | "select" | "textarea";

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  secretGuarded?: boolean;
  half?: boolean; // render in the 2-column grid
}

export interface RegisterItem {
  id: string;
  [key: string]: unknown;
}

interface Props {
  title: string;
  icon?: LucideIcon;
  description?: string;
  items: RegisterItem[];
  fields: FieldDef[];
  primaryKey: string; // headline field for each row
  secondaryKeys?: string[]; // small muted fields under the headline
  addLabel?: string;
  onAdd: (item: Record<string, unknown>) => void;
  onUpdate: (id: string, item: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}

const blankForm = (fields: FieldDef[]): Record<string, string> =>
  Object.fromEntries(fields.map((f) => [f.key, ""]));

export default function RegisterSection({
  title,
  icon: Icon,
  description,
  items,
  fields,
  primaryKey,
  secondaryKeys = [],
  addLabel = "Add",
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  // editing = "new" while adding, an item id while editing, null when idle.
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(blankForm(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const startAdd = () => {
    setForm(blankForm(fields));
    setErrors({});
    setEditing("new");
  };
  const startEdit = (item: RegisterItem) => {
    setForm(
      Object.fromEntries(fields.map((f) => [f.key, item[f.key] != null ? String(item[f.key]) : ""]))
    );
    setErrors({});
    setEditing(item.id);
  };
  const cancel = () => {
    setEditing(null);
    setErrors({});
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const val = (form[f.key] || "").trim();
      if (f.required && !val) next[f.key] = "Required";
      if (f.secretGuarded && val) {
        const scan = scanForSecret(val);
        if (!scan.ok) next[f.key] = scan.reason!;
      }
    }
    return next;
  };

  const save = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // Coerce values: numbers → number, blanks → undefined so we don't persist "".
    const item: Record<string, unknown> = {};
    for (const f of fields) {
      const val = (form[f.key] || "").trim();
      if (!val) continue;
      item[f.key] = f.type === "number" ? Number(val) : val;
    }
    if (editing === "new") onAdd(item);
    else if (editing) onUpdate(editing, item);
    setEditing(null);
  };

  const renderField = (f: FieldDef) => {
    const err = errors[f.key];
    const common = {
      className: `input w-full${err ? " border-red-400" : ""}`,
      value: form[f.key] || "",
      placeholder: f.placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((s) => ({ ...s, [f.key]: e.target.value })),
    };
    return (
      <div key={f.key} className={f.type === "textarea" || !f.half ? "sm:col-span-2" : ""}>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          {f.label}
          {f.required && <span style={{ color: "var(--error)" }}> *</span>}
        </label>
        {f.type === "select" ? (
          <select {...common}>
            <option value="">Select…</option>
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : f.type === "textarea" ? (
          <textarea {...common} rows={2} />
        ) : (
          <input {...common} type={f.type === "number" ? "number" : "text"} />
        )}
        {err && (
          <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
            {err}
          </p>
        )}
      </div>
    );
  };

  const formCard = (
    <Card padding="md" className="mb-3" style={{ borderColor: "var(--accent)", borderWidth: "1px" }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">{fields.map(renderField)}</div>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={save}>
          <Check className="h-4 w-4" />
          {editing === "new" ? "Add" : "Save"}
        </Button>
        <Button variant="ghost" size="sm" onClick={cancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </Card>
  );

  return (
    <Card padding="lg" className="mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 min-w-0">
          {Icon && <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />}
          <div className="min-w-0">
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {title} {items.length > 0 && <span style={{ color: "var(--text-muted)" }}>({items.length})</span>}
            </h3>
            {description && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {description}
              </p>
            )}
          </div>
        </div>
        {editing !== "new" && (
          <Button variant="secondary" size="sm" onClick={startAdd} className="flex-shrink-0 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      {editing === "new" && formCard}

      {items.length === 0 && editing !== "new" ? (
        <p className="text-sm py-2" style={{ color: "var(--text-muted)" }}>
          None recorded yet.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) =>
            editing === item.id ? (
              <div key={item.id}>{formCard}</div>
            ) : (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg"
                style={{ backgroundColor: "var(--bg-surface)" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {String(item[primaryKey] || "Untitled")}
                  </p>
                  {secondaryKeys.length > 0 && (
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {secondaryKeys
                        .map((k) => item[k])
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(item)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    aria-label="Delete"
                    style={{ color: "var(--error)" }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </Card>
  );
}
