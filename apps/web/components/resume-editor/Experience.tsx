"use client";

import Input from "@/components/common/Input";
import TextArea from "@/components/common/TextArea";

import EntryCard from "./EntryCard";
import EditorSection from "./EditorSection";
import EmptySection from "./EmptySection";
import Field from "./Field";
import FieldLabel from "./FieldLabel";
import SectionHeader from "./SectionHeader";

import type {
  Experience as ExperienceType,
} from "@/lib/resume-types";

interface ExperienceProps {
  experiences: ExperienceType[];

  onChange: (
    items: ExperienceType[]
  ) => void;
}

export default function Experience({
  experiences,
  onChange,
}: ExperienceProps) {
  function addExperience() {
    onChange([
      ...experiences,
      {
        id: crypto.randomUUID(),
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ]);
  }

  function remove(id: string) {
    onChange(
      experiences.filter(
        (x) => x.id !== id
      )
    );
  }

  function update(
    id: string,
    key: keyof ExperienceType,
    value: any
  ) {
    onChange(
      experiences.map((x) =>
        x.id === id
          ? {
              ...x,
              [key]: value,
            }
          : x
      )
    );
  }

  return (
    <EditorSection
      title="Experience"
      description="Add your work experience."
    >
      <SectionHeader
        title="Experience"
        onAdd={addExperience}
      />

      {experiences.length === 0 && (
        <EmptySection message="No experience added yet." />
      )}

      {experiences.map(
        (experience) => (
          <EntryCard
            key={experience.id}
            onDelete={() =>
              remove(
                experience.id
              )
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>
                  Company
                </FieldLabel>

                <Input
                  value={
                    experience.company
                  }
                  onChange={(e) =>
                    update(
                      experience.id,
                      "company",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field>
                <FieldLabel>
                  Role
                </FieldLabel>

                <Input
                  value={
                    experience.role
                  }
                  onChange={(e) =>
                    update(
                      experience.id,
                      "role",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field>
                <FieldLabel>
                  Location
                </FieldLabel>

                <Input
                  value={
                    experience.location
                  }
                  onChange={(e) =>
                    update(
                      experience.id,
                      "location",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field>
                <FieldLabel>
                  Start Date
                </FieldLabel>

                <Input
                  type="month"
                  value={
                    experience.startDate
                  }
                  onChange={(e) =>
                    update(
                      experience.id,
                      "startDate",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field>
                <FieldLabel>
                  End Date
                </FieldLabel>

                <Input
                  type="month"
                  value={
                    experience.endDate
                  }
                  onChange={(e) =>
                    update(
                      experience.id,
                      "endDate",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      experience.current
                    }
                    onChange={(e) =>
                      update(
                        experience.id,
                        "current",
                        e.target.checked
                      )
                    }
                  />
                  Currently Working Here
                </label>
              </Field>
            </div>

            <Field>
              <FieldLabel>
                Description
              </FieldLabel>

              <TextArea
                rows={5}
                value={
                  experience.description
                }
                onChange={(e) =>
                  update(
                    experience.id,
                    "description",
                    e.target.value
                  )
                }
                placeholder="Describe your responsibilities and achievements..."
              />
            </Field>
          </EntryCard>
        )
      )}
    </EditorSection>
  );
}