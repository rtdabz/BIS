'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './LoadingSkeleton';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  footer?: React.ReactNode;
  className?: string;
}

const ALIGN_CLASS: Record<NonNullable<DataTableColumn<unknown>['align']>, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

/**
 * Reusable typed data table with consistent borders, optional sorting,
 * pagination footer slot, loading skeleton, and empty state.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching the current view.',
  emptyAction,
  onRowClick,
  sortKey,
  sortDirection = 'asc',
  onSort,
  footer,
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={5} />;
  }

  if (rows.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          compact
        />
      </div>
    );
  }

  return (
    <div>
      <div className={`w-full overflow-x-auto ${className}`}>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-bis-border bg-bis-surface-subtle">
              {columns.map((col) => {
                const isSortable = Boolean(col.sortable && onSort);
                const isActiveSort = sortKey === col.key;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-bis-muted ${
                      ALIGN_CLASS[col.align ?? 'left']
                    } ${col.className ?? ''}`}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => onSort?.(col.key)}
                        className={`inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-bis-border/40 hover:text-bis-text ${
                          isActiveSort ? 'text-bis-accent dark:text-[#93B9E6]' : ''
                        }`}
                      >
                        <span>{col.header}</span>
                        {isActiveSort ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-bis-border">
            {rows.map((row) => {
              const key = getRowKey(row);
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`transition-colors duration-100 ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-bis-surface-subtle'
                      : 'hover:bg-bis-surface-subtle/60'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 align-middle text-[13px] text-bis-text ${
                        ALIGN_CLASS[col.align ?? 'left']
                      } ${col.className ?? ''}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
