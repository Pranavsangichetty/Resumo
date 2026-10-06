import React from "react";
import Button from "@/components/common/Button";

interface SectionHeaderProps {
  title: string;
  onAdd?: () => void;
}

export default function SectionHeader({
  title,
  onAdd,
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      {onAdd && (
        <Button
          size="sm"
          onClick={onAdd}
        >
          + Add
        </Button>
      )}
    </div>
  );
}