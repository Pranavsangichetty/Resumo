"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface InterviewQuestion {
  id: number;
  category: string;
  question: string;
  tips: string;
  sample_key_points: string[];
}

export default function MockInterviewPage() {
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState("Full Stack Developer");
  const [seniority, setSeniority] = useState("Senior");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setGenerating(true);
    setFeedback(null);
    setUserAnswer("");

    try {
      const res = await fetch(`${API_URL}/api/v1/mock-interview/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_title: jobTitle,
          seniority: seniority,
        }),
      });

      const data = await res.json();
      if (res.ok && data.questions) {
        setQuestions(data.questions);
        setActiveTab(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  function handleEvaluateAnswer() {
    if (!userAnswer.trim()) return;
    const currentQ = questions[activeTab];
    const wordCount = userAnswer.trim().split(/\s+/).length;

    let grade = "Good Attempt";
    let detail = "";

    if (wordCount < 30) {
      grade = "Needs More Detail";
      detail = "Your answer is quite brief. In interviews, elaborate with concrete examples, the exact actions you took, and measurable results.";
    } else if (wordCount >= 30 && wordCount < 80) {
      grade = "Solid Answer";
      detail = `Well-structured response! Make sure you clearly cover all key points: ${currentQ.sample_key_points.slice(0, 2).join(", ")}.`;
    } else {
      grade = "Comprehensive STAR Response";
      detail = "Excellent depth! You provided rich context. Practice delivering this smoothly in 90-120 seconds during a live interview.";
    }

    setFeedback(`Evaluation: ${grade} (${wordCount} words)\n\nFeedback: ${detail}\n\nKey Focus: ${currentQ.tips}`);
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-blue-500";

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-8 md:p-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-8">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-[var(--text-muted)] hover:text-blue-400 transition mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Mock Interview Simulator</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Practice behavioral & technical interview questions with STAR method coaching.
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 mb-8">
          <form onSubmit={handleGenerate} className="grid gap-4 sm:grid-cols-3 items-end">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Target Role
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Backend Engineer"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Seniority Level
              </label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className={inputClass}
              >
                <option value="Entry / Junior">Entry / Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Staff / Lead">Staff / Lead</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={generating}
              className="rounded-xl bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Questions →"}
            </button>
          </form>
        </section>

        {questions.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Question Selector Column */}
            <div className="lg:col-span-4 space-y-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setActiveTab(idx);
                    setFeedback(null);
                    setUserAnswer("");
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    activeTab === idx
                      ? "border-blue-500 bg-blue-500/10 text-[var(--text-primary)]"
                      : "border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-muted)] text-[var(--text-muted)]"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase text-blue-400 block mb-1">
                    Q{idx + 1} • {q.category}
                  </span>
                  <p className="text-sm font-medium line-clamp-2">{q.question}</p>
                </button>
              ))}
            </div>

            {/* Question Practice Area */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
                <span className="inline-block rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400 mb-3">
                  {questions[activeTab].category}
                </span>
                <h3 className="text-xl font-bold mb-4">{questions[activeTab].question}</h3>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-4 mb-5 text-xs text-[var(--text-muted)]">
                  <p className="font-semibold text-[var(--text-primary)] mb-1">💡 Coach Tip:</p>
                  <p>{questions[activeTab].tips}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                    Type or outline your response:
                  </label>
                  <textarea
                    rows={6}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Structure your answer: Situation, Task, Action taken, and measurable Result..."
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleEvaluateAnswer}
                    disabled={!userAnswer.trim()}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    Evaluate Answer
                  </button>
                </div>

                {feedback && (
                  <div className="mt-5 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-xs whitespace-pre-wrap leading-relaxed">
                    {feedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
