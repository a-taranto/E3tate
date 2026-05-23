# E3tate Vault Card Redesign — Lovable Style

**Objective:** Replace the current list-style vault records with Lovable's tiled card design. The cards should be dark, premium, and information-dense while remaining clean.

---

## REFERENCE: Lovable Card Design

Based on the Lovable screenshots, each vault card has:

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   🔷  [Colored Icon]                                       │
│                                                            │
│   Title Text                                               │
│   Subtitle / Description (muted)                           │
│                                                            │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│   │  Tag 1  │ │  Tag 2  │ │  Tag 3  │    (pill badges)    │
│   └─────────┘ └─────────┘ └─────────┘                     │
│                                                            │
│   📅 Date                              👥 2 beneficiaries  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Visual characteristics:**
- Dark card background (`#1C2128` or similar)
- Rounded corners (12-16px)
- Colored icon in top-left (category-specific color)
- Bold white title
- Muted gray subtitle
- Small pill badges for tags/categories
- Footer with date + beneficiary count
- Subtle hover state (slight lift or border glow)
- Grid layout (2-3 columns depending on screen width)

---

## CURRENT STATE (What to Replace)

The current E3tate vault uses a list/row style:

```
┌──────────────────────────────────────────────────────────────────┐
│ 🏠 │ Primary Bank Account    [Financial]    [View] [Edit]       │
│    │ Sarah J., Michael K. · 2 hours ago                         │
└──────────────────────────────────────────────────────────────────┘
```

**Problems:**
- Less visual impact
- Harder to scan
- Doesn't feel premium
- Wastes horizontal space

---

## IMPLEMENTATION PROMPT FOR CLAUDE CODE

```
## Task: Redesign Vault Cards to Match Lovable Style

Replace the current list-style vault records with a grid of dark, tiled cards.

### 1. CARD COMPONENT

Create a new `VaultCard` component with this structure:

```tsx
// components/vault/VaultCard.tsx

interface VaultCardProps {
  record: {
    id: string;
    title: string;
    subtitle?: string;
    type: 'Documents' | 'Wallets' | 'Credentials' | 'Accounts';
    tags: string[];
    date: string;
    beneficiaryCount: number;
    icon?: string;
  };
  onClick?: () => void;
}
```

### 2. VISUAL SPECIFICATIONS

**Card Container:**
```css
.vault-card {
  background: #1C2128;           /* Dark card background */
  border-radius: 16px;
  padding: 20px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.vault-card:hover {
  transform: translateY(-2px);
  border-color: rgba(245, 166, 35, 0.3);  /* Subtle gold border on hover */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
```

**Icon (top-left):**
```css
.vault-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

/* Category-specific icon backgrounds */
.icon-documents { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }  /* Blue */
.icon-wallets   { background: rgba(245, 166, 35, 0.15); color: #F5A623; }  /* Gold */
.icon-credentials { background: rgba(16, 185, 129, 0.15); color: #10B981; } /* Green */
.icon-accounts  { background: rgba(139, 92, 246, 0.15); color: #8B5CF6; }  /* Purple */
```

**Typography:**
```css
.vault-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1.3;
}

.vault-card-subtitle {
  font-size: 13px;
  color: #9CA3AF;  /* Muted gray */
  line-height: 1.4;
}
```

**Tags (pill badges):**
```css
.vault-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;  /* Push to bottom */
}

.vault-card-tag {
  background: rgba(255, 255, 255, 0.08);
  color: #9CA3AF;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 500;
}
```

**Footer:**
```css
.vault-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
  color: #6B7280;
}

.vault-card-beneficiaries {
  display: flex;
  align-items: center;
  gap: 4px;
}
```

### 3. GRID LAYOUT

```css
.vault-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

/* Responsive breakpoints */
@media (min-width: 1024px) {
  .vault-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .vault-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 4. CATEGORY ICONS

Use Lucide icons for each category:

| Category | Icon | Color |
|----------|------|-------|
| Documents | `FileText` | Blue (#3B82F6) |
| Wallets | `Wallet` | Gold (#F5A623) |
| Credentials | `Key` | Green (#10B981) |
| Accounts | `User` | Purple (#8B5CF6) |

### 5. EXAMPLE CARDS (Mock Data)

```tsx
const mockVaultRecords = [
  {
    id: '1',
    title: 'Last Will and Testament',
    subtitle: 'Primary legal document',
    type: 'Documents',
    tags: ['Legal', 'Critical', 'PDF'],
    date: 'Dec 15, 2024',
    beneficiaryCount: 3,
  },
  {
    id: '2',
    title: 'Coinbase Account',
    subtitle: 'Primary crypto exchange',
    type: 'Wallets',
    tags: ['Crypto', 'BTC', 'ETH'],
    date: 'Jan 8, 2025',
    beneficiaryCount: 2,
  },
  {
    id: '3',
    title: 'Chase Bank Login',
    subtitle: 'Primary checking account',
    type: 'Credentials',
    tags: ['Banking', 'Primary'],
    date: 'Jan 10, 2025',
    beneficiaryCount: 2,
  },
  {
    id: '4',
    title: 'Gmail Account',
    subtitle: 'john.smith@gmail.com',
    type: 'Accounts',
    tags: ['Email', 'Google', 'Primary'],
    date: 'Jan 5, 2025',
    beneficiaryCount: 1,
  },
  {
    id: '5',
    title: 'Property Deed - Main St',
    subtitle: '123 Main Street, Sydney NSW',
    type: 'Documents',
    tags: ['Property', 'Legal'],
    date: 'Nov 20, 2024',
    beneficiaryCount: 2,
  },
  {
    id: '6',
    title: 'Ledger Nano X',
    subtitle: 'Hardware wallet - Cold storage',
    type: 'Wallets',
    tags: ['Hardware', 'BTC', 'Cold Storage'],
    date: 'Oct 1, 2024',
    beneficiaryCount: 1,
  },
];
```

### 6. COMPLETE CARD COMPONENT

```tsx
// components/vault/VaultCard.tsx

import { FileText, Wallet, Key, User, Calendar, Users } from 'lucide-react';

type CategoryType = 'Documents' | 'Wallets' | 'Credentials' | 'Accounts';

interface VaultCardProps {
  record: {
    id: string;
    title: string;
    subtitle?: string;
    type: CategoryType;
    tags: string[];
    date: string;
    beneficiaryCount: number;
  };
  onClick?: () => void;
}

const categoryConfig: Record<CategoryType, { icon: typeof FileText; color: string; bg: string }> = {
  Documents: { icon: FileText, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  Wallets: { icon: Wallet, color: '#F5A623', bg: 'rgba(245, 166, 35, 0.15)' },
  Credentials: { icon: Key, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  Accounts: { icon: User, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
};

export function VaultCard({ record, onClick }: VaultCardProps) {
  const config = categoryConfig[record.type];
  const Icon = config.icon;

  return (
    <div
      className="bg-[#1C2128] rounded-2xl p-5 min-h-[180px] flex flex-col gap-3 cursor-pointer transition-all duration-200 border border-transparent hover:border-[rgba(245,166,35,0.3)] hover:-translate-y-0.5 hover:shadow-xl"
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: config.bg }}
      >
        <Icon className="w-6 h-6" style={{ color: config.color }} />
      </div>

      {/* Title & Subtitle */}
      <div className="flex-1">
        <h3 className="text-white font-semibold text-base leading-tight">
          {record.title}
        </h3>
        {record.subtitle && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
            {record.subtitle}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {record.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="bg-white/[0.08] text-gray-400 px-2.5 py-1 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}
        {record.tags.length > 3 && (
          <span className="text-gray-500 text-xs self-center">
            +{record.tags.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-white/[0.06] text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{record.date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{record.beneficiaryCount} beneficiaries</span>
        </div>
      </div>
    </div>
  );
}
```

### 7. VAULT PAGE UPDATE

Update the Vault page to use the new grid layout:

```tsx
// app/vault/page.tsx

import { VaultCard } from '@/components/vault/VaultCard';
import { mockVaultRecords } from '@/lib/mock-data';

export default function VaultPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const filteredRecords = activeCategory === 'all'
    ? mockVaultRecords
    : mockVaultRecords.filter(r => r.type === activeCategory);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Digital Vault</h1>
          <p className="text-gray-400 mt-1">
            {mockVaultRecords.length} items secured
          </p>
        </div>
        <Button>+ Add Item</Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'Documents', 'Wallets', 'Credentials', 'Accounts'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-amber-500 text-black'
                : 'bg-white/[0.08] text-gray-400 hover:bg-white/[0.12]'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRecords.map((record) => (
          <VaultCard
            key={record.id}
            record={record}
            onClick={() => openRecordDetail(record.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRecords.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.05] flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-white font-medium">No items found</h3>
          <p className="text-gray-500 text-sm mt-1">
            Add your first {activeCategory !== 'all' ? activeCategory.toLowerCase() : 'item'}
          </p>
        </div>
      )}
    </div>
  );
}
```

### 8. BACKGROUND COLOR

Ensure the page background is dark to match the cards:

```css
/* Dark background for vault page */
.vault-page {
  background: #0F1419;
  min-height: 100vh;
}

/* Or in Tailwind */
<div className="bg-[#0F1419] min-h-screen">
```

### 9. ADDITIONAL POLISH

**Card click opens detail panel:**
- Use a slide-over or modal
- Show full record details
- Edit/delete actions

**Empty card state:**
- Show "+ Add Document" card as first item in empty category
- Dashed border, muted colors

**Loading skeleton:**
- Show pulsing placeholder cards while loading
- Match card dimensions

---

## SUMMARY

Replace the list-style vault records with:

1. ✅ Dark tiled cards (`#1C2128` background)
2. ✅ Grid layout (responsive 2-4 columns)
3. ✅ Colored category icons (Documents=Blue, Wallets=Gold, Credentials=Green, Accounts=Purple)
4. ✅ Bold title + muted subtitle
5. ✅ Pill badges for tags
6. ✅ Footer with date + beneficiary count
7. ✅ Hover effect (lift + border glow)
8. ✅ Category filter tabs

This will match the Lovable design while keeping E3tate's data model.
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `components/vault/VaultCard.tsx` | CREATE - New card component |
| `components/vault/VaultGrid.tsx` | CREATE - Grid wrapper |
| `app/vault/page.tsx` | MODIFY - Use new grid layout |
| `lib/mock-data.ts` | MODIFY - Update record structure |
| `styles/globals.css` | MODIFY - Add dark theme vars if needed |

---

## Expected Result

The vault page will transform from:

**Before (List):**
```
┌──────────────────────────────────────────────────────┐
│ 🏠 Primary Bank Account [Financial] [View] [Edit]    │
├──────────────────────────────────────────────────────┤
│ 📄 Will_Test.docx [Documents] [View] [Edit]          │
├──────────────────────────────────────────────────────┤
│ 🔐 Gmail Login [Credentials] [View] [Edit]           │
└──────────────────────────────────────────────────────┘
```

**After (Tiled Grid):**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 📄           │ │ 💰           │ │ 🔐           │
│              │ │              │ │              │
│ Last Will    │ │ Coinbase     │ │ Chase Bank   │
│ Primary doc  │ │ Crypto exch  │ │ Checking     │
│              │ │              │ │              │
│ [Legal][PDF] │ │ [Crypto][BTC]│ │ [Banking]    │
│ Dec 15 · 3👥 │ │ Jan 8 · 2👥  │ │ Jan 10 · 2👥 │
└──────────────┘ └──────────────┘ └──────────────┘
```

Much more visual, scannable, and premium!
