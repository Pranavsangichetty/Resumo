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
  Project as ProjectType,
} from "@/lib/resume-types";

interface ProjectsProps {
  projects: ProjectType[];

  onChange: (
    items: ProjectType[]
  ) => void;
}

export default function Projects({
  projects,
  onChange,
}: ProjectsProps) {

  function addProject() {
    onChange([
      ...projects,
      {
        id: crypto.randomUUID(),
        name: "",
        technologies: "",
        link: "",
        description: "",
      },
    ]);
  }

  function remove(id: string) {
    onChange(
      projects.filter(
        (item) => item.id !== id
      )
    );
  }

  function update(
    id: string,
    key: keyof ProjectType,
    value: string
  ) {
    onChange(
      projects.map((item) =>
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
      title="Projects"
      description="Showcase your best academic or professional projects."
    >
      <SectionHeader
        title="Projects"
        onAdd={addProject}
      />

      {projects.length === 0 && (
        <EmptySection message="No projects added yet." />
      )}

      {projects.map((project) => (
        <EntryCard
          key={project.id}
          onDelete={() => remove(project.id)}
        >
          <div className="grid gap-4 md:grid-cols-2">

            <Field className="md:col-span-2">
              <FieldLabel required>
                Project Name
              </FieldLabel>

              <Input
                value={project.name}
                placeholder="Amazon Reviews Sentiment Analysis"
                onChange={(e) =>
                  update(
                    project.id,
                    "name",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>
                Technologies
              </FieldLabel>

              <Input
                value={project.technologies}
                placeholder="Python, Streamlit, Scikit-learn, NLP"
                onChange={(e) =>
                  update(
                    project.id,
                    "technologies",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>
                Project Link
              </FieldLabel>

              <Input
                value={project.link}
                placeholder="https://github.com/username/project"
                onChange={(e) =>
                  update(
                    project.id,
                    "link",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>
                Description
              </FieldLabel>

              <TextArea
                rows={6}
                value={project.description}
                placeholder="Describe your project, key achievements, and impact..."
                onChange={(e) =>
                  update(
                    project.id,
                    "description",
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