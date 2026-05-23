"use client";

import {
  FileText, Wallet, Key, Globe, Calendar, Users,
  Building2, Home, User, ScrollText
} from 'lucide-react';

type CategoryType = 'documents' | 'wallets' | 'credentials' | 'accounts' |
                    'financial' | 'assets' | 'identity' | 'instructions';

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

// Category-specific icons and colors (light theme)
const categoryConfig: Record<CategoryType, { icon: any; color: string; bg: string }> = {
  documents: { icon: FileText, color: '#3B82F6', bg: '#EFF6FF' },
  wallets: { icon: Wallet, color: '#F59E0B', bg: '#FFFBEB' },
  credentials: { icon: Key, color: '#10B981', bg: '#ECFDF5' },
  accounts: { icon: Globe, color: '#8B5CF6', bg: '#F5F3FF' },
  financial: { icon: Building2, color: '#10B981', bg: '#ECFDF5' },
  assets: { icon: Home, color: '#F59E0B', bg: '#FFFBEB' },
  identity: { icon: User, color: '#8B5CF6', bg: '#F5F3FF' },
  instructions: { icon: ScrollText, color: '#EC4899', bg: '#FDF2F8' },
};

// Map MIME types to friendly labels
const getFileTypeLabel = (tag: string): string | null => {
  if (tag.includes('VND.') || tag.includes('APPLICATION/')) return null;
  if (tag.includes('WORDPROCESSING')) return 'Word';
  if (tag.includes('SPREADSHEET')) return 'Excel';
  if (tag.includes('PRESENTATION')) return 'PowerPoint';
  if (tag.toUpperCase() === 'PDF') return 'PDF';
  if (tag.toLowerCase().includes('image')) return 'Image';
  return tag;
};

// Clean tag for display
const cleanTag = (tag: string): string | null => {
  // Skip MIME types
  if (tag.includes('VND.') || tag.includes('application/')) return null;
  // Remove Legacy suffix
  if (tag.includes('(Legacy)')) return tag.replace(' (Legacy)', '');
  // Map file types
  return getFileTypeLabel(tag);
};

export function VaultCard({ record, onClick }: VaultCardProps) {
  const config = categoryConfig[record.type] || categoryConfig.documents;
  const Icon = config.icon;

  // Clean and limit tags
  const displayTags = record.tags
    .map(cleanTag)
    .filter((tag): tag is string => tag !== null)
    .slice(0, 3);

  return (
    <div
      className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 cursor-pointer flex flex-col min-h-[200px]"
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: config.bg }}
      >
        <Icon className="w-5 h-5" style={{ color: config.color }} />
      </div>

      {/* Title & Subtitle */}
      <div className="flex-1 mt-3">
        <h3 className="text-stone-900 font-semibold text-base leading-tight line-clamp-1">
          {record.title}
        </h3>
        {record.subtitle && (
          <p className="text-stone-500 text-sm mt-1 line-clamp-2">
            {record.subtitle}
          </p>
        )}
      </div>

      {/* Tags */}
      {displayTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {displayTags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-600 max-w-[100px] truncate h-fit"
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
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-stone-100 text-xs text-stone-400">
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
