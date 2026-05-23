# E3tate Design System — Mandatory Rules for Claude Code

**CRITICAL: Read this BEFORE writing ANY UI code.**

This document establishes mandatory design rules. Violating these rules produces unprofessional output that damages user trust.

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ NEVER DO THIS:

```css
/* WRONG - Pure black is harsh and unprofessional */
background: #000000;
background: #000;
background: black;
background-color: rgb(0, 0, 0);

/* WRONG - Hardcoded colors without variables */
background: #1C2128;
color: #3B82F6;
border: 1px solid #333;

/* WRONG - Random dark grays */
background: #111;
background: #1a1a1a;
background: #222;
```

### ✅ ALWAYS DO THIS:

```css
/* CORRECT - Use CSS variables ONLY */
background: var(--bg-primary);
background: var(--bg-card);
color: var(--text-primary);
border: 1px solid var(--border);
```

---

## 1. COLOR SYSTEM (Mandatory CSS Variables)

**Add these to your globals.css or tailwind.config.js:**

```css
:root {
  /* ========== LIGHT MODE (Default) ========== */
  
  /* Backgrounds - Warm, not stark */
  --bg-primary: #FAFAF8;        /* Page background - warm off-white */
  --bg-secondary: #FFFFFF;      /* Card background - pure white */
  --bg-tertiary: #F5F5F3;       /* Subtle sections */
  --bg-hover: #F0F0EE;          /* Hover states */
  
  /* Text - High contrast, readable */
  --text-primary: #1A1A1A;      /* Main text - near black, not pure black */
  --text-secondary: #6B7280;    /* Secondary text - gray */
  --text-muted: #9CA3AF;        /* Muted text - light gray */
  --text-inverse: #FFFFFF;      /* Text on dark backgrounds */
  
  /* Borders - Subtle, not harsh */
  --border: #E5E5E3;            /* Default border */
  --border-strong: #D1D5DB;     /* Emphasized border */
  --border-subtle: #F0F0EE;     /* Very subtle border */
  
  /* Brand Colors - Consistent meaning */
  --accent-primary: #7C3AED;    /* Purple - primary actions */
  --accent-success: #10B981;    /* Green - success, financial */
  --accent-warning: #F59E0B;    /* Amber - warnings, crypto */
  --accent-error: #EF4444;      /* Red - errors, danger */
  --accent-info: #3B82F6;       /* Blue - info, documents */
  
  /* Category Colors - ALWAYS use these for vault categories */
  --cat-documents: #3B82F6;     /* Blue */
  --cat-documents-bg: #EFF6FF;
  --cat-wallets: #F59E0B;       /* Amber/Gold */
  --cat-wallets-bg: #FFFBEB;
  --cat-credentials: #10B981;   /* Green */
  --cat-credentials-bg: #ECFDF5;
  --cat-accounts: #8B5CF6;      /* Purple */
  --cat-accounts-bg: #F5F3FF;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* ========== DARK MODE ========== */
/* Only activate when user explicitly selects dark mode */

[data-theme="dark"] {
  /* Backgrounds - Warm darks, NEVER pure black */
  --bg-primary: #18181B;        /* Page - zinc-900, NOT #000 */
  --bg-secondary: #27272A;      /* Card - zinc-800 */
  --bg-tertiary: #3F3F46;       /* Sections - zinc-700 */
  --bg-hover: #52525B;          /* Hover - zinc-600 */
  
  /* Text */
  --text-primary: #FAFAFA;      /* Main text */
  --text-secondary: #A1A1AA;    /* Secondary - zinc-400 */
  --text-muted: #71717A;        /* Muted - zinc-500 */
  --text-inverse: #18181B;      /* Text on light backgrounds */
  
  /* Borders */
  --border: #3F3F46;            /* zinc-700 */
  --border-strong: #52525B;     /* zinc-600 */
  --border-subtle: #27272A;     /* zinc-800 */
  
  /* Category backgrounds for dark mode */
  --cat-documents-bg: rgba(59, 130, 246, 0.15);
  --cat-wallets-bg: rgba(245, 158, 11, 0.15);
  --cat-credentials-bg: rgba(16, 185, 129, 0.15);
  --cat-accounts-bg: rgba(139, 92, 246, 0.15);
}
```

---

## 2. CARD COMPONENT RULES

### Correct Card Structure:

```tsx
// ✅ CORRECT - Clean, professional card

<div className="
  bg-[var(--bg-secondary)]
  border border-[var(--border)]
  rounded-xl
  p-5
  shadow-sm
  hover:shadow-md
  hover:border-[var(--border-strong)]
  transition-all
  duration-200
">
  {/* Icon with category-specific background */}
  <div className="
    w-10 h-10
    rounded-lg
    flex items-center justify-center
    bg-[var(--cat-documents-bg)]
  ">
    <FileText className="w-5 h-5 text-[var(--cat-documents)]" />
  </div>
  
  {/* Title - primary text color */}
  <h3 className="text-[var(--text-primary)] font-semibold mt-3">
    {title}
  </h3>
  
  {/* Subtitle - secondary text color */}
  <p className="text-[var(--text-secondary)] text-sm mt-1">
    {subtitle}
  </p>
  
  {/* Tags - contained, no overflow */}
  <div className="flex flex-wrap gap-1.5 mt-3">
    {tags.slice(0, 3).map(tag => (
      <span className="
        px-2 py-0.5
        text-xs
        rounded-full
        bg-[var(--bg-tertiary)]
        text-[var(--text-secondary)]
        truncate
        max-w-[120px]
      ">
        {tag}
      </span>
    ))}
  </div>
</div>
```

### ❌ WRONG Card Patterns:

```tsx
// ❌ WRONG - Hardcoded dark colors
<div className="bg-[#1C2128] border-gray-800">

// ❌ WRONG - Pure black background
<div className="bg-black">

// ❌ WRONG - No max-width on tags (causes overflow)
<span className="px-2 py-1 text-xs">{veryLongTagName}</span>

// ❌ WRONG - Random icon colors
<FileText className="text-blue-500" />  // Why blue?
<FileText className="text-purple-500" /> // Why purple?
```

---

## 3. VAULT CATEGORY SYSTEM

**Every vault item belongs to ONE category. Use consistent colors:**

| Category | Icon | Color Variable | Use Case |
|----------|------|----------------|----------|
| **Documents** | `FileText` | `--cat-documents` (Blue) | PDFs, legal docs, certificates |
| **Wallets** | `Wallet` | `--cat-wallets` (Amber) | Crypto wallets, hardware wallets |
| **Credentials** | `Key` | `--cat-credentials` (Green) | Logins, passwords, access keys |
| **Accounts** | `Globe` | `--cat-accounts` (Purple) | Online services, social media |

```tsx
// Category config - use this EVERYWHERE
const CATEGORY_CONFIG = {
  Documents: {
    icon: FileText,
    color: 'var(--cat-documents)',
    bgColor: 'var(--cat-documents-bg)',
  },
  Wallets: {
    icon: Wallet,
    color: 'var(--cat-wallets)',
    bgColor: 'var(--cat-wallets-bg)',
  },
  Credentials: {
    icon: Key,
    color: 'var(--cat-credentials)',
    bgColor: 'var(--cat-credentials-bg)',
  },
  Accounts: {
    icon: Globe,
    color: 'var(--cat-accounts)',
    bgColor: 'var(--cat-accounts-bg)',
  },
} as const;
```

---

## 4. TYPOGRAPHY RULES

```css
/* Headings */
h1 { font-size: 1.875rem; font-weight: 700; color: var(--text-primary); }
h2 { font-size: 1.5rem; font-weight: 600; color: var(--text-primary); }
h3 { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); }
h4 { font-size: 1rem; font-weight: 500; color: var(--text-primary); }

/* Body */
.text-body { font-size: 0.875rem; color: var(--text-secondary); }
.text-small { font-size: 0.75rem; color: var(--text-muted); }

/* NEVER use pure black for text */
/* ❌ */ color: #000;
/* ✅ */ color: var(--text-primary);
```

---

## 5. TAG/BADGE RULES

### Prevent Overflow:

```tsx
// ✅ CORRECT - Tags with max-width and truncation
<span className="
  inline-flex
  items-center
  px-2.5 py-0.5
  rounded-full
  text-xs
  font-medium
  bg-[var(--bg-tertiary)]
  text-[var(--text-secondary)]
  max-w-[100px]      /* Prevent overflow */
  truncate           /* Ellipsis for long text */
">
  {tag}
</span>

// ✅ CORRECT - Limit number of visible tags
{tags.slice(0, 3).map(tag => <Tag key={tag}>{tag}</Tag>)}
{tags.length > 3 && (
  <span className="text-xs text-[var(--text-muted)]">
    +{tags.length - 3}
  </span>
)}
```

### ❌ WRONG:

```tsx
// ❌ Allows infinitely long tags
<span>{tag}</span>

// ❌ Shows ALL tags (could be 10+)
{tags.map(tag => <Tag>{tag}</Tag>)}

// ❌ Shows raw MIME types as tags
<Tag>VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT</Tag>
```

### MIME Type Handling:

```tsx
// ✅ CORRECT - Map MIME types to friendly names
const getFileTypeLabel = (mimeType: string): string => {
  const mimeMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'image/jpeg': 'Image',
    'image/png': 'Image',
  };
  return mimeMap[mimeType] || 'File';
};
```

---

## 6. PAGE BACKGROUND RULES

### Light Mode (Default):

```tsx
// ✅ CORRECT - Warm off-white background
<main className="min-h-screen bg-[var(--bg-primary)]">

// ✅ CORRECT - Using Tailwind
<main className="min-h-screen bg-stone-50">
```

### Dark Mode:

```tsx
// ✅ CORRECT - Warm dark, NOT pure black
<main className="min-h-screen bg-zinc-900">
// or
<main className="min-h-screen bg-[#18181B]">

// ❌ WRONG - Pure black
<main className="min-h-screen bg-black">
<main className="min-h-screen bg-[#000]">
```

---

## 7. SPACING & LAYOUT

```tsx
// Page container
<div className="p-6 md:p-8 max-w-7xl mx-auto">

// Section spacing
<section className="mb-8">

// Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// Card internal spacing
<div className="p-5 space-y-3">
```

---

## 8. PRE-FLIGHT CHECKLIST

**Before submitting ANY UI code, verify:**

- [ ] **No hardcoded colors** - All colors use CSS variables
- [ ] **No pure black** - Using warm darks (zinc-900, not #000)
- [ ] **Tags have max-width** - Long text truncates with ellipsis
- [ ] **Tags limited to 3** - Show "+N more" for extras
- [ ] **MIME types mapped** - Show "PDF" not "application/pdf"
- [ ] **Category icons consistent** - Using CATEGORY_CONFIG
- [ ] **Hover states exist** - Cards respond to interaction
- [ ] **Text hierarchy clear** - Title > Subtitle > Meta
- [ ] **Responsive layout** - Grid adjusts for screen size
- [ ] **No text overflow** - All containers handle long content

---

## 9. REFERENCE IMPLEMENTATIONS

### Good Card Example:

```tsx
export function VaultCard({ record }: { record: VaultRecord }) {
  const category = CATEGORY_CONFIG[record.category];
  const Icon = category.icon;
  
  return (
    <div className="
      bg-white
      dark:bg-zinc-800
      border border-stone-200
      dark:border-zinc-700
      rounded-xl
      p-5
      shadow-sm
      hover:shadow-md
      hover:border-stone-300
      dark:hover:border-zinc-600
      transition-all
      duration-200
      cursor-pointer
    ">
      {/* Category Icon */}
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: category.bgColor }}
      >
        <Icon className="w-5 h-5" style={{ color: category.color }} />
      </div>
      
      {/* Content */}
      <h3 className="text-stone-900 dark:text-zinc-100 font-semibold mt-3 line-clamp-1">
        {record.title}
      </h3>
      
      <p className="text-stone-500 dark:text-zinc-400 text-sm mt-1 line-clamp-2">
        {record.subtitle}
      </p>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {record.tags.slice(0, 3).map(tag => (
          <span 
            key={tag}
            className="
              px-2 py-0.5
              text-xs
              rounded-full
              bg-stone-100
              dark:bg-zinc-700
              text-stone-600
              dark:text-zinc-300
              max-w-[100px]
              truncate
            "
          >
            {tag}
          </span>
        ))}
        {record.tags.length > 3 && (
          <span className="text-xs text-stone-400 dark:text-zinc-500">
            +{record.tags.length - 3}
          </span>
        )}
      </div>
      
      {/* Footer */}
      <div className="
        flex justify-between items-center
        mt-4 pt-3
        border-t border-stone-100 dark:border-zinc-700
        text-xs text-stone-400 dark:text-zinc-500
      ">
        <span>{record.date}</span>
        <span>{record.beneficiaryCount} beneficiaries</span>
      </div>
    </div>
  );
}
```

---

## 10. QUICK REFERENCE

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page BG | `bg-stone-50` / `#FAFAF8` | `bg-zinc-900` / `#18181B` |
| Card BG | `bg-white` | `bg-zinc-800` / `#27272A` |
| Border | `border-stone-200` | `border-zinc-700` |
| Title | `text-stone-900` | `text-zinc-100` |
| Subtitle | `text-stone-500` | `text-zinc-400` |
| Muted | `text-stone-400` | `text-zinc-500` |

**REMEMBER: When in doubt, use Tailwind's `stone` (warm) or `zinc` (cool) palettes. NEVER use pure black (`#000`) or pure white (`#FFF`) for backgrounds.**

---

## ENFORCEMENT

If Claude Code produces UI that violates these rules, respond with:

```
DESIGN SYSTEM VIOLATION DETECTED:

❌ Issue: [describe the problem]
📍 Location: [file and line]
✅ Fix: [correct approach]

Please update the code to follow the E3tate Design System.
```
