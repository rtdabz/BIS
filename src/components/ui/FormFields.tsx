'use client';

import * as React from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium text-bis-text"
      >
        {label}
        {required && <span className="ml-0.5 text-bis-danger">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-bis-danger">{error}</p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-bis-muted">{hint}</p>
      )}
    </div>
  );
}

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export function TextInput({
  hasError = false,
  startAdornment,
  endAdornment,
  className = '',
  ...props
}: TextInputProps) {
  return (
    <div
      className={`flex items-center rounded-lg border bg-bis-surface-subtle transition-colors focus-within:bg-bis-surface focus-within:ring-2 ${
        hasError
          ? 'border-bis-danger focus-within:border-bis-danger focus-within:ring-bis-danger/20'
          : 'border-bis-border focus-within:border-bis-accent focus-within:ring-bis-accent-soft'
      }`}
    >
      {startAdornment && (
        <span className="pl-3 text-xs font-medium text-bis-muted shrink-0">
          {startAdornment}
        </span>
      )}
      <input
        className={`w-full bg-transparent px-3 py-2 text-sm text-bis-text placeholder:text-bis-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        {...props}
      />
      {endAdornment && (
        <span className="pr-2.5 flex items-center shrink-0">{endAdornment}</span>
      )}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export function SelectInput({
  hasError = false,
  options,
  placeholder,
  className = '',
  ...props
}: SelectInputProps) {
  return (
    <select
      className={`w-full rounded-lg border bg-bis-surface-subtle px-3 py-2 text-sm text-bis-text transition-colors focus:bg-bis-surface focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        hasError
          ? 'border-bis-danger focus:border-bis-danger focus:ring-bis-danger/20'
          : 'border-bis-border focus:border-bis-accent focus:ring-bis-accent-soft'
      } ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          className="bg-bis-surface text-bis-text"
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export interface TextAreaInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function TextAreaInput({
  hasError = false,
  className = '',
  rows = 3,
  ...props
}: TextAreaInputProps) {
  return (
    <textarea
      rows={rows}
      className={`w-full rounded-lg border bg-bis-surface-subtle px-3 py-2 text-sm text-bis-text placeholder:text-bis-muted transition-colors focus:bg-bis-surface focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        hasError
          ? 'border-bis-danger focus:border-bis-danger focus:ring-bis-danger/20'
          : 'border-bis-border focus:border-bis-accent focus:ring-bis-accent-soft'
      } ${className}`}
      {...props}
    />
  );
}

export interface CheckboxFieldProps {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function CheckboxField({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-2.5 rounded-lg border border-bis-border bg-bis-surface-subtle/60 px-3 py-2.5 transition-colors ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-bis-surface-subtle'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-bis-border-strong accent-[var(--bis-accent)]"
      />
      <span className="min-w-0">
        <span className="block text-xs font-medium text-bis-text">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[11px] text-bis-muted">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

/**
 * Compact toolbar filter dropdown matching SearchInput dimensions.
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className = '',
}: FilterSelectProps) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-[34px] rounded-lg border border-bis-border bg-bis-surface-subtle px-2.5 text-xs font-medium text-bis-text transition-colors hover:border-bis-border-strong focus:border-bis-accent focus:bg-bis-surface focus:outline-none ${className}`}
    >
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          className="bg-bis-surface text-bis-text"
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-bis-border/70 bg-bis-surface-subtle/50 px-3 py-2">
      <dt className="text-[11px] font-medium text-bis-muted">{label}</dt>
      <dd
        className={`mt-0.5 text-[13px] font-medium text-bis-text ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value || '—'}
      </dd>
    </div>
  );
}
