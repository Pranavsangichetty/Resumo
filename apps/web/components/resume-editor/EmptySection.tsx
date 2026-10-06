interface EmptySectionProps {
  message: string;
}

export default function EmptySection({
  message,
}: EmptySectionProps) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] py-10 text-center text-sm text-[var(--text-muted)]">
      {message}
    </div>
  );
}