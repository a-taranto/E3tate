# URGENT: Fix Vault Page Design Issues

## Current Problems (from screenshot)

1. **Pure black background** — Page uses `#000` or near-black, looks harsh
2. **Tag overflow** — "VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT" breaking layout
3. **Inconsistent icons** — Same document icon for everything, random colors
4. **Low contrast** — Dark cards on dark background hard to distinguish
5. **No visual hierarchy** — Everything looks the same weight
6. **"(Legacy)" tags** — Confusing, should be removed or renamed

---

## IMMEDIATE FIXES REQUIRED

### Fix 1: Page Background

```tsx
// ❌ CURRENT (wrong)
<div className="bg-black min-h-screen">
// or
<div className="bg-[#000] min-h-screen">

// ✅ CHANGE TO (light mode default)
<div className="bg-stone-50 min-h-screen">

// ✅ OR (dark mode with warm dark)
<div className="bg-zinc-900 min-h-screen">
```

### Fix 2: Card Background

```tsx
// ❌ CURRENT (wrong) - too dark, no contrast
<div className="bg-[#1C2128] rounded-xl">

// ✅ CHANGE TO (light mode)
<div className="bg-white border border-stone-200 rounded-xl shadow-sm">

// ✅ OR (dark mode)
<div className="bg-zinc-800 border border-zinc-700 rounded-xl">
```

### Fix 3: MIME Type Tags

```tsx
// ❌ CURRENT (wrong) - raw MIME type shown
<span>VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT</span>

// ✅ CHANGE TO - Map to friendly names
const getFileTypeLabel = (mimeType: string): string => {
  if (mimeType.includes('wordprocessing')) return 'Word';
  if (mimeType.includes('spreadsheet')) return 'Excel';
  if (mimeType.includes('presentation')) return 'PowerPoint';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('image')) return 'Image';
  return 'Document';
};

// Then use:
<span className="px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-600">
  {getFileTypeLabel(record.fileType)}
</span>
```

### Fix 4: Tag Overflow Prevention

```tsx
// ❌ CURRENT (wrong) - no limits
<div className="flex flex-wrap gap-1">
  {record.tags.map(tag => (
    <span className="...">{tag}</span>
  ))}
</div>

// ✅ CHANGE TO - limit tags + truncate
<div className="flex flex-wrap gap-1.5">
  {record.tags
    .filter(tag => !tag.includes('VND.')) // Filter out MIME types
    .filter(tag => !tag.includes('(Legacy)')) // Filter out legacy tags
    .slice(0, 3) // Max 3 tags
    .map(tag => (
      <span 
        key={tag}
        className="
          px-2 py-0.5 
          text-xs 
          rounded-full 
          bg-stone-100 
          text-stone-600
          max-w-[100px]
          truncate
        "
      >
        {tag}
      </span>
    ))
  }
  {record.tags.length > 3 && (
    <span className="text-xs text-stone-400">+{record.tags.length - 3}</span>
  )}
</div>
```

### Fix 5: Category-Based Icons

```tsx
// ❌ CURRENT (wrong) - same icon for everything
<FileText className="text-blue-500" />

// ✅ CHANGE TO - category-specific icons and colors
const CATEGORY_CONFIG = {
  Documents: { icon: FileText, color: '#3B82F6', bg: '#EFF6FF' },
  Wallets: { icon: Wallet, color: '#F59E0B', bg: '#FFFBEB' },
  Credentials: { icon: Key, color: '#10B981', bg: '#ECFDF5' },
  Accounts: { icon: Globe, color: '#8B5CF6', bg: '#F5F3FF' },
  Financial: { icon: Building2, color: '#10B981', bg: '#ECFDF5' },
  Assets: { icon: Home, color: '#F59E0B', bg: '#FFFBEB' },
  Identity: { icon: User, color: '#8B5CF6', bg: '#F5F3FF' },
  Instructions: { icon: ScrollText, color: '#EC4899', bg: '#FDF2F8' },
};

// Usage:
const config = CATEGORY_CONFIG[record.type] || CATEGORY_CONFIG.Documents;
const Icon = config.icon;

<div 
  className="w-10 h-10 rounded-lg flex items-center justify-center"
  style={{ backgroundColor: config.bg }}
>
  <Icon className="w-5 h-5" style={{ color: config.color }} />
</div>
```

### Fix 6: Remove "(Legacy)" Tags

```tsx
// ❌ CURRENT - showing "(Legacy)" suffix
type: "Assets (Legacy)"
type: "Financial (Legacy)"

// ✅ CHANGE TO - clean type names
// In your data transformation or display:
const cleanType = record.type.replace(' (Legacy)', '');
```

---

## COMPLETE FIXED CARD COMPONENT

```tsx
// components/vault/VaultCard.tsx

import { 
  FileText, Wallet, Key, Globe, Building2, 
  Home, User, ScrollText, Calendar, Users 
} from 'lucide-react';

type RecordType = 
  | 'Documents' | 'Wallets' | 'Credentials' | 'Accounts'
  | 'Financial' | 'Assets' | 'Identity' | 'Instructions';

interface VaultRecord {
  id: string;
  title: string;
  subtitle?: string;
  type: RecordType;
  tags: string[];
  date: string;
  beneficiaryCount: number;
  fileType?: string;
}

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  Documents: { icon: FileText, color: '#3B82F6', bg: '#EFF6FF' },
  Wallets: { icon: Wallet, color: '#F59E0B', bg: '#FFFBEB' },
  Credentials: { icon: Key, color: '#10B981', bg: '#ECFDF5' },
  Accounts: { icon: Globe, color: '#8B5CF6', bg: '#F5F3FF' },
  Financial: { icon: Building2, color: '#10B981', bg: '#ECFDF5' },
  Assets: { icon: Home, color: '#F59E0B', bg: '#FFFBEB' },
  Identity: { icon: User, color: '#8B5CF6', bg: '#F5F3FF' },
  Instructions: { icon: ScrollText, color: '#EC4899', bg: '#FDF2F8' },
};

// Map MIME types to friendly labels
const getFileTypeLabel = (mimeType?: string): string | null => {
  if (!mimeType) return null;
  if (mimeType.includes('wordprocessing')) return 'Word';
  if (mimeType.includes('spreadsheet')) return 'Excel';
  if (mimeType.includes('presentation')) return 'PPT';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('image')) return 'Image';
  return null;
};

// Clean tag for display
const cleanTag = (tag: string): string | null => {
  // Skip MIME types
  if (tag.includes('VND.') || tag.includes('application/')) return null;
  // Skip legacy markers
  if (tag.includes('(Legacy)')) return tag.replace(' (Legacy)', '');
  return tag;
};

export function VaultCard({ record }: { record: VaultRecord }) {
  // Get category config (strip Legacy suffix)
  const cleanType = record.type.replace(' (Legacy)', '') as RecordType;
  const config = CATEGORY_CONFIG[cleanType] || CATEGORY_CONFIG.Documents;
  const Icon = config.icon;
  
  // Clean and limit tags
  const displayTags = record.tags
    .map(cleanTag)
    .filter((tag): tag is string => tag !== null)
    .slice(0, 3);
  
  // Add file type tag if applicable
  const fileTypeLabel = getFileTypeLabel(record.fileType);
  if (fileTypeLabel && !displayTags.includes(fileTypeLabel)) {
    displayTags.unshift(fileTypeLabel);
  }
  
  return (
    <div className="
      bg-white
      border border-stone-200
      rounded-xl
      p-5
      shadow-sm
      hover:shadow-md
      hover:border-stone-300
      transition-all
      duration-200
      cursor-pointer
      flex flex-col
      min-h-[200px]
    ">
      {/* Icon */}
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: config.bg }}
      >
        <Icon className="w-5 h-5" style={{ color: config.color }} />
      </div>
      
      {/* Title */}
      <h3 className="text-stone-900 font-semibold mt-3 line-clamp-1">
        {record.title}
      </h3>
      
      {/* Subtitle */}
      {record.subtitle && (
        <p className="text-stone-500 text-sm mt-1 line-clamp-2">
          {record.subtitle}
        </p>
      )}
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3 flex-1">
        {displayTags.slice(0, 3).map(tag => (
          <span 
            key={tag}
            className="
              px-2 py-0.5 
              text-xs 
              rounded-full 
              bg-stone-100 
              text-stone-600
              max-w-[100px]
              truncate
              h-fit
            "
          >
            {tag}
          </span>
        ))}
        {record.tags.length > 3 && (
          <span className="text-xs text-stone-400 self-center">
            +{record.tags.length - 3}
          </span>
        )}
      </div>
      
      {/* Footer */}
      <div className="
        flex justify-between items-center
        mt-4 pt-3
        border-t border-stone-100
        text-xs text-stone-400
      ">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{record.date}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>{record.beneficiaryCount}</span>
        </div>
      </div>
    </div>
  );
}
```

---

## FIXED VAULT PAGE

```tsx
// app/vault/page.tsx

import { VaultCard } from '@/components/vault/VaultCard';

export default function VaultPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Vault</h1>
            <p className="text-stone-500 mt-1">
              Manage your encrypted digital estate records
            </p>
          </div>
          <button className="
            px-4 py-2 
            bg-violet-600 
            text-white 
            rounded-lg 
            font-medium
            hover:bg-violet-700
            transition-colors
          ">
            + Add Record
          </button>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search records..."
            className="
              w-full md:w-80
              px-4 py-2.5
              bg-white
              border border-stone-200
              rounded-lg
              text-stone-900
              placeholder:text-stone-400
              focus:outline-none
              focus:ring-2
              focus:ring-violet-500
              focus:border-transparent
            "
          />
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['All', 'Documents', 'Wallets', 'Credentials', 'Accounts'].map(cat => (
            <button
              key={cat}
              className={`
                px-4 py-2 
                rounded-lg 
                text-sm 
                font-medium 
                whitespace-nowrap
                transition-colors
                ${cat === 'All' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {records.map(record => (
            <VaultCard key={record.id} record={record} />
          ))}
        </div>
        
      </div>
    </div>
  );
}
```

---

## BEFORE / AFTER

### BEFORE (Current):
- ❌ Black page background
- ❌ Dark gray cards, low contrast
- ❌ "VND.OPENXML..." tags overflowing
- ❌ "(Legacy)" suffixes everywhere
- ❌ Same blue icon for everything
- ❌ Harsh, unprofessional look

### AFTER (Fixed):
- ✅ Warm off-white background (`stone-50`)
- ✅ White cards with subtle borders
- ✅ Clean tags with max 3 shown
- ✅ MIME types mapped to "Word", "PDF", etc.
- ✅ Category-specific colored icons
- ✅ Professional, trustworthy aesthetic

---

## TESTING CHECKLIST

After applying fixes, verify:

- [ ] Page background is `stone-50` (light) or `zinc-900` (dark), NOT black
- [ ] Cards are white with stone-200 borders
- [ ] No tags longer than ~12 characters visible
- [ ] No "VND.OPENXML..." text anywhere
- [ ] No "(Legacy)" text visible
- [ ] Icons have category-specific colors
- [ ] Hover states work on cards
- [ ] Text is readable (good contrast)
- [ ] Grid layout is responsive
