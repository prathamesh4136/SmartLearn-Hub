// src/types/quiz.ts
export type Question = {
  _id?: string;
  question: string;
  options: string[];
  answer?: string; // teacher only
};

export type Quiz = {
  _id?: string;
  title: string;
  description?: string;
  duration: number; // minutes
  restrictTabSwitch?: boolean;
  visibility?: "public" | "private";
  questions: Question[];
  createdBy?: string | { _id?: string; fullName?: string };
};
