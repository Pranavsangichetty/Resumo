"use client";

import Input from "@/components/common/Input";
import EditorSection from "./EditorSection";
import Field from "./Field";
import FieldLabel from "./FieldLabel";

import { ResumeData } from "@/lib/resume-types";

interface PersonalDetailsProps {
  data: ResumeData;

  onChange: (
    personal: ResumeData["personal"]
  ) => void;
}

export default function PersonalDetails({
  data,
  onChange,
}: PersonalDetailsProps) {
  function update(
    key: keyof ResumeData["personal"],
    value: string
  ) {
    onChange({
      ...data.personal,
      [key]: value,
    });
  }

  return (
    <EditorSection
      title="Personal Details"
      description="Basic information shown at the top of your resume."
    >
      <div className="grid gap-5 md:grid-cols-2">

        <Field>
          <FieldLabel required>
            Full Name
          </FieldLabel>

          <Input
            value={data.personal.fullName}
            onChange={(e) =>
              update("fullName", e.target.value)
            }
            placeholder="John Doe"
          />
        </Field>

        <Field>
          <FieldLabel required>
            Email
          </FieldLabel>

          <Input
            value={data.personal.email}
            onChange={(e) =>
              update("email", e.target.value)
            }
            placeholder="john@email.com"
          />
        </Field>

        <Field>
          <FieldLabel>
            Phone
          </FieldLabel>

          <Input
            value={data.personal.phone}
            onChange={(e) =>
              update("phone", e.target.value)
            }
            placeholder="+91 9876543210"
          />
        </Field>

        <Field>
          <FieldLabel>
            Location
          </FieldLabel>

          <Input
            value={data.personal.location}
            onChange={(e) =>
              update("location", e.target.value)
            }
            placeholder="Hyderabad, India"
          />
        </Field>

        <Field>
          <FieldLabel>
            LinkedIn
          </FieldLabel>

          <Input
            value={data.personal.linkedin}
            onChange={(e) =>
              update("linkedin", e.target.value)
            }
            placeholder="linkedin.com/in/username"
          />
        </Field>

        <Field>
          <FieldLabel>
            GitHub
          </FieldLabel>

          <Input
            value={data.personal.github}
            onChange={(e) =>
              update("github", e.target.value)
            }
            placeholder="github.com/username"
          />
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel>
            Portfolio
          </FieldLabel>

          <Input
            value={data.personal.portfolio}
            onChange={(e) =>
              update("portfolio", e.target.value)
            }
            placeholder="https://portfolio.com"
          />
        </Field>

      </div>
    </EditorSection>
  );
}