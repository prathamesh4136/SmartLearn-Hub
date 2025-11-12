// src/app/quiz/[id]/results/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getResults } from "../../../../lib/quizApi";

export default function ResultsPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if (!id) return;
    let mounted = true;
    getResults(id)
      .then((data)=> { if (mounted) setResults(Array.isArray(data) ? data : []); })
      .catch((err)=> {
        console.error("Failed to fetch results", err);
        alert("Failed to load results");
      })
      .finally(()=> mounted && setLoading(false));
    return ()=> { mounted = false; };
  },[id]);

  if (loading) return <div className="p-6">Loading results…</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Results</h2>
      <table className="w-full border rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Student</th>
            <th className="p-2">Score</th>
            <th className="p-2">Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r:any)=>(
            <tr key={r._id} className="border-t">
              <td className="p-2">{r.student?.fullName || r.student?.email || "Student"}</td>
              <td className="p-2">{r.score}</td>
              <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
