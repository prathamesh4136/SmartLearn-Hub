// src/components/quiz/QuestionCard.tsx
"use client";
import React from "react";

export default function QuestionCard({
  q,
  qIndex,
  selected,
  onSelect,
}: {
  q: any;
  qIndex: number;
  selected?: string;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
      <div className="mb-4">
        <div className="text-sm text-gray-500">Q{qIndex + 1}</div>
        <h3 className="text-lg font-semibold">{q.question}</h3>
      </div>

      <div className="space-y-3">
        {q.options.map((opt: string, i: number) => {
          const checked = selected === opt;
          return (
            <label
              key={i}
              className={`block p-3 rounded-lg cursor-pointer border ${checked ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}
            >
              <input
                type="radio"
                name={`q-${qIndex}`}
                className="mr-3"
                checked={checked}
                onChange={() => onSelect(opt)}
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
