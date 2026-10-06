interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export default function FieldLabel({
  children,
  required = false,
}: FieldLabelProps) {
  return (
    <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">
      {children}

      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>
  );
}