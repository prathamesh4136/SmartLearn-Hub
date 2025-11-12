"use client";
import { useState } from "react";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../../lib/firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function RegisterPage() {
  const { bgColor, textColor, buttonGreen } = useThemeClasses();
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
    city: "",
    parentContact: "",
    standard: "",
    subject: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCred.user;
      const idToken = await user.getIdToken();

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          fullName: form.fullName,
          email: form.email,
          role,
          school: form.school,
          city: form.city,
          parentContact: form.parentContact,
          standard: form.standard,
          subject: form.subject,
        }),
      });

      if (!res.ok) throw new Error("Registration failed");

      const data = await res.json();

      localStorage.setItem("token", idToken);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user || { uid: user.uid, email: form.email })
      );

      router.push("/");
    } catch (err) {
      console.error("Register error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bgColor} ${textColor}`}>
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          {role === "student" ? "🎓 Register as Student" : "👨‍🏫 Register as Teacher"}
        </h1>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setRole("student")}
            className={`px-4 py-2 rounded-lg ${
              role === "student" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setRole("teacher")}
            className={`px-4 py-2 rounded-lg ${
              role === "teacher" ? "bg-purple-600 text-white" : "bg-gray-200"
            }`}
          >
            Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="text"
            name="school"
            placeholder="School"
            value={form.school}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          {role === "student" ? (
            <>
              <input
                type="tel"
                name="parentContact"
                placeholder="Parent's Contact"
                value={form.parentContact}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md"
              />
              <input
                type="text"
                name="standard"
                placeholder="Standard"
                value={form.standard}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md"
              />
            </>
          ) : (
            <input
              type="text"
              name="subject"
              placeholder="Subjects You Teach"
              value={form.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          )}

          <button type="submit" className={`w-full ${buttonGreen} text-white py-3 rounded-lg`}>
            Register
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already registered?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
