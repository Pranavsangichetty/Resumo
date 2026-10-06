"use client";

import Input from "@/components/common/Input";

import EntryCard from "./EntryCard";
import EditorSection from "./EditorSection";
import EmptySection from "./EmptySection";
import Field from "./Field";
import FieldLabel from "./FieldLabel";
import SectionHeader from "./SectionHeader";

import type {
  Education as EducationType,
} from "@/lib/resume-types";

interface EducationProps {
  education: EducationType[];

  onChange: (
    items: EducationType[]
  ) => void;
}

export default function Education({
  education,
  onChange,
}: EducationProps) {

  function addEducation() {
    onChange([
      ...education,
      {
        id: crypto.randomUUID(),
        institution: "",
        degree: "",
        fieldOfStudy: "",
        location: "",
        startDate: "",
        endDate: "",
        grade: "",
      },
    ]);
  }

  function remove(id: string) {
    onChange(
      education.filter(
        (item) => item.id !== id
      )
    );
  }

  function update(
    id: string,
    key: keyof EducationType,
    value: string
  ) {
    onChange(
      education.map((item) =>
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
      title="Education"
      description="Add your educational qualifications."
    >
      <SectionHeader
        title="Education"
        onAdd={addEducation}
      />

      {education.length === 0 && (
        <EmptySection message="No education added yet." />
      )}

      {education.map((item) => (
        <EntryCard
          key={item.id}
          onDelete={() => remove(item.id)}
        >
          <div className="grid gap-4 md:grid-cols-2">

            <Field>
              <FieldLabel required>
                Institution
              </FieldLabel>

              <Input
                value={item.institution}
                placeholder="University Name"
                onChange={(e) =>
                  update(
                    item.id,
                    "institution",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field>
              <FieldLabel required>
                Degree
              </FieldLabel>

              <Input
                value={item.degree}
                placeholder="Bachelor of Technology"
                onChange={(e) =>
                  update(
                    item.id,
                    "degree",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field>
              <FieldLabel>
                Field of Study
              </FieldLabel>

              <Input
                value={item.fieldOfStudy}
                placeholder="Computer Science"
                onChange={(e) =>
                  update(
                    item.id,
                    "fieldOfStudy",
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
                value={item.location}
                placeholder="Hyderabad"
                onChange={(e) =>
                  update(
                    item.id,
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
                value={item.startDate}
                onChange={(e) =>
                  update(
                    item.id,
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
                value={item.endDate}
                onChange={(e) =>
                  update(
                    item.id,
                    "endDate",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>
                Grade / CGPA
              </FieldLabel>

              <Input
                value={item.grade}
                placeholder="8.75 CGPA / 85%"
                onChange={(e) =>
                  update(
                    item.id,
                    "grade",
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