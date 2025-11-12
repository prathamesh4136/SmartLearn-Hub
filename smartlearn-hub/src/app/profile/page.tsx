// src/app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, getIdToken } from "firebase/auth";
import { useTheme } from "../../context/ThemeContext";

export default function ProfilePage() {
  const router = useRouter();
  const auth = getAuth();
  const { theme } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [timeAssociated, setTimeAssociated] = useState("");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
  
  // ✅ fetch user profile from backend with fresh token
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        router.push("/login");
        return;
      }
      try {
        const token = await getIdToken(fbUser, true);
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const profile = await res.json();
        setUser(profile);
        setForm(profile);

        if (profile.createdAt) {
          const createdDate = new Date(profile.createdAt);
          const now = new Date();
          const msDiff = now.getTime() - createdDate.getTime();
          const days = Math.floor(msDiff / (1000 * 60 * 60 * 24));
          const months = Math.floor(days / 30);
          const years = Math.floor(months / 12);

          if (years > 0) setTimeAssociated(`${years} year${years > 1 ? "s" : ""}`);
          else if (months > 0) setTimeAssociated(`${months} month${months > 1 ? "s" : ""}`);
          else setTimeAssociated(`${days} day${days > 1 ? "s" : ""}`);
        }
      } catch (err) {
        console.error("Profile load error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [auth, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser?.getIdToken(true);
      const res = await fetch(`${API_BASE}/auth/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Update failed");
      const updatedUser = await res.json();
      setUser(updatedUser);
      setForm(updatedUser);
      setAlert({ message: "Changes saved successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setAlert({ message: "Failed to save changes.", type: "error" });
    } finally {
      setTimeout(() => setAlert(null), 4000);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  if (loading || !form) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-lg">Loading profile...</p>
      </div>
    );
  }

  // 🎨 Theme-based colors
  const themeBg =
    theme === "dark"
      ? "bg-gray-900"
      : theme === "blue"
      ? "bg-blue-50"
      : theme === "purple"
      ? "bg-purple-50"
      : "bg-gray-50";

  const themeCard =
    theme === "dark"
      ? "bg-gray-800"
      : theme === "blue"
      ? "bg-white border border-blue-200"
      : theme === "purple"
      ? "bg-white border border-purple-200"
      : "bg-white";

  const themeText = theme === "dark" ? "text-white" : "text-gray-900";

  return (
    <>
      <div className={`min-h-screen ${themeBg} ${themeText} flex flex-col items-center px-6 py-12`}>
        <div
          className={`max-w-6xl w-full ${themeCard} rounded-xl shadow-lg p-10 grid grid-cols-1 md:grid-cols-3 gap-10 relative`}
        >
          {/* Left: Avatar and summary */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-4xl font-bold select-none">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent select-none">
              {user?.fullName || "User"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Member for <span className="font-semibold">{timeAssociated}</span>
            </p>
          </div>

          {/* Right: Editable form */}
          <form onSubmit={handleSave} className="md:col-span-2 grid grid-cols-1 gap-6">
            <h2 className="text-3xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 select-none">
              Profile
            </h2>

            <div className="p-3 rounded bg-yellow-100 text-yellow-800 text-sm mb-4">
              ⚠️ Note: Charts may not be visible in dark mode. Please use light/blue/purple theme for best experience.
            </div>

            <div>
              <label htmlFor="fullName" className="block mb-1 font-medium select-none">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={form.fullName || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 font-medium select-none">
                Email (cannot change)
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>

            {form.role === "student" ? (
              <>
                <div>
                  <label htmlFor="parentContact" className="block mb-1 font-medium select-none">
                    Parent Contact
                  </label>
                  <input
                    id="parentContact"
                    type="text"
                    name="parentContact"
                    value={form.parentContact || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="standard" className="block mb-1 font-medium select-none">
                    Standard
                  </label>
                  <input
                    id="standard"
                    type="text"
                    name="standard"
                    value={form.standard || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="subject" className="block mb-1 font-medium select-none">
                  Subjects You Teach
                </label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={form.subject || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                🚪 Logout
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
              >
                💾 Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div
          className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 ${
            alert.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {alert.message}
        </div>
      )}
    </>
  );
}
