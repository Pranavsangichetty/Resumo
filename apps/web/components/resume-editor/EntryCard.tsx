import React from "react";
import Button from "@/components/common/Button";

interface EntryCardProps {
  children: React.ReactNode;
  onDelete?: () => void;
}

export default function EntryCard({
  children,
  onDelete,
}: EntryCardProps) {
  return (
    <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
      <div className="flex justify-end">
        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
          >
            Remove
          </Button>
        )}
      </div>

      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}