"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { uploadExistingResume } from "@/lib/api";

interface ExistingResumeUploadProps {
  onUploaded?: () => void;
}

export default function ExistingResumeUpload({
  onUploaded,
}: ExistingResumeUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const fileName = file.name.toLowerCase();

    const isPdf = fileName.endsWith(".pdf");
    const isDocx = fileName.endsWith(".docx");

    if (!isPdf && !isDocx) {
      setSelectedFile(null);
      setError("Please select a PDF or DOCX file.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setSelectedFile(null);
      setError("File size must be less than 10 MB.");
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a resume first.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const resume = await uploadExistingResume(
        token,
        selectedFile
      );

      onUploaded?.();

      router.push(`/resume-builder/${resume.id}`);
    } catch (err) {
      console.error("Resume upload failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload resume. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  function openFilePicker() {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  }

  function removeSelectedFile() {
    setSelectedFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          Upload Existing Resume
        </h2>

        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
          Upload your existing resume and continue editing it
          in Resume.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={openFilePicker}
        disabled={uploading}
        className="w-full rounded-xl border border-dashed border-[var(--border)] px-4 py-5 text-center transition hover:border-blue-500/50 hover:bg-[var(--bg-muted)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="mt-2 text-[13px] font-medium text-[var(--text-primary)]">
          Choose your resume
        </div>

        <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
          PDF or DOCX · Maximum 10 MB
        </div>
      </button>

      {selectedFile && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)]">
                Selected file
              </div>

              <div className="mt-1 break-all text-sm text-[var(--text-muted)]">
                {selectedFile.name}
              </div>

              <div className="mt-1 text-xs text-[var(--text-muted)]">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>

            <button
              type="button"
              onClick={removeSelectedFile}
              disabled={uploading}
              className="shrink-0 text-xs text-[var(--text-muted)] transition hover:text-red-400 disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {uploading
          ? "Uploading and processing..."
          : "Upload & Continue"}
      </button>
    </div>
  );
}