"use client";
import React from "react";

export default function QuizSidebar({ items, current, onJump, violations }: any) {
  return (
    <aside className="bg-white dark:bg-gray-800 rounded p-3 shadow border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Questions</h3>
        {violations !== undefined && (
          <span className="text-xs text-red-600">⚠ {violations}</span>
        )}
      </div>

      {/* Mobile: smaller grid, Desktop: larger */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-4 gap-2">
        {items.map((it: any) => {
          const isCurrent = it.index === current;
          const cls = isCurrent
            ? "ring-2 ring-indigo-500 bg-indigo-100"
            : it.answered
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800";

          return (
            <button
              key={it.questionId}
              onClick={() => onJump(it.index)}
              className={`h-8 w-8 sm:h-10 sm:w-10 rounded flex items-center justify-center text-xs sm:text-sm font-medium ${cls}`}
            >
              {it.index + 1}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
