import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  showCount = false,
  maxLength,
  value,
  className = '',
  disabled,
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
          >
            {label}
          </label>
        )}
        {showCount && maxLength && (
          <span className="text-[11px] text-stone-400 font-mono">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <div className="relative rounded-xl shadow-sm">
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          rows={rows}
          disabled={disabled}
          className={`
            w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400
            transition-all duration-200 resize-y
            ${error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200/50'
              : 'border-stone-200/90 hover:border-stone-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-500/20'
            }
            ${disabled ? 'bg-stone-50 text-stone-400 cursor-not-allowed border-stone-200' : ''}
            focus:outline-none
            ${className}
          `}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-stone-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
