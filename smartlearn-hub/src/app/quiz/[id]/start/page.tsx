// src/app/quiz/[id]/start/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getQuiz } from "../../../../lib/quizApi";
import QuizPlayer from "../../../../components/quiz/QuizPlayer";

export default function StartQuizPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [quiz, setQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getQuiz(id)
      .then((data) => { if (mounted) setQuiz(data); })
      .catch((err) => {
        console.error(err);
        if ((err as any).status === 401) window.location.href = "/login";
        alert("Could not load quiz: " + (err as any).message || "");
      })
      .finally(()=> mounted && setLoading(false));
    return ()=> { mounted = false; };
  }, [id]);

  if (!id) return <div className="p-6">Invalid quiz id</div>;
  if (loading) return <div className="p-6">Loading quiz…</div>;
  if (!quiz) return <div className="p-6">Quiz not found</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <QuizPlayer quiz={quiz} />
    </div>
  );
}
