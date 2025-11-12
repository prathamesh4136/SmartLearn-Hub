"use client";
import React, { useEffect, useState } from "react";
import { getProgress } from "../../lib/quizApi";
import { useTheme } from "../../context/ThemeContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    let mounted = true;
    getProgress()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => {
        console.error("Failed to fetch progress", err);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (theme === "dark") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">📊 Progress</h1>
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow">
          ⚠️ Progress charts are not visible in dark mode.  
          Please switch to <span className="font-semibold">Light</span>,{" "}
          <span className="font-semibold">Blue</span>, or{" "}
          <span className="font-semibold">Purple</span> theme to continue.  
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading progress…</div>;
  if (!data) return <div className="p-6">No progress found.</div>;

  const chartData = data.submissions.map((s: any, i: number) => ({
    name: `Q${i + 1}`,
    score: s.score,
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 Your Progress</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-4 rounded-lg shadow bg-white">
          <h2 className="text-lg font-semibold">Total Quizzes</h2>
          <p className="text-3xl font-bold">{data.totalQuizzes}</p>
        </div>
        <div className="p-4 rounded-lg shadow bg-white">
          <h2 className="text-lg font-semibold">Total Score</h2>
          <p className="text-3xl font-bold">{data.totalScore}</p>
        </div>
        <div className="p-4 rounded-lg shadow bg-white">
          <h2 className="text-lg font-semibold">Average Score</h2>
          <p className="text-3xl font-bold">{data.avgScore}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-10 h-80 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Quiz Scores</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="score" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Submission list */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Recent Attempts</h2>
        <div className="space-y-3">
          {data.submissions.map((s: any) => (
            <div
              key={s.id}
              className="p-4 rounded-lg shadow bg-white flex justify-between"
            >
              <div>
                <h3 className="font-semibold">{s.quizTitle}</h3>
                <p className="text-sm text-gray-500">
                  Attempted: {new Date(s.attemptedAt).toLocaleString()}
                </p>
              </div>
              <div className="font-bold">{s.score} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
