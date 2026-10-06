"use client";

import TextArea from "@/components/common/TextArea";

import EditorSection from "./EditorSection";
import Field from "./Field";
import FieldLabel from "./FieldLabel";

interface SummaryProps {
  value: string;

  onChange: (value: string) => void;
}

export default function Summary({
  value,
  onChange,
}: SummaryProps) {
  return (
    <EditorSection
      title="Professional Summary"
      description="Introduce yourself in 3–5 lines."
    >
      <Field>
        <FieldLabel>
          Summary
        </FieldLabel>

        <TextArea
          rows={6}
          value={value}
          placeholder="Experienced Data Analyst with expertise in SQL, Python, Power BI and Machine Learning..."
          onChange={(e) =>
            onChange(e.target.value)
          }
        />
      </Field>
    </EditorSection>
  );
}