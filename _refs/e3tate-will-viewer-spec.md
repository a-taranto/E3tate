# E3tate Will Document Viewer Specification

**Problem:** DOCX files cannot be viewed or edited in the browser. Current implementation shows a generic icon and requires download.

**Goal:** Allow users to view their Will document in-browser and make simple edits without leaving E3tate.

---

## 1. VIEWING SOLUTION

### 1.1 Hybrid Approach (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT UPLOAD FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User uploads: Will.docx                                        │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Backend Processing                                      │   │
│  │                                                          │   │
│  │  1. Store original DOCX (encrypted)                     │   │
│  │  2. Convert DOCX → PDF (using LibreOffice/Pandoc)       │   │
│  │  3. Convert DOCX → HTML (using mammoth.js)              │   │
│  │  4. Extract text content (for search/AI parsing)        │   │
│  │  5. Store all versions                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  Stored files:                                                  │
│  - will_original.docx (encrypted, for download)                │
│  - will_preview.pdf (encrypted, for viewing)                   │
│  - will_content.html (encrypted, for editing)                  │
│  - will_text.txt (encrypted, for AI parsing)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Document Viewer UI

```
┌─────────────────────────────────────────────────────────────────┐
│  Last Will and Testament                                   ✕   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │📄 View  │ │✏️ Edit  │ │📋 Details   │ │🔗 Beneficiaries │   │
│  │  ████   │ │         │ │             │ │                 │   │
│  └─────────┘ └─────────┘ └─────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │     ╔═══════════════════════════════════════════╗       │   │
│  │     ║                                           ║       │   │
│  │     ║        LAST WILL AND TESTAMENT           ║       │   │
│  │     ║                                           ║       │   │
│  │     ║  I, John David Smith, of Sydney NSW,     ║       │   │
│  │     ║  declare this to be my Last Will and     ║       │   │
│  │     ║  Testament, revoking all previous wills. ║       │   │
│  │     ║                                           ║       │   │
│  │     ║  ARTICLE I - EXECUTOR                    ║       │   │
│  │     ║  I appoint Sarah Johnson as Executor...  ║       │   │
│  │     ║                                           ║       │   │
│  │     ║  ARTICLE II - BENEFICIARIES              ║       │   │
│  │     ║  I give and bequeath...                  ║       │   │
│  │     ║                                           ║       │   │
│  │     ╚═══════════════════════════════════════════╝       │   │
│  │                                                          │   │
│  │  Page 1 of 3                    [◀] [▶]    🔍 Zoom      │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔒 End-to-end encrypted │ 📅 Dec 15, 2024 │ 12.9 KB    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│         [⬇️ Download Original]  [🖨️ Print]  [📤 Share]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 PDF Viewer Component

Use `react-pdf` or `pdfjs-dist` for in-browser PDF rendering:

```tsx
// components/vault/DocumentViewer.tsx

import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';

// Set worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  document: VaultDocument;
  previewUrl: string; // Pre-signed URL for PDF preview
}

export function DocumentViewer({ document, previewUrl }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  return (
    <div className="document-viewer">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-b border-stone-200">
        <TabButton active>View</TabButton>
        <TabButton>Edit</TabButton>
        <TabButton>Details</TabButton>
        <TabButton>Beneficiaries</TabButton>
      </div>

      {/* PDF Viewer */}
      <div className="bg-stone-100 rounded-lg p-4 overflow-auto max-h-[60vh]">
        <Document
          file={previewUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<LoadingSpinner />}
          error={<ErrorMessage />}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setPageNumber(p => Math.max(1, p - 1))}>
            ◀ Prev
          </button>
          <span>Page {pageNumber} of {numPages}</span>
          <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}>
            Next ▶
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => s - 0.25)}>−</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => s + 0.25)}>+</button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={downloadOriginal}>
          <Download className="w-4 h-4 mr-2" />
          Download Original (.docx)
        </Button>
        <Button variant="secondary" onClick={print}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>
    </div>
  );
}
```

---

## 2. EDITING SOLUTION

### 2.1 Edit Modes

For a Will document, "editing" could mean:

| Mode | Description | Implementation |
|------|-------------|----------------|
| **Metadata Edit** | Change title, tags, beneficiaries | Simple form (already exists) |
| **Annotations** | Add notes without changing document | Overlay system |
| **Replace Document** | Upload new version | File upload with version history |
| **In-Browser Edit** | Actually edit the text | Rich text editor (complex) |

### 2.2 Recommended: Annotation + Replace (MVP)

Don't try to build a full word processor. Instead:

```
┌─────────────────────────────────────────────────────────────────┐
│  Last Will and Testament                               [Edit]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │📄 View  │ │✏️ Edit  │ │📋 Details   │ │🔗 Beneficiaries │   │
│  │         │ │  ████   │ │             │ │                 │   │
│  └─────────┘ └─────────┘ └─────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  EDIT OPTIONS                                            │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  📤 Upload New Version                          │    │   │
│  │  │                                                  │    │   │
│  │  │  Replace this document with an updated version. │    │   │
│  │  │  Previous versions will be kept in history.     │    │   │
│  │  │                                                  │    │   │
│  │  │  [Choose File]  or drag and drop                │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  📝 Add Annotation                              │    │   │
│  │  │                                                  │    │   │
│  │  │  Add a note or instruction about this document  │    │   │
│  │  │  without modifying the original file.           │    │   │
│  │  │                                                  │    │   │
│  │  │  [Add Note]                                     │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  🔗 Edit in Word Online                         │    │   │
│  │  │                                                  │    │   │
│  │  │  Open this document in Microsoft Word Online    │    │   │
│  │  │  for full editing capabilities.                 │    │   │
│  │  │                                                  │    │   │
│  │  │  [Open in Word]  (requires Microsoft account)   │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Version History

Every document update creates a new version:

```
┌─────────────────────────────────────────────────────────────────┐
│  Version History                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ● Current Version (v3)                          Jan 11, 2026  │
│    Will_Test_v3.docx · 12.9 KB                                 │
│    "Updated executor details"                                   │
│    [View] [Download] [Restore]                                 │
│                                                                 │
│  ○ Version 2                                     Dec 15, 2024  │
│    Will_Test_v2.docx · 11.2 KB                                 │
│    "Added property bequest"                                     │
│    [View] [Download] [Restore]                                 │
│                                                                 │
│  ○ Version 1 (Original)                          Oct 1, 2024   │
│    Will_Test.docx · 10.1 KB                                    │
│    "Initial upload"                                             │
│    [View] [Download] [Restore]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. WILL-SPECIFIC FEATURES

Since the Will is the most important document, add special features:

### 3.1 AI-Powered Will Parsing (Future)

Extract structured data from uploaded will:

```
┌─────────────────────────────────────────────────────────────────┐
│  📜 Will Analysis                                          AI   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  We've analyzed your will and extracted the following:         │
│                                                                 │
│  EXECUTORS IDENTIFIED                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 👤 Sarah Johnson (Primary)                              │   │
│  │    → Matches beneficiary "Sarah Johnson" ✓              │   │
│  │                                                          │   │
│  │ 👤 Michael Kim (Alternate)                              │   │
│  │    ⚠️ Not found in your beneficiaries                   │   │
│  │    [Add as Beneficiary]                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  BEQUESTS IDENTIFIED                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🏠 "Property at 123 Main St" → Sarah Johnson            │   │
│  │    → Matches vault record "Property Deed - Main St" ✓   │   │
│  │                                                          │   │
│  │ 💰 "Investment portfolio" → Michael Kim                 │   │
│  │    ⚠️ No matching vault record found                    │   │
│  │    [Create Vault Record]                                │   │
│  │                                                          │   │
│  │ 💳 "Cryptocurrency holdings" → Split equally            │   │
│  │    → Matches vault records: ETH Wallet, BTC Cold ✓      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Re-analyze]  [Dismiss]                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Consistency Checker

Compare Will to Vault contents:

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Consistency Check                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  We found 2 potential issues:                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ⚠️ UNASSIGNED ASSET                                     │   │
│  │                                                          │   │
│  │ Your vault contains "Bitcoin Cold Storage" but this     │   │
│  │ asset is not mentioned in your will.                    │   │
│  │                                                          │   │
│  │ [Update Will]  [Assign Beneficiary in Vault]            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ⚠️ MISSING VAULT RECORD                                 │   │
│  │                                                          │   │
│  │ Your will mentions "vacation home in Queensland" but    │   │
│  │ no matching property deed is in your vault.             │   │
│  │                                                          │   │
│  │ [Add Property Deed]  [Dismiss]                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. BACKEND REQUIREMENTS

### 4.1 Document Processing Pipeline

```typescript
// api/documents/process.ts

import { exec } from 'child_process';
import mammoth from 'mammoth';

interface ProcessedDocument {
  originalPath: string;      // Encrypted DOCX
  previewPath: string;       // Encrypted PDF
  htmlContent: string;       // For simple editing
  textContent: string;       // For AI parsing
  metadata: DocumentMetadata;
}

async function processDocument(file: Buffer, filename: string): Promise<ProcessedDocument> {
  // 1. Save original (encrypted)
  const originalPath = await saveEncrypted(file, filename);
  
  // 2. Convert to PDF using LibreOffice
  const pdfBuffer = await convertToPdf(file);
  const previewPath = await saveEncrypted(pdfBuffer, `${filename}.pdf`);
  
  // 3. Extract HTML content using mammoth
  const { value: htmlContent } = await mammoth.convertToHtml({ buffer: file });
  
  // 4. Extract plain text
  const { value: textContent } = await mammoth.extractRawText({ buffer: file });
  
  // 5. Extract metadata
  const metadata = await extractMetadata(file);
  
  return {
    originalPath,
    previewPath,
    htmlContent,
    textContent,
    metadata,
  };
}

async function convertToPdf(docxBuffer: Buffer): Promise<Buffer> {
  // Use LibreOffice in headless mode
  // Or use a service like CloudConvert API
  
  // Example with LibreOffice:
  const tempInput = `/tmp/${Date.now()}.docx`;
  const tempOutput = `/tmp/${Date.now()}.pdf`;
  
  await fs.writeFile(tempInput, docxBuffer);
  
  await execPromise(
    `libreoffice --headless --convert-to pdf --outdir /tmp ${tempInput}`
  );
  
  const pdfBuffer = await fs.readFile(tempOutput);
  
  // Cleanup
  await fs.unlink(tempInput);
  await fs.unlink(tempOutput);
  
  return pdfBuffer;
}
```

### 4.2 API Endpoints

```typescript
// Document endpoints needed:

POST /api/documents/upload
// Uploads document, triggers processing pipeline
// Returns: { id, previewUrl, status: 'processing' }

GET /api/documents/:id/preview
// Returns pre-signed URL for PDF preview
// URL expires in 15 minutes

GET /api/documents/:id/download
// Returns pre-signed URL for original file download

POST /api/documents/:id/versions
// Uploads new version, keeps history

GET /api/documents/:id/versions
// Returns version history

POST /api/documents/:id/analyze
// Triggers AI analysis (for will parsing)
// Returns: { executors, beneficiaries, bequests }

GET /api/documents/:id/consistency
// Compares will to vault contents
// Returns: { issues: [...] }
```

---

## 5. IMPLEMENTATION PHASES

### Phase 1: PDF Preview (Week 1)
- Add LibreOffice to backend (Docker)
- Create processing pipeline for DOCX → PDF
- Implement PDF viewer component with react-pdf
- Add download original button

### Phase 2: Version History (Week 2)
- Database schema for versions
- Upload new version UI
- Version comparison view
- Restore previous version

### Phase 3: Will-Specific Features (Week 3-4)
- AI parsing endpoint (using Claude API)
- Structured data extraction
- Consistency checker
- Link suggestions

### Phase 4: Enhanced Editing (Future)
- Annotation system
- Microsoft Office Online integration
- Simple text editor fallback

---

## 6. TECHNOLOGY CHOICES

| Feature | Technology | Notes |
|---------|------------|-------|
| DOCX → PDF | LibreOffice headless | Run in Docker container |
| PDF Viewing | react-pdf / pdfjs | Client-side rendering |
| DOCX → HTML | mammoth.js | For text extraction |
| AI Parsing | Claude API | Extract structured data |
| Version Storage | S3 + PostgreSQL | Encrypted blob storage |

---

## 7. SECURITY CONSIDERATIONS

1. **Never store unencrypted documents** - All files encrypted at rest
2. **Pre-signed URLs** - Short expiry (15 min) for preview access
3. **Processing isolation** - Document conversion in sandboxed container
4. **No external services** - Avoid sending documents to third-party converters
5. **Audit logging** - Track all document access and modifications

---

## 8. UPDATED UI FOR CURRENT IMPLEMENTATION

Until full PDF preview is implemented, improve the current viewer:

```
┌─────────────────────────────────────────────────────────────────┐
│  Last Will and Testament                                   ✕   │
│  Will_Test.docx                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │           ┌─────────────────────────┐                   │   │
│  │           │     📄                  │                   │   │
│  │           │                         │                   │   │
│  │           │   WORD DOCUMENT         │                   │   │
│  │           │                         │                   │   │
│  │           │   Will_Test.docx        │                   │   │
│  │           └─────────────────────────┘                   │   │
│  │                                                          │   │
│  │   ┌─────────────────────────────────────────────────┐   │   │
│  │   │  📋 Document Details                             │   │   │
│  │   ├─────────────────────────────────────────────────┤   │   │
│  │   │  Type:        Word Document (.docx)             │   │   │
│  │   │  Size:        12.9 KB                           │   │   │
│  │   │  Created:     January 11, 2026                  │   │   │
│  │   │  Modified:    January 11, 2026                  │   │   │
│  │   │  Encryption:  🔒 End-to-end encrypted          │   │   │
│  │   │  Permissions: ✏️ Editable (version controlled) │   │   │
│  │   └─────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  [  ⬇️ Download to View  ]        [  📤 Upload New Version  ]   │
│  │                                                          │   │
│  │  Download and open in Microsoft Word, Google Docs,      │   │
│  │  or any compatible application to view or edit.         │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  👥 Beneficiary Access                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  All Beneficiaries          [Full Access]               │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [+ Add Beneficiary]                                           │
│                                                                 │
│  📜 Disclosure Rules                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Trigger:          After cooling-off                    │   │
│  │  Cooling-off:      14 days                              │   │
│  │  Executor Approval: Required                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Key improvements:
1. Clean file type display (not raw MIME type)
2. Clear "Download to View" CTA
3. "Upload New Version" for updates
4. Better visual hierarchy
5. Helpful guidance text
