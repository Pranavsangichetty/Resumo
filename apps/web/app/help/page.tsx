"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FAQS = [
  {
    q: "How do I create a new resume?",
    a: 'Go to the Resume Builder from the sidebar, then click "Create New Resume." You can start from scratch or upload an existing resume to edit.',
  },
  {
    q: "What is the ATS Evaluation?",
    a: "ATS (Applicant Tracking System) Evaluation scans your resume against a job description and gives you a compatibility score. It highlights missing keywords, formatting issues, and suggestions to improve your chances of passing automated screening.",
  },
  {
    q: "How does the AI Optimizer work?",
    a: "The AI Optimizer rewrites and enhances your resume content to better match a target job description. It improves keyword density, action verbs, and overall structure while keeping your experience authentic.",
  },
  {
    q: "Can I generate a cover letter?",
    a: "Yes! Navigate to Cover Letter in the sidebar, select a resume and paste the job description. The AI will generate a tailored cover letter you can edit and download.",
  },
  {
    q: "How do I track my job applications?",
    a: 'Use the Applications page to log each job you apply to. You can track status (Applied, Interview, Offer, Rejected), add notes, and monitor your pipeline.',
  },
  {
    q: "What does the Mock Interview feature do?",
    a: "Mock Interview simulates a real interview based on the job role you specify. It asks questions, lets you respond, and provides AI-powered feedback on your answers.",
  },
  {
    q: "How do I change my account settings?",
    a: "Click Settings in the sidebar to update your profile, change your password, adjust theme preferences, and configure AI optimization targets.",
  },
  {
    q: "Is my data secure?",
    a: "Your data is stored securely and is only accessible to you. Passwords are hashed, and all API communication uses authenticated tokens. We do not share your personal information with third parties.",
  },
];

const GUIDES = [
  {
    icon: "📄",
    title: "Build Your First Resume",
    description:
      "Step-by-step walkthrough of creating a professional resume using our builder and templates.",
    steps: [
      'Open Resume Builder from the sidebar.',
      'Click "Create New Resume" or upload an existing one.',
      "Fill in your personal details, experience, education, and skills.",
      "Choose a template from the template gallery.",
      "Preview and download your resume as PDF.",
    ],
  },
  {
    icon: "⚡",
    title: "Optimize for ATS",
    description:
      "Learn how to maximize your ATS score and get past automated screening systems.",
    steps: [
      "Go to ATS Evaluation and select your resume.",
      "Paste the target job description.",
      "Review the score and keyword analysis.",
      "Use the AI Optimizer to automatically improve weak areas.",
      "Re-run the ATS scan to verify improvements.",
    ],
  },
  {
    icon: "💼",
    title: "Track Your Applications",
    description:
      "Keep all your job applications organized in one place with status tracking.",
    steps: [
      "Navigate to Applications in the sidebar.",
      'Click "Add Application" to log a new job.',
      "Fill in company, role, and application details.",
      "Update status as you progress (Applied, Interview, Offer).",
      "Use Analytics to see trends and insights across all applications.",
    ],
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openGuide, setOpenGuide] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Since there's no backend endpoint for this yet, we open mailto as fallback
    const mailto = `mailto:support@resumo.app?subject=${encodeURIComponent(contactForm.subject)}&body=${encodeURIComponent(contactForm.message)}`;
    window.open(mailto, "_blank");
    setContactSent(true);
    setContactForm({ subject: "", message: "" });
    setTimeout(() => setContactSent(false), 4000);
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-8 md:p-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-8">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition mb-2"
            >
              &larr; Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Help & Support</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Find answers, explore guides, and get in touch with support.
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* ─── Quick Start Guides ─── */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 md:p-8 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg">
                📖
              </div>
              <h2 className="text-xl font-semibold">Quick Start Guides</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6 ml-12">
              Step-by-step instructions to help you get the most out of Resumo.
            </p>

            <div className="space-y-3">
              {GUIDES.map((guide, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenGuide(openGuide === i ? null : i)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--bg-surface-elevated)] transition"
                  >
                    <span className="text-xl shrink-0">{guide.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {guide.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {guide.description}
                      </p>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
                        openGuide === i ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {openGuide === i && (
                    <div className="px-5 pb-4 pt-1 border-t border-[var(--border)]">
                      <ol className="space-y-2 ml-2 mt-3">
                        {guide.steps.map((step, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-bold mt-0.5">
                              {j + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ─── FAQs ─── */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 md:p-8 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-lg">
                ?
              </div>
              <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6 ml-12">
              Quick answers to the most common questions about Resumo.
            </p>

            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-[var(--bg-surface-elevated)] transition"
                  >
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {faq.q}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {openFaq === i && (
                    <div className="px-5 pb-4 pt-1 border-t border-[var(--border)]">
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ─── Contact Support ─── */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 md:p-8 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-lg">
                ✉
              </div>
              <h2 className="text-xl font-semibold">Contact Support</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6 ml-12">
              Can&apos;t find what you need? Send us a message and we&apos;ll get back to you.
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                  Subject
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  placeholder="e.g. Issue with resume download"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  placeholder="Describe your issue or question in detail..."
                  required
                  rows={5}
                  className={inputClass + " resize-none"}
                />
              </div>

              {contactSent && (
                <div className="rounded-lg p-3 text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  Your email client has been opened with the message. Thank you for reaching out!
                </div>
              )}

              <button
                type="submit"
                className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
              >
                Send Message
              </button>
            </form>
          </section>

          {/* ─── Keyboard Shortcuts ─── */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 md:p-8 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-lg">
                ⌨
              </div>
              <h2 className="text-xl font-semibold">Quick Tips</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6 ml-12">
              Get more productive with these tips and shortcuts.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { tip: "Use the AI chatbot (bottom-right) for instant help while building your resume.", icon: "💬" },
                { tip: "Run ATS Evaluation before every application to maximize your match score.", icon: "⚡" },
                { tip: "Track all applications in one place to spot patterns in your job search.", icon: "📊" },
                { tip: "Practice with Mock Interview before real interviews to boost confidence.", icon: "🎙" },
                { tip: "Customize your target ATS score in Settings for stricter optimization.", icon: "⚙" },
                { tip: "Use different resume templates for different industries and roles.", icon: "🎨" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-4"
                >
                  <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.tip}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
