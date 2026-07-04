/**
 * DirectoryHeader — Shared Primitive
 *
 * Odoo-style compact toolbar rendered at the top of every directory.
 * Renders: page title, active filter dropdown, inline search toggle,
 * record count, selected-row count badge, and a primary "New" + overflow
 * action menu slot.
 *
 * SOLID S: view-only, all handlers injected via props.
 * SOLID I: callers supply only what they need via optional slots.
 * DRY: one canonical header used by Courses, Students, and Mentors.
 */
import { useState } from 'react';
import {
  Search, Plus, MoreHorizontal,
  ChevronDown, ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterItem {
  id: string;
  label: string;
}

interface DirectoryHeaderProps {
  /** Section title e.g. "Students Directory" */
  title: string;
  /** Subtitle / description line */
  subtitle?: string;
  /** Total records count (after filter) */
  recordCount: number;
  /** Count of rows currently checked */
  selectedCount?: number;
  /** Controlled search value */
  searchQuery: string;
  onSearchChange: (q: string) => void;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** All available filter chips in the dropdown */
  filterItems: FilterItem[];
  /** Currently active filter ID */
  selectedFilterId: string;
  onSelectFilter: (id: string) => void;
  /** Starred filter IDs */
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  /** Primary action label (default "New") */
  newLabel?: string;
  onNewClick: () => void;
  /** Optional extra dropdown actions rendered inside the ··· menu */
  actionMenuSlot?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DirectoryHeader({
  title,
  subtitle,
  recordCount,
  selectedCount = 0,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterItems,
  selectedFilterId,
  onSelectFilter,
  favorites = [],
  onToggleFavorite,
  newLabel = 'New',
  onNewClick,
  actionMenuSlot,
}: DirectoryHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);
  const [defaultsExpanded, setDefaultsExpanded] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(false);

  const activeFilter = filterItems.find((f) => f.id === selectedFilterId);

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onToggleFavorite?.(id);
  };

  return (
    <div className="shrink-0 border-b border-border-subtle/60 bg-background/30 backdrop-blur-sm relative z-20">
      {/* Title row */}
      <div className="px-5 py-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-[10px] text-muted">{subtitle}</p>}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3.5">
          {/* Inline search */}
          <div className="relative">
            {searchOpen ? (
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  autoFocus
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  className="w-full pl-8 pr-3 py-1 text-[11px] bg-background border border-border-subtle rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 flex text-muted hover:text-foreground hover:bg-foreground/10 rounded-md transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Record / selection counts */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted font-semibold shrink-0">
              {recordCount} record{recordCount !== 1 ? 's' : ''}
            </span>
            {selectedCount > 0 && (
              <span className="text-[10px] text-primary font-bold shrink-0 bg-primary/10 px-2 py-0.5 rounded-full select-none">
                {selectedCount} selected
              </span>
            )}
          </div>

          <div className="h-4.5 w-px bg-border-subtle/40" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewClick}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary-hover shadow-xs transition-all text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {newLabel}
            </button>

            {/* Overflow menu */}
            {actionMenuSlot && (
              <div className="relative">
                <button
                  onClick={() => setActionsOpen((v) => !v)}
                  className="p-1.5 border border-border-subtle/60 rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors cursor-pointer focus:outline-none"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {actionsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActionsOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 min-w-[192px] z-50 rounded-xl border border-border-subtle/80 bg-card-bg shadow-2xl p-1.5 flex flex-col gap-1 text-xs text-foreground">
                      {actionMenuSlot}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="px-5 pb-2 flex items-center gap-2 relative">
        <div className="relative">
          <button
            onClick={() => setFilterDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground hover:bg-foreground/10 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer focus:outline-none"
          >
            <span>{activeFilter?.label ?? 'All'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted" />
          </button>

          {filterDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setFilterDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-1.5 w-64 max-h-[380px] z-50 rounded-xl border border-border-subtle/80 bg-card-bg shadow-2xl p-1.5 flex flex-col gap-1 text-xs text-foreground overflow-y-auto">

                {/* Favorites */}
                {favorites.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => setFavoritesExpanded(!favoritesExpanded)}
                      className={`w-full px-2.5 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors text-left cursor-pointer focus:outline-none ${
                        favorites.includes(selectedFilterId) ? 'text-primary bg-primary/5' : 'text-muted hover:bg-foreground/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {favoritesExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        <span>Favorites</span>
                      </div>
                      <span className={`text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ${
                        favorites.includes(selectedFilterId) ? 'bg-primary text-primary-foreground' : 'bg-muted/20 text-muted'
                      }`}>{favorites.length}</span>
                    </button>
                    {favoritesExpanded && (
                      <div className="flex flex-col gap-0.5">
                        {filterItems.filter((f) => favorites.includes(f.id)).map((item) => (
                          <button
                            key={`fav-${item.id}`}
                            onClick={() => { onSelectFilter(item.id); setFilterDropdownOpen(false); }}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-all hover:bg-foreground/5 cursor-pointer ${
                              selectedFilterId === item.id ? 'bg-primary/10 text-primary font-bold' : ''
                            }`}
                          >
                            <span>{item.label}</span>
                            <span onClick={(e) => handleToggleFavorite(e, item.id)} className="p-1 hover:bg-foreground/10 rounded-full transition-all text-amber-500 cursor-pointer">
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Default filters */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => setDefaultsExpanded(!defaultsExpanded)}
                    className={`w-full px-2.5 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors text-left cursor-pointer focus:outline-none ${
                      !favorites.includes(selectedFilterId) ? 'text-primary bg-primary/5' : 'text-muted hover:bg-foreground/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {defaultsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <span>Filters</span>
                    </div>
                    <span className={`text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ${
                      !favorites.includes(selectedFilterId) ? 'bg-primary text-primary-foreground' : 'bg-muted/20 text-muted'
                    }`}>{filterItems.length}</span>
                  </button>
                  {defaultsExpanded && (
                    <div className="flex flex-col gap-0.5">
                      {filterItems.map((item) => {
                        const isFav = favorites.includes(item.id);
                        return (
                          <button
                            key={`default-${item.id}`}
                            onClick={() => { onSelectFilter(item.id); setFilterDropdownOpen(false); }}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-all hover:bg-foreground/5 cursor-pointer ${
                              selectedFilterId === item.id ? 'bg-primary/10 text-primary font-bold' : ''
                            }`}
                          >
                            <span>{item.label}</span>
                            <span onClick={(e) => handleToggleFavorite(e, item.id)} className={`p-1 hover:bg-foreground/10 rounded-full transition-all cursor-pointer ${isFav ? 'text-amber-500' : 'text-muted/60 hover:text-amber-500'}`}>
                              {isFav
                                ? <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                : <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                              }
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
