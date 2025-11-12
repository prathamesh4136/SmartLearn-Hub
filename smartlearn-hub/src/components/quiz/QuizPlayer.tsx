// src/components/quiz/QuizPlayer.tsx
"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import QuizSidebar from "./QuizSidebar";
import QuestionCard from "./QuestionCard";
import { submitQuiz as submitApi } from "../../lib/quizApi";
import { useRouter } from "next/navigation";

export default function QuizPlayer({ quiz }: { quiz: any }) {
  const router = useRouter();
  const questions = quiz.questions || [];
  const total = questions.length;

  // track answers by question index
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [violations, setViolations] = useState(0);
  const maxViolations = 3; // configurable
  const startTimeRef = useRef<number>(Date.now());
  // timer
  const [remaining, setRemaining] = useState(quiz.duration * 60); // seconds

  // prepare sidebar items
  const items = useMemo(
    () =>
      questions.map((q: any, i: number) => ({
        index: i,
        questionId: q._id || (q as any).id || `${i}`,
        answered: Boolean(answers[i]),
      })),
    [questions, answers]
  );

  // timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          handleSubmit(true); // auto submit when time up
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // tab switch detection
  useEffect(() => {
    const onBlur = () => setViolations((v) => v + 1);
    const onVisibility = () => {
      if (document.hidden) setViolations((v) => v + 1);
    };

    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (quiz.restrictTabSwitch && violations >= maxViolations) {
      // final action: auto submit
      handleSubmit(true);
    }
  }, [violations, quiz.restrictTabSwitch]);

  function secToHHMMSS(sec: number) {
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }

  function handleSelect(i: number, opt: string) {
    setAnswers((prev) => ({ ...prev, [i]: opt }));
  }

  function jump(i: number) {
    setCurrent(i);
  }

  async function handleSubmit(auto = false) {
    if (submitting) return;
    setSubmitting(true);
    const payload = Object.entries(answers).map(([index, selected]) => {
      const qi = Number(index);
      return {
        questionId: questions[qi]._id,
        selected,
      };
    });

    try {
      const res = await submitApi(quiz._id, payload);
      // on success, navigate to results or show score
      // prefer route to results page
      router.push(`/quiz/${quiz._id}/results`);
    } catch (err) {
      console.error("Submit failed", err);
      alert("Submit failed: " + (err as any).message || "");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Sidebar (desktop: left, mobile: collapsible top/bottom) */}
      <div className="lg:w-1/4 order-last lg:order-first">
        <div className="lg:sticky lg:top-4">
          <QuizSidebar
            items={items}
            current={current}
            onJump={jump}
            violations={quiz.restrictTabSwitch ? violations : undefined}
          />
        </div>
      </div>

      {/* Main Question Area */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded shadow sticky top-0 z-10">
          <span className="font-semibold">⏱ {secToHHMMSS(remaining)}</span>
          <button
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Quiz"}
          </button>
        </div>

        {/* Current Question */}
        <QuestionCard
          q={questions[current]}
          qIndex={current}
          selected={answers[current]}
          onSelect={(opt) => handleSelect(current, opt)}
        />

        {/* Navigation buttons (mobile friendly) */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => jump(Math.max(0, current - 1))}
            disabled={current === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => jump(Math.min(questions.length - 1, current + 1))}
            disabled={current === questions.length - 1}
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
