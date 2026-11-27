'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  shortcutHint?: string;
  containerClassName?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

/**
 * Reusable search input styled to match Slate/Navy surface tokens with clear button
 * and optional keyboard shortcut hint.
 */
export function SearchInput({
  value,
  onChange,
  onClear,
  shortcutHint,
  placeholder = 'Search...',
  containerClassName = '',
  className = '',
  inputRef,
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
    inputRef?.current?.focus();
  };

  return (
    <div
      className={`relative flex items-center rounded-lg border border-bis-border bg-bis-surface-subtle transition-colors duration-150 focus-within:border-bis-accent focus-within:bg-bis-surface focus-within:ring-2 focus-within:ring-bis-accent-soft ${containerClassName}`}
    >
      <Search
        className="pointer-events-none ml-3 h-4 w-4 shrink-0 text-bis-muted"
        strokeWidth={1.85}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent px-2.5 py-1.5 text-sm text-bis-text placeholder:text-bis-muted focus:outline-none [&::-webkit-search-cancel-button]:appearance-none ${className}`}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="mr-2 flex h-5 w-5 items-center justify-center rounded text-bis-muted hover:bg-bis-border/50 hover:text-bis-text transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      ) : (
        shortcutHint && (
          <kbd className="mr-2 hidden sm:inline-flex items-center rounded border border-bis-border bg-bis-surface px-1.5 py-0.5 font-mono text-[10px] font-medium text-bis-muted shrink-0">
            {shortcutHint}
          </kbd>
        )
      )}
    </div>
  );
}
