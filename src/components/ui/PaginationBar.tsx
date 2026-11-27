'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationBarProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

/**
 * Reusable client pagination footer with page-size switcher and accessible navigation.
 */
export function PaginationBar({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = 'records',
}: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);

  const visiblePages = React.useMemo(() => {
    const pages: number[] = [];
    const maxButtons = 5;
    let from = Math.max(1, safePage - 2);
    const to = Math.min(totalPages, from + maxButtons - 1);
    from = Math.max(1, to - maxButtons + 1);
    for (let i = from; i <= to; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="flex flex-col gap-2.5 border-t border-bis-border bg-bis-surface-subtle/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-xs text-bis-muted">
        <span>
          Showing{' '}
          <strong className="font-semibold tabular-nums text-bis-text">
            {start}–{end}
          </strong>{' '}
          of{' '}
          <strong className="font-semibold tabular-nums text-bis-text">
            {totalItems.toLocaleString()}
          </strong>{' '}
          {itemLabel}
        </span>

        {onPageSizeChange && (
          <label className="inline-flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-text focus:border-bis-accent focus:outline-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2.5 text-xs font-medium text-bis-text transition-colors hover:bg-bis-surface-subtle disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {visiblePages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === safePage ? 'page' : undefined}
            className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-md border px-2 text-xs font-medium tabular-nums transition-colors ${
              p === safePage
                ? 'border-bis-accent bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
                : 'border-bis-border bg-bis-surface text-bis-muted hover:bg-bis-surface-subtle hover:text-bis-text'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Next page"
          className="inline-flex h-8 items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2.5 text-xs font-medium text-bis-text transition-colors hover:bg-bis-surface-subtle disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </nav>
    </div>
  );
}
