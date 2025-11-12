"use client";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();

  const bg =
    theme === "dark"
      ? "bg-gray-900 text-gray-300 border-gray-700"
      : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <footer className={`w-full mt-12 border-t ${bg}`}>
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-extrabold gradient-text">🎓 SmartLearn Hub</h2>
          <p className="mt-3 text-sm leading-relaxed">
            Empowering students with AI-powered tools, curated notes, quizzes, and
            personalized progress tracking to make learning smarter and easier.
          </p>
        </div>

        {/* Quick Links */}
        <nav aria-label="Footer Navigation">
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/notes" className="hover:underline transition-colors duration-200">
                📘 Notes
              </Link>
            </li>
            <li>
              <Link href="/quiz" className="hover:underline transition-colors duration-200">
                🧩 Quizzes
              </Link>
            </li>
            <li>
              <Link href="/ai-assistant" className="hover:underline transition-colors duration-200">
                🤖 AI Assistant
              </Link>
            </li>
            <li>
              <Link href="/progress" className="hover:underline transition-colors duration-200">
                📊 Progress
              </Link>
            </li>
          </ul>
        </nav>

        {/* Disclaimer */}
        <div>
          <h3 className="font-semibold mb-3">Notice</h3>
          <p className="text-sm leading-relaxed">
            ⚠ Some charts may not render properly in <strong>dark mode</strong>. 
            For best experience, switch to light mode while viewing visuals.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className={`text-center text-xs py-4 border-t ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        © {new Date().getFullYear()} <span className="font-semibold">SmartLearn Hub</span>. All rights reserved.
      </div>
    </footer>
  );
}
