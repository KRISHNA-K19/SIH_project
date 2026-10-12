import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function FormInput({ label, error, helperText, className = "", id, ...props }: FormInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={inputId} className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-semibold">
        {label}
      </label>
      <input
        id={inputId}
        className={`bg-surface-panel border ${
          error ? "border-status-critical focus:border-status-critical" : "border-border-subtle focus:border-border-active"
        } rounded text-on-surface placeholder:text-outline/60 font-body-sm px-3 py-2 h-9 focus:outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <span className="font-label-xs text-status-critical mt-0.5">{error}</span>}
      {!error && helperText && <span className="font-label-xs text-outline mt-0.5">{helperText}</span>}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
}

export function FormSelect({ label, error, options, className = "", id, ...props }: FormSelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={selectId} className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-semibold">
        {label}
      </label>
      <select
        id={selectId}
        className={`bg-surface-panel border ${
          error ? "border-status-critical focus:border-status-critical" : "border-border-subtle focus:border-border-active"
        } rounded text-on-surface font-body-sm px-3 py-1.5 h-9 focus:outline-none transition-colors ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface-panel text-on-surface">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="font-label-xs text-status-critical mt-0.5">{error}</span>}
    </div>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function FormTextarea({ label, error, helperText, className = "", id, rows = 3, ...props }: FormTextareaProps) {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={textareaId} className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-semibold">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        className={`bg-surface-panel border ${
          error ? "border-status-critical focus:border-status-critical" : "border-border-subtle focus:border-border-active"
        } rounded text-on-surface placeholder:text-outline/60 font-body-sm p-3 focus:outline-none transition-colors resize-none ${className}`}
        {...props}
      />
      {error && <span className="font-label-xs text-status-critical mt-0.5">{error}</span>}
      {!error && helperText && <span className="font-label-xs text-outline mt-0.5">{helperText}</span>}
    </div>
  );
}
