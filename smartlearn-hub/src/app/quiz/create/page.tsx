// src/app/quiz/create/page.tsx
"use client";
import React from "react";
import dynamic from "next/dynamic";
import QuizForm from "../../../components/quiz/QuizForm";

export default function CreateQuizPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Quiz</h1>
      <QuizForm />
    </div>
  );
}
