// src/app/quiz/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { listQuizzes } from "../../lib/quizApi";
import { auth } from "../../lib/firebaseClient";
import { getIdToken } from "firebase/auth";
import Link from "next/link";

interface UserWithRole {
  uid: string;
  email: string | null;
  role?: "teacher" | "student";
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
  useEffect(() => {
    let mounted = true;

    //Get current Firebase user + token
    auth.onAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        const token = await getIdToken(fbUser, true);
        // hit backend /api/auth/me to fetch role
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = await res.json();

        if (mounted) {
          setUser({ uid: fbUser.uid, email: fbUser.email, role: profile.role });
        }

        // fetch quizzes with token
        listQuizzes()
          .then((data) => {
            if (mounted) setQuizzes(Array.isArray(data) ? data : []);
          })
          .catch((err) => {
            console.error("Fetch quizzes failed", err);
            if ((err as any).status === 401) {
              window.location.href = "/login";
            }
          })
          .finally(() => mounted && setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading quizzes…</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Available Tests</h1>
        {user?.role === "teacher" && (
          <Link href="/quiz/create">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">
              Create Quiz
            </button>
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {quizzes.map((q) => (
          <div
            key={q._id}
            className="bg-white dark:bg-gray-800 p-4 rounded border shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-sm text-gray-500">{q.description}</p>
            </div>

            <div className="flex gap-3 items-center">
              <div className="text-sm text-gray-500">{q.duration} min</div>
              <Link href={`/quiz/${q._id}/start`}>
                <button className="px-3 py-2 bg-green-600 text-white rounded">
                  Start
                </button>
              </Link>
              {user?.role === "teacher" && (
                <Link href={`/quiz/${q._id}/results`}>
                  <button className="px-3 py-2 bg-gray-700 text-white rounded">
                    Results
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
