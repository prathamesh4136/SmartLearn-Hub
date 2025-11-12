// lib/api.ts
export async function callApi(url: string, opts: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = opts.headers ? new Headers(opts.headers as any) : new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) throw await res.json().catch(() => ({ message: "Request failed" }));
  return res.json();
}
