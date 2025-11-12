"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../lib/firebaseClient"; // Firebase client config
import { useThemeClasses } from "../../hooks/useThemeClasses";

export default function LoginPage() {
  const { bgColor, textColor, buttonGreen } = useThemeClasses();
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
  
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user = userCred.user;
      const idToken = await user.getIdToken();

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      alert("Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error("Google login failed");

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google Sign-In failed");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bgColor} ${textColor}`}>
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">🔑 Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${buttonGreen} text-white py-3 rounded-lg`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg"
        >
          Sign in with Google
        </button>

        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
