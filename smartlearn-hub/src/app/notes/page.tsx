"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import Link from "next/link";

type Note = {
  _id: string;
  title: string;
  subject?: string;
  className?: string;
  uploadedBy?: { name?: string; email?: string; uid?: string };
  isFile?: boolean;
  fileMime?: string;
  filePath?: string;
  textContent?: string;
  createdAt?: string;
  visibility?: "public" | "private";
};

export default function NotesPage() {
  const { theme } = useTheme();
  const [publicNotes, setPublicNotes] = useState<Note[]>([]);
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "full">("preview");
  const [fileContent, setFileContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{uid: string} | null>(null);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
  const [form, setForm] = useState({
    title: "",
    subject: "",
    className: "",
    visibility: "public",
    textContent: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get current user info
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      }
    }
    
    fetchPublic();
    fetchMine();
  }, []);

  async function fetchPublic() {
    setLoadingPublic(true);
    try {
      const res = await fetch(`${API_BASE}/notes?visibility=public`);
      const data = await res.json();
      setPublicNotes(data.notes || []);
    } catch (err) {
      console.error("fetchPublic error", err);
    } finally {
      setLoadingPublic(false);
    }
  }

  async function fetchMine() {
    setLoadingMine(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMyNotes([]);
        setLoadingMine(false);
        return;
      }
      const res = await fetch(`${API_BASE}/notes/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn("Could not fetch my notes");
        setMyNotes([]);
      } else {
        const data = await res.json();
        setMyNotes(data.notes || []);
      }
    } catch (err) {
      console.error("fetchMine error", err);
    } finally {
      setLoadingMine(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      // clear textContent when uploading file
      setForm({ ...form, textContent: "" });
    }
  };

  async function handleCreateNote(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to create notes");
        setCreating(false);
        return;
      }

      const fd = new FormData();
      fd.append("title", form.title || (file ? file.name : "Untitled"));
      fd.append("subject", form.subject || "");
      fd.append("className", form.className || "");
      fd.append("visibility", form.visibility);
      if (file) {
        fd.append("file", file);
      } else {
        fd.append("textContent", form.textContent || "");
      }

      const res = await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Save failed", err);
        alert("Save failed: " + (err?.message || res.statusText));
        setCreating(false);
        return;
      }

      const data = await res.json();
      // refresh lists
      await fetchPublic();
      await fetchMine();
      // reset form
      setFile(null);
      setForm({ title: "", subject: "", className: "", visibility: "public", textContent: "" });
      if (editorRef.current) editorRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Save error", err);
      alert("Save failed");
    } finally {
      setCreating(false);
    }
  }

  async function handleDownload(note: Note) {
    try {
      const token = localStorage.getItem("token");
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/notes/${note._id}/download`, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Download failed: " + (err?.message || res.statusText));
        return;
      }
      // For files we expect attachment; create blob and download
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      let filename = "download";
      const m = disposition.match(/filename="?(.+)"?/);
      if (m && m[1]) filename = m[1];

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("download error", err);
      alert("Download failed");
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      return;
    }

    setDeletingId(noteId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to delete notes");
        return;
      }

      const res = await fetch(`${API_BASE}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Delete failed: " + (err?.message || res.statusText));
        return;
      }

      // Refresh the lists after successful deletion
      await fetchPublic();
      await fetchMine();
      alert("Note deleted successfully");
    } catch (err) {
      console.error("Delete error", err);
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleViewNote(note: Note) {
    setSelectedNote(note);
    setViewMode("preview");
    setLoadingContent(true);
    
    try {
      const token = localStorage.getItem("token");
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      if (note.isFile) {
        // For files, we need to check if it's a text file or PDF
        if (note.fileMime?.startsWith('text/') || note.title?.endsWith('.txt')) {
          // It's a text file, fetch and display content
          const res = await fetch(`${API_BASE}/notes/${note._id}/download`, { headers });
          if (res.ok) {
            const text = await res.text();
            setFileContent(text);
          } else {
            setFileContent("Unable to load file content.");
          }
        } else {
          // For non-text files like PDFs, we'll use an iframe
          setFileContent("");
        }
      } else {
        // For text notes, just use the textContent
        setFileContent(note.textContent || "");
      }
    } catch (err) {
      console.error("Error loading note content", err);
      setFileContent("Error loading content.");
    } finally {
      setLoadingContent(false);
    }
  }

  function handleCloseViewer() {
    setSelectedNote(null);
    setFileContent("");
  }

  function toggleViewMode() {
    setViewMode(viewMode === "preview" ? "full" : "preview");
  }

  // Check if current user owns a note
  const isNoteOwner = (note: Note) => {
    return currentUser && note.uploadedBy?.uid === currentUser.uid;
  };

  // UI classes
  const bg = theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900";
  const cardBg = theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const inputBg = theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900";
  const buttonPrimary = theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600";
  const buttonSecondary = theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300";
  const buttonDanger = theme === "dark" ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600";

  return (
    <div className={`min-h-screen p-4 md:p-8 ${bg}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Notes — Public & My Notes</h1>
          <div className="text-sm text-gray-500">
            Upload PDFs or create text notes. Private notes visible only to you.
          </div>
        </header>

        {/* Create / Upload panel */}
        <section className={`p-4 md:p-6 rounded-lg border ${cardBg}`}>
          <h2 className="text-lg font-semibold mb-4">Create New Note</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateNote(); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <input 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                placeholder="Title" 
                className={`w-full px-3 py-2 border rounded-md ${inputBg}`} 
              />
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  name="subject" 
                  value={form.subject} 
                  onChange={handleChange} 
                  placeholder="Subject" 
                  className={`flex-1 px-3 py-2 border rounded-md ${inputBg}`} 
                />
                <input 
                  name="className" 
                  value={form.className} 
                  onChange={handleChange} 
                  placeholder="Class (e.g. 10th)" 
                  className={`w-full md:w-40 px-3 py-2 border rounded-md ${inputBg}`} 
                />
                <select 
                  name="visibility" 
                  value={form.visibility} 
                  onChange={handleChange} 
                  className={`w-full md:w-40 px-3 py-2 border rounded-md ${inputBg}`}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Text note</label>
                <textarea 
                  ref={editorRef} 
                  name="textContent" 
                  value={form.textContent} 
                  onChange={handleChange} 
                  rows={6} 
                  placeholder="Write note text here (if not uploading a file)" 
                  className={`w-full px-3 py-2 border rounded-md ${inputBg}`} 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md cursor-pointer hover:border-blue-400 transition-colors">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium">Drag & drop or click to upload PDF or text file</span>
                  <span className="text-xs text-gray-500">(Max size: 10MB)</span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".pdf,.txt,.text" 
                    onChange={handleFile} 
                    className="hidden" 
                  />
                </label>
                {file && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} 
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  If file provided, text area is ignored.
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3">
              <button 
                type="submit" 
                disabled={creating} 
                className={`px-4 py-2 ${buttonPrimary} text-white rounded-md shadow-sm flex items-center justify-center gap-2`}
              >
                {creating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create / Upload
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => { 
                  setForm({ title: "", subject: "", className: "", visibility: "public", textContent: "" }); 
                  setFile(null); 
                  if (editorRef.current) editorRef.current.value = ""; 
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }} 
                className={`px-4 py-2 border rounded-md ${buttonSecondary}`}
              >
                Reset
              </button>
              <div className="text-xs text-gray-500 mt-3 p-2 rounded bg-gray-100 dark:bg-gray-700">
                <strong>Tips:</strong> Use clear titles, set visibility to private for personal notes.
              </div>
            </div>
          </form>
        </section>

        {/* Lists */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Public Notes {loadingPublic && <span className="text-sm font-normal">(loading...)</span>}
            </h2>
            <div className="space-y-3">
              {publicNotes.length === 0 && !loadingPublic && (
                <div className="text-sm text-gray-500 p-4 text-center border border-dashed rounded-md">
                  No public notes yet.
                </div>
              )}
              {publicNotes.map((n) => (
                <motion.div 
                  key={n._id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className={`p-4 rounded-md border ${cardBg} hover:shadow-sm transition-shadow`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-lg truncate">{n.title}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {n.subject && <>{n.subject} • </>}
                        {n.className || "No class specified"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        By {n.uploadedBy?.name || n.uploadedBy?.email || "Unknown"} • {new Date(n.createdAt || "").toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-2">
                      <button 
                        onClick={() => handleDownload(n)} 
                        className="px-3 py-1 text-sm rounded-md flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                      <button 
                        onClick={() => handleViewNote(n)} 
                        className="px-3 py-1 text-sm rounded-md flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Notes {loadingMine && <span className="text-sm font-normal">(loading...)</span>}
            </h2>
            <div className="space-y-3">
              {myNotes.length === 0 && !loadingMine && (
                <div className="text-sm text-gray-500 p-4 text-center border border-dashed rounded-md">
                  No notes created by you yet.
                </div>
              )}
              {myNotes.map((n) => (
                <motion.div 
                  key={n._id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className={`p-4 rounded-md border ${cardBg} hover:shadow-sm transition-shadow`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-lg truncate">{n.title}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {n.subject && <>{n.subject} • </>}
                        {n.className || "No class specified"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${n.visibility === "public" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"}`}>
                          {n.visibility}
                        </span>
                        {new Date(n.createdAt || "").toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-2">
                      <button 
                        onClick={() => handleDownload(n)} 
                        className="px-3 py-1 text-sm rounded-md flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                      <button 
                        onClick={() => handleViewNote(n)} 
                        className="px-3 py-1 text-sm rounded-md flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(n._id)} 
                        disabled={deletingId === n._id}
                        className={`px-3 py-1 text-sm rounded-md flex items-center gap-1 ${buttonDanger} text-white disabled:opacity-50`}
                      >
                        {deletingId === n._id ? (
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        {deletingId === n._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* File Viewer Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg shadow-xl ${viewMode === "preview" ? "w-full max-w-2xl h-96" : "w-full h-full max-w-6xl"} flex flex-col ${cardBg}`}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedNote.title}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={toggleViewMode}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  title={viewMode === "preview" ? "Expand" : "Shrink"}
                >
                  {viewMode === "preview" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
                <button 
                  onClick={handleCloseViewer}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {loadingContent ? (
                <div className="flex items-center justify-center h-full">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : selectedNote.isFile && selectedNote.fileMime === "application/pdf" ? (
                <iframe 
                  src={`${API_BASE}/notes/${selectedNote._id}/view`}
                  className="w-full h-full"
                  frameBorder="0"
                  title={selectedNote.title}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto h-full">
                  {fileContent || selectedNote.textContent || "No content available"}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
