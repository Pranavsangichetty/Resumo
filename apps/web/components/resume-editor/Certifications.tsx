"use client";

import Input from "@/components/common/Input";

import EntryCard from "./EntryCard";
import EditorSection from "./EditorSection";
import EmptySection from "./EmptySection";
import Field from "./Field";
import FieldLabel from "./FieldLabel";
import SectionHeader from "./SectionHeader";

import type {
  Certification as CertificationType,
} from "@/lib/resume-types";

interface CertificationsProps {
  certifications: CertificationType[];

  onChange: (
    items: CertificationType[]
  ) => void;
}

export default function Certifications({
  certifications,
  onChange,
}: CertificationsProps) {

  function addCertification() {
    onChange([
      ...certifications,
      {
        id: crypto.randomUUID(),
        name: "",
        issuer: "",
        issueDate: "",
        credentialUrl: "",
      },
    ]);
  }

  function remove(id: string) {
    onChange(
      certifications.filter(
        (item) => item.id !== id
      )
    );
  }

  function update(
    id: string,
    key: keyof CertificationType,
    value: string
  ) {
    onChange(
      certifications.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: value,
            }
          : item
      )
    );
  }

  return (
    <EditorSection
      title="Certifications"
      description="Show professional certifications and credentials."
    >
      <SectionHeader
        title="Certifications"
        onAdd={addCertification}
      />

      {certifications.length === 0 && (
        <EmptySection message="No certifications added yet." />
      )}

      {certifications.map((certification) => (
        <EntryCard
          key={certification.id}
          onDelete={() =>
            remove(certification.id)
          }
        >
          <div className="grid gap-4 md:grid-cols-2">

            <Field className="md:col-span-2">
              <FieldLabel required>
                Certification Name
              </FieldLabel>

              <Input
                value={certification.name}
                placeholder="Google Data Analytics Professional Certificate"
                onChange={(e) =>
                  update(
                    certification.id,
                    "name",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field>
              <FieldLabel>
                Issuing Organization
              </FieldLabel>

              <Input
                value={certification.issuer}
                placeholder="Google"
                onChange={(e) =>
                  update(
                    certification.id,
                    "issuer",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field>
              <FieldLabel>
                Issue Date
              </FieldLabel>

              <Input
                type="month"
                value={certification.issueDate}
                onChange={(e) =>
                  update(
                    certification.id,
                    "issueDate",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>
                Credential URL
              </FieldLabel>

              <Input
                value={certification.credentialUrl}
                placeholder="https://www.credly.com/..."
                onChange={(e) =>
                  update(
                    certification.id,
                    "credentialUrl",
                    e.target.value
                  )
                }
              />
            </Field>

          </div>
        </EntryCard>
      ))}
    </EditorSection>
  );
}