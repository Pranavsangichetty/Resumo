"use client";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

import EditorSection from "./EditorSection";
import FieldLabel from "./FieldLabel";

import { useState } from "react";

interface SkillsProps {
  skills: string[];

  onChange: (
    skills: string[]
  ) => void;
}

export default function Skills({
  skills,
  onChange,
}: SkillsProps) {
  const [skill, setSkill] =
    useState("");

  function addSkill() {
    const value = skill.trim();

    if (!value) return;

    if (skills.includes(value)) {
      setSkill("");
      return;
    }

    onChange([...skills, value]);

    setSkill("");
  }

  function removeSkill(
    value: string
  ) {
    onChange(
      skills.filter(
        (x) => x !== value
      )
    );
  }

  return (
    <EditorSection
      title="Technical Skills"
      description="Add your core technical skills."
    >
      <FieldLabel>
        Skill
      </FieldLabel>

      <div className="flex gap-3">
        <Input
          value={skill}
          placeholder="Python"
          onChange={(e) =>
            setSkill(
              e.target.value
            )
          }
        />

        <Button
          onClick={addSkill}
        >
          Add
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {skills.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800"
            >
              {item}

              <button
                onClick={() =>
                  removeSkill(
                    item
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </EditorSection>
  );
}