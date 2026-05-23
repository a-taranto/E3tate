# E3tate UX Fix Implementation Prompt

Reference: `_refs/e3tate-ux-audit.md`

This prompt addresses critical UX issues identified in the app audit.

---

## PHASE 1: CRITICAL FIXES

### 1.1 Eliminate Setup vs Profile Confusion

The app currently has TWO entry points for the same data:
- `/setup` — 5-step wizard
- `/profile` — Tab-based interface

**Action: Merge into single "My Estate" experience**

#### Step 1: Rename Setup to My Estate

```bash
# Rename the route
mv app/setup app/my-estate
```

Update `app/my-estate/layout.tsx`:
```tsx
export default function MyEstateLayout({ children }) {
  return (
    <div>
      <h1>My Estate</h1>
      <p>Manage your digital estate in one place</p>
      {/* Keep existing wizard layout */}
      {children}
    </div>
  );
}
```

#### Step 2: Update Navigation

In `components/layout/sidebar.tsx`, change:

```tsx
const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/will", label: "Will", icon: ScrollText },        // Position 2
  { href: "/my-estate", label: "My Estate", icon: User },    // Renamed from Setup
  { href: "/vault", label: "Vault", icon: Lock },
  { href: "/beneficiaries", label: "Beneficiaries", icon: Users },
  { href: "/triggers", label: "Triggers", icon: Zap },
  { href: "/activity-log", label: "Activity Log", icon: History },
  { href: "/help", label: "Help", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

// REMOVE "Profile" from navigation entirely
```

#### Step 3: Redirect /profile to /my-estate

Create `app/profile/page.tsx`:
```tsx
import { redirect } from 'next/navigation';

export default function ProfileRedirect() {
  redirect('/my-estate');
}
```

#### Step 4: Show completion status in nav

In sidebar, show progress indicator next to "My Estate":

```tsx
<NavItem href="/my-estate" icon={User}>
  My Estate
  {estateCompletion < 100 && (
    <span className="ml-2 text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
      {estateCompletion}%
    </span>
  )}
</NavItem>
```

---

### 1.2 Make Will Central

#### Step 1: Ensure Will is Position 2 in Nav

Already done above. Verify Will comes right after Dashboard.

#### Step 2: Create Proper Will Page

Update `app/will/page.tsx`:

```tsx
export default function WillPage() {
  const { will, hasWill } = useWill(); // Hook to get will status
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Last Will and Testament</h1>
      <p className="text-stone-500">The foundation of your digital estate</p>
      
      {!hasWill ? (
        <WillEmptyState />
      ) : (
        <WillDashboard will={will} />
      )}
    </div>
  );
}

function WillEmptyState() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-6">
      {/* Upload Option */}
      <Card className="p-6">
        <div className="flex flex-col items-center text-center">
          <Upload className="w-12 h-12 text-stone-400 mb-4" />
          <h3 className="font-semibold">Upload Existing Will</h3>
          <p className="text-sm text-stone-500 mt-2">
            Already have a will? Upload it to store securely.
          </p>
          <Button className="mt-4">Upload Document</Button>
        </div>
      </Card>
      
      {/* Create Option */}
      <Card className="p-6 border-violet-200 bg-violet-50">
        <div className="flex flex-col items-center text-center">
          <FileEdit className="w-12 h-12 text-violet-500 mb-4" />
          <h3 className="font-semibold">Create from Template</h3>
          <p className="text-sm text-stone-500 mt-2">
            Use our guided wizard to create a legally-structured will.
          </p>
          <Button variant="primary" className="mt-4">
            Start with Template
          </Button>
        </div>
      </Card>
    </div>
  );
}

function WillDashboard({ will }) {
  return (
    <div className="mt-8 space-y-6">
      {/* Will Document Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-20 bg-stone-100 rounded flex items-center justify-center">
            <FileText className="w-8 h-8 text-stone-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{will.fileName}</h3>
            <p className="text-sm text-stone-500">
              Uploaded: {will.uploadedAt} · {will.fileSize}
            </p>
            <p className="text-sm text-stone-500 mt-1">
              Physical Location: {will.physicalLocation || "Not specified"}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" size="sm">Download</Button>
              <Button variant="ghost" size="sm">Update Location</Button>
            </div>
          </div>
          <Badge variant="success">Encrypted</Badge>
        </div>
      </Card>
      
      {/* Linked Information */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium text-stone-500">Executors</h4>
          <p className="text-2xl font-bold mt-1">2</p>
          <p className="text-sm text-green-600">✓ Linked to People</p>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-medium text-stone-500">Beneficiaries</h4>
          <p className="text-2xl font-bold mt-1">3</p>
          <p className="text-sm text-green-600">✓ Linked to People</p>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-medium text-stone-500">Bequests</h4>
          <p className="text-2xl font-bold mt-1">5</p>
          <p className="text-sm text-green-600">✓ Linked to Vault</p>
        </Card>
      </div>
      
      {/* Future: Consistency checker, parsed content, etc. */}
    </div>
  );
}
```

#### Step 3: Update Dashboard to Feature Will

In `app/page.tsx` (Dashboard), add Will status card at top:

```tsx
export default function Dashboard() {
  return (
    <div className="p-8">
      <h1>Dashboard</h1>
      
      {/* Will Status - NEW, at top */}
      <WillStatusCard className="mb-8" />
      
      {/* Rest of dashboard */}
      <ExecutionStatus />
      <QuickActions />
      <RecentActivity />
    </div>
  );
}

function WillStatusCard() {
  const { hasWill, will } = useWill();
  
  if (!hasWill) {
    return (
      <Card className="p-6 border-amber-200 bg-amber-50">
        <div className="flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <div className="flex-1">
            <h3 className="font-semibold">Will Not Set Up</h3>
            <p className="text-sm text-stone-600">
              Your digital estate needs a will to be complete.
            </p>
          </div>
          <Button asChild>
            <Link href="/will">Create or Upload Will</Link>
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6 border-green-200 bg-green-50">
      <div className="flex items-center gap-4">
        <CheckCircle className="w-8 h-8 text-green-500" />
        <div className="flex-1">
          <h3 className="font-semibold">Will Active</h3>
          <p className="text-sm text-stone-600">
            {will.fileName} · Updated {will.updatedAt}
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/will">View Will</Link>
        </Button>
      </div>
    </Card>
  );
}
```

---

### 1.3 Fix Document Viewer

Update the document viewer modal to properly handle .docx files:

In `components/vault/DocumentViewer.tsx`:

```tsx
function DocumentViewer({ document, onClose }) {
  const isOfficeDoc = ['.docx', '.xlsx', '.pptx'].some(ext => 
    document.fileName.toLowerCase().endsWith(ext)
  );
  
  if (isOfficeDoc) {
    return (
      <Modal onClose={onClose}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-20 bg-violet-100 rounded-lg flex items-center justify-center">
              <FileText className="w-8 h-8 text-violet-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{document.title}</h2>
              <p className="text-sm text-stone-500">{document.fileName}</p>
            </div>
            <Badge>Encrypted</Badge>
          </div>
          
          {/* Metadata */}
          <div className="bg-stone-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-stone-500">Type:</span>
                <span className="ml-2 font-medium">
                  {document.fileName.endsWith('.docx') ? 'Word Document' : 
                   document.fileName.endsWith('.xlsx') ? 'Excel Spreadsheet' :
                   'PowerPoint Presentation'}
                </span>
              </div>
              <div>
                <span className="text-stone-500">Size:</span>
                <span className="ml-2 font-medium">{document.fileSize}</span>
              </div>
              <div>
                <span className="text-stone-500">Uploaded:</span>
                <span className="ml-2 font-medium">{document.uploadedAt}</span>
              </div>
              <div>
                <span className="text-stone-500">Modified:</span>
                <span className="ml-2 font-medium">{document.modifiedAt}</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Original
            </Button>
            <Button variant="secondary">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
          
          {/* Help text */}
          <p className="text-xs text-stone-400 mt-4 text-center">
            Microsoft Office documents can be opened after downloading.
          </p>
        </div>
      </Modal>
    );
  }
  
  // For other file types, show preview...
  return <PreviewableDocumentViewer document={document} onClose={onClose} />;
}
```

---

## PHASE 2: MEDIUM FIXES

### 2.1 Fix Profile Summary Taxonomy

Update the Profile Summary sidebar to use the 6 canonical Vault types:

```tsx
// lib/constants.ts
export const VAULT_TYPES = [
  { id: 'Identity', icon: User, color: '#8B5CF6' },
  { id: 'Financial', icon: Wallet, color: '#10B981' },
  { id: 'Credentials', icon: Key, color: '#F59E0B' },
  { id: 'Documents', icon: FileText, color: '#3B82F6' },
  { id: 'Instructions', icon: ClipboardList, color: '#EC4899' },
  { id: 'Assets', icon: Home, color: '#F97316' },
];

// components/profile/ProfileSummary.tsx
function ProfileSummary({ records }) {
  // Group records by Vault type
  const grouped = VAULT_TYPES.map(type => ({
    ...type,
    records: records.filter(r => r.vaultType === type.id),
    count: records.filter(r => r.vaultType === type.id).length,
  }));
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Profile Summary</h3>
      
      <div className="space-y-3">
        {grouped.filter(g => g.count > 0).map(group => (
          <div key={group.id}>
            <div className="flex items-center gap-2 mb-1">
              <group.icon className="w-4 h-4" style={{ color: group.color }} />
              <span className="font-medium">{group.id}</span>
              <span className="text-stone-400">({group.count})</span>
            </div>
            <ul className="ml-6 text-sm text-stone-600">
              {group.records.map(record => (
                <li key={record.id}>{record.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

### 2.2 Add Service Setup Summary

After completing all service setups, show a summary:

Create `components/setup/ServiceSetupSummary.tsx`:

```tsx
function ServiceSetupSummary({ services, onContinue, onAddMore }) {
  const withCredentials = services.filter(s => s.hasCredentials).length;
  const withWishes = services.filter(s => s.wish).length;
  const totalCost = services
    .filter(s => s.subscription?.cost)
    .reduce((sum, s) => sum + parseFloat(s.subscription.cost), 0);
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Online Accounts Set Up</h2>
        <p className="text-stone-500 mt-2">
          You've configured {services.length} services
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-violet-600">{services.length}</p>
          <p className="text-sm text-stone-500">Services</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{withCredentials}</p>
          <p className="text-sm text-stone-500">Credentials Stored</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-pink-600">{withWishes}</p>
          <p className="text-sm text-stone-500">Wishes Set</p>
        </Card>
      </div>
      
      {/* Subscription tracking */}
      {totalCost > 0 && (
        <Card className="p-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-stone-600">Total Monthly Subscriptions</span>
            <span className="text-xl font-bold">${totalCost.toFixed(2)}/mo</span>
          </div>
        </Card>
      )}
      
      {/* Service list */}
      <Card className="p-4 mb-8">
        <h3 className="font-semibold mb-3">Configured Services</h3>
        <div className="space-y-2">
          {services.map(service => (
            <div key={service.id} className="flex items-center gap-3 py-2 border-b last:border-0">
              <img src={service.logo} alt="" className="w-6 h-6" />
              <span className="flex-1">{service.name}</span>
              <span className="text-sm text-stone-500">
                {service.wish?.action === 'transfer' ? `→ ${service.wish.transferTo}` :
                 service.wish?.action === 'delete' ? 'Delete' :
                 service.wish?.action === 'memorialize' ? 'Memorialize' :
                 service.wish?.action || 'No action set'}
              </span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="secondary" onClick={onAddMore}>
          + Add More Services
        </Button>
        <Button variant="primary" onClick={onContinue} className="flex-1">
          Continue to Assets →
        </Button>
      </div>
    </div>
  );
}
```

### 2.3 Improve Assets Step

Add guidance and pull existing assets:

```tsx
function AssetsStep({ existingAssets }) {
  const assetTypes = [
    { id: 'property', icon: Home, label: 'Property', description: 'Homes, land, investment properties' },
    { id: 'vehicle', icon: Car, label: 'Vehicle', description: 'Cars, motorcycles, boats' },
    { id: 'bank', icon: Building, label: 'Bank Account', description: 'Checking, savings, term deposits' },
    { id: 'super', icon: PiggyBank, label: 'Superannuation', description: 'Super funds, pension accounts' },
    { id: 'crypto', icon: Bitcoin, label: 'Cryptocurrency', description: 'Bitcoin, Ethereum, exchange accounts' },
  ];
  
  return (
    <div>
      <h2 className="text-2xl font-bold">Your Assets</h2>
      <p className="text-stone-500 mt-2">
        Add your major assets and assign beneficiaries to each one.
      </p>
      
      {/* Asset type cards with descriptions */}
      <div className="grid grid-cols-5 gap-4 mt-8">
        {assetTypes.map(type => (
          <Card 
            key={type.id}
            className="p-4 cursor-pointer hover:border-violet-300 text-center"
            onClick={() => selectAssetType(type.id)}
          >
            <type.icon className="w-8 h-8 mx-auto text-violet-500 mb-2" />
            <p className="font-medium">{type.label}</p>
            <p className="text-xs text-stone-400 mt-1">{type.description}</p>
          </Card>
        ))}
      </div>
      
      {/* Show existing assets */}
      {existingAssets.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">
              You've already added {existingAssets.length} assets
            </span>
          </div>
          
          <div className="space-y-2">
            {existingAssets.map(asset => (
              <Card key={asset.id} className="p-3 flex items-center gap-3">
                <AssetIcon type={asset.type} className="w-5 h-5" />
                <span className="flex-1">{asset.title}</span>
                <span className="text-sm text-stone-500">
                  → {asset.beneficiary || 'No beneficiary'}
                </span>
                <Button variant="ghost" size="sm">Edit</Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 2.4 Link Wishes to Records

Replace generic text fields with record-linked wishes:

```tsx
function WishesStep({ accounts, assets }) {
  const digitalRecords = [...accounts, ...assets.filter(a => a.type === 'crypto')];
  
  return (
    <div>
      <h2 className="text-2xl font-bold">Digital Legacy</h2>
      <p className="text-stone-500 mt-2">
        Specify what should happen to each of your digital accounts and assets.
      </p>
      
      {digitalRecords.length === 0 ? (
        <Card className="p-8 text-center mt-8">
          <Globe className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="font-medium">No Digital Accounts Yet</p>
          <p className="text-sm text-stone-500 mt-2">
            Add accounts in the Online Life step first.
          </p>
          <Button variant="secondary" className="mt-4" asChild>
            <Link href="/my-estate/online">Go to Online Life</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4 mt-8">
          {digitalRecords.map(record => (
            <RecordWishCard key={record.id} record={record} />
          ))}
        </div>
      )}
      
      {/* General instructions section - kept but secondary */}
      <div className="mt-12">
        <h3 className="font-semibold mb-4">General Digital Instructions</h3>
        <Card className="p-4">
          <textarea
            placeholder="Any other digital legacy instructions not covered above..."
            className="w-full h-32 resize-none border-0 focus:ring-0"
          />
        </Card>
      </div>
    </div>
  );
}

function RecordWishCard({ record }) {
  const [action, setAction] = useState(record.wish?.action || '');
  const [transferTo, setTransferTo] = useState(record.wish?.transferTo || '');
  const [notes, setNotes] = useState(record.wish?.notes || '');
  
  const actions = getActionsForService(record.serviceId);
  
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <img src={record.logo} alt="" className="w-10 h-10 rounded" />
        
        <div className="flex-1">
          <h4 className="font-medium">{record.title}</h4>
          <p className="text-sm text-stone-500">{record.email || record.username}</p>
          
          <div className="mt-4 space-y-3">
            {/* Action selector */}
            <div>
              <label className="text-sm font-medium">What should happen?</label>
              <select 
                value={action} 
                onChange={(e) => setAction(e.target.value)}
                className="mt-1 w-full rounded-lg border-stone-200"
              >
                <option value="">Select action...</option>
                {actions.map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>
            
            {/* Transfer beneficiary */}
            {action === 'transfer' && (
              <div>
                <label className="text-sm font-medium">Transfer to</label>
                <BeneficiarySelect value={transferTo} onChange={setTransferTo} />
              </div>
            )}
            
            {/* Notes */}
            <div>
              <label className="text-sm font-medium">Additional instructions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific instructions..."
                className="mt-1 w-full h-20 rounded-lg border-stone-200 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

---

## PHASE 3: POLISH

### 3.1 Simplify Vault Quick Add

For direct Vault additions, use a simpler single-step form:

```tsx
function QuickAddRecord({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Add Record</h2>
        
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g., Investment Account" required />
          
          <Select label="Type" required>
            <option value="">Select type...</option>
            <option value="Identity">Identity</option>
            <option value="Financial">Financial</option>
            <option value="Credentials">Credentials</option>
            <option value="Documents">Documents</option>
            <option value="Instructions">Instructions</option>
            <option value="Assets">Assets</option>
          </Select>
          
          <BeneficiaryMultiSelect label="Beneficiaries" />
          
          <FileUpload label="Attach File (optional)" />
          
          <Textarea label="Notes (optional)" rows={3} />
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="flex-1">Save Record</Button>
        </div>
        
        <p className="text-xs text-stone-400 mt-4 text-center">
          Need to add credentials or complex data? 
          <Link href="/my-estate/online" className="text-violet-600 ml-1">
            Use the guided setup
          </Link>
        </p>
      </div>
    </Modal>
  );
}
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `app/setup/*` | Rename to `app/my-estate/*` |
| `app/profile/page.tsx` | Redirect to `/my-estate` |
| `components/layout/sidebar.tsx` | Update nav items, remove Profile |
| `app/will/page.tsx` | Create proper will dashboard |
| `app/page.tsx` | Add Will status card |
| `components/vault/DocumentViewer.tsx` | Fix .docx display |
| `components/profile/ProfileSummary.tsx` | Use 6 Vault types |
| `components/setup/ServiceSetupSummary.tsx` | New summary component |
| `app/my-estate/assets/page.tsx` | Add guidance |
| `app/my-estate/wishes/page.tsx` | Link to records |
| `components/vault/QuickAddRecord.tsx` | Simplified add flow |

---

## Testing Checklist

After implementation, verify:

- [ ] `/profile` redirects to `/my-estate`
- [ ] Navigation shows: Dashboard, Will, My Estate, Vault, Beneficiaries, Triggers
- [ ] Dashboard shows Will status card at top
- [ ] Will page shows upload/create options when empty
- [ ] Will page shows document details when uploaded
- [ ] Document viewer shows metadata for .docx (not broken preview)
- [ ] Profile Summary uses 6 Vault types consistently
- [ ] Service setup shows summary after completion
- [ ] Assets step shows descriptions and existing assets
- [ ] Wishes step pulls in digital accounts with action selectors
- [ ] Vault quick add is single-step
