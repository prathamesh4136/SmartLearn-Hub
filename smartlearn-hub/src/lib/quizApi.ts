import { getAuthHeaders } from "./auth";
import type { Quiz } from "../types/quiz";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

async function fetchJSON(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let json;
    try { json = JSON.parse(text); } catch {}
    const err = new Error(json?.message || res.statusText || "Request failed");
    (err as any).status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export async function listQuizzes() {
  return fetchJSON(`${API_BASE}/quiz`, {
    headers: await getAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });
}

export async function createQuiz(payload: Partial<Quiz>) {
  return fetchJSON(`${API_BASE}/quiz`, {
    method: "POST",
    headers: await getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}

export async function getQuiz(id: string) {
  return fetchJSON(`${API_BASE}/quiz/${id}`, {
    headers: await getAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });
}

export async function submitQuiz(id: string, answers: { questionId: string; selected: string }[]) {
  return fetchJSON(`${API_BASE}/quiz/${id}/submit`, {
    method: "POST",
    headers: await getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ answers }),
  });
}

export async function getResults(id: string) {
  return fetchJSON(`${API_BASE}/quiz/${id}/results`, {
    headers: await getAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });
}

export async function getProgress() {
  return fetchJSON(`${API_BASE}/quiz/progress/me`, {
    headers: await getAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });
}
