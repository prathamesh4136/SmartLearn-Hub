// src/components/quiz/QuizForm.tsx
"use client";
import React, { useState } from "react";
import { createQuiz } from "../../lib/quizApi";
import { useRouter } from "next/navigation";

export default function QuizForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [restrictTabSwitch, setRestrictTabSwitch] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const [questions, setQuestions] = useState<{ question: string; options: string[]; answer?: string }[]>([
    { question: "", options: ["", ""], answer: "" },
  ]);

  function updateQuestion(i: number, patch: Partial<any>) {
    setQuestions((q) => q.map((qq, idx) => (idx === i ? { ...qq, ...patch } : qq)));
  }

  function addOption(qIndex: number) {
    setQuestions((q) => q.map((qq, idx) => (idx === qIndex ? { ...qq, options: [...qq.options, ""] } : qq)));
  }

  function removeOption(qIndex: number, optIndex: number) {
    setQuestions((q) => q.map((qq, idx) => idx === qIndex ? { ...qq, options: qq.options.filter((_,o)=>o!==optIndex) } : qq));
  }

  function addQuestion() {
    setQuestions((q) => [...q, { question: "", options: ["", ""], answer: "" }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        duration,
        restrictTabSwitch,
        visibility,
        questions: questions.map((qq) => ({
          question: qq.question,
          options: qq.options,
          answer: qq.answer,
        })),
      };
      const created = await createQuiz(payload);
      alert("Quiz created");
      router.push("/quiz");
    } catch (err) {
      console.error(err);
      alert("Create failed: " + ((err as any).message || ""));
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Quiz title" className="w-full p-3 border rounded" required/>
        <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" className="w-full p-3 border rounded" />
        <div className="flex gap-3">
          <input type="number" value={duration} onChange={(e)=>setDuration(Number(e.target.value))} className="w-32 p-2 border rounded" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={restrictTabSwitch} onChange={(e)=>setRestrictTabSwitch(e.target.checked)} /> Restrict tab switch</label>
          <select value={visibility} onChange={(e)=>setVisibility(e.target.value as any)} className="p-2 border rounded">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="p-4 border rounded bg-white dark:bg-gray-800">
            <div className="flex gap-2 items-center mb-3">
              <strong>Q{i+1}</strong>
              <input value={q.question} onChange={(e)=>updateQuestion(i, { question: e.target.value })} placeholder="Question text" className="flex-1 p-2 border rounded" />
            </div>

            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input value={opt} onChange={(e)=> {
                    const newOpts = q.options.slice(); newOpts[oi] = e.target.value;
                    updateQuestion(i, { options: newOpts });
                  }} className="flex-1 p-2 border rounded" placeholder={`Option ${oi+1}`} />
                  {q.options.length > 2 && <button type="button" onClick={()=>removeOption(i, oi)} className="px-3 py-1 bg-red-500 text-white rounded">-</button>}
                </div>
              ))}
              <div className="flex gap-2 items-center mt-2">
                <select value={q.answer} onChange={(e)=>updateQuestion(i,{ answer: e.target.value })} className="p-2 border rounded">
                  <option value="">Select correct answer</option>
                  {q.options.map((o,oi)=> <option key={oi} value={o}>{o || `Option ${oi+1}`}</option>)}
                </select>
                <button type="button" onClick={()=>addOption(i)} className="px-3 py-1 bg-indigo-600 text-white rounded">Add Option</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={addQuestion} className="px-4 py-2 bg-gray-200 rounded">Add Question</button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create Quiz</button>
      </div>
    </form>
  );
}
