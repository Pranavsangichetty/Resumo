"use client";

import {
  ResumeTemplate,
  TEMPLATE_NAMES,
} from "@/lib/template-types";

interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
}

const TEMPLATE_METADATA: Record<
  ResumeTemplate,
  { label: string; tag: string; atsFriendly: boolean }
> = {
  ats: { label: "ATS Professional", tag: "⭐ 100% ATS", atsFriendly: true },
  harvard: { label: "Harvard", tag: "⭐ ATS Classic", atsFriendly: true },
  modern: { label: "Modern", tag: "ATS Friendly", atsFriendly: true },
  google: { label: "Google", tag: "ATS Friendly", atsFriendly: true },
  executive: { label: "Executive", tag: "ATS Friendly", atsFriendly: true },
  minimal: { label: "Minimal", tag: "ATS Clean", atsFriendly: true },
  creative: { label: "Creative", tag: "Visual / Portfolio", atsFriendly: false },
  elegant: { label: "Elegant", tag: "Visual / Executive", atsFriendly: false },
  cloud: { label: "Cloud", tag: "ATS Friendly", atsFriendly: true },
};

export default function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  return (
    <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Resume Template
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Select a template. <span className="text-emerald-600 dark:text-emerald-400 font-medium">ATS-optimized</span> templates maximize automated scanner pass rates.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          ✓ ATS Compliant
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {TEMPLATE_NAMES.map((template) => {
          const meta = TEMPLATE_METADATA[template] || {
            label: template.charAt(0).toUpperCase() + template.slice(1),
            tag: "Template",
            atsFriendly: true,
          };
          const isSelected = selectedTemplate === template;

          return (
            <button
              key={template}
              type="button"
              onClick={() => onTemplateChange(template)}
              className={`group flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-zinc-300 bg-zinc-50 text-zinc-700 hover:border-blue-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{meta.label}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : meta.atsFriendly
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                      : "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300"
                }`}
              >
                {meta.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}