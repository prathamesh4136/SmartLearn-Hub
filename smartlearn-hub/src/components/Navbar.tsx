"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebaseClient";


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  const { user, logout } = useAuth(); // ✅ make sure logout is available
  const router = useRouter();

  const firstName = user?.fullName?.split(" ")[0] || "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Notes", href: "/notes", icon: "📘" },
    { name: "Quiz", href: "/quiz", icon: "🧩" },
    { name: "AI Assistant", href: "/ai-assistant", icon: "🤖" },
    { name: "Progress", href: "/progress", icon: "📊" },
  ];

  const themeBg =
    theme === "dark"
      ? "bg-gray-900"
      : theme === "blue"
        ? "bg-blue-100"
        : theme === "purple"
          ? "bg-purple-100"
          : "bg-white";

  const themeText = theme === "dark" ? "text-cyan-300" : "text-gray-800";

  // ✅ handle logout properly
  const handleLogout = async () => {
    try {
      await signOut(auth); // ✅ sign out from Firebase
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/"; // ✅ reload + redirect to homepage
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  const [authNote, setAuthNote] = useState<string | null>(null);

  useEffect(() => {
    const note = localStorage.getItem("auth_error");
    if (note) {
      setAuthNote(note);
      localStorage.removeItem("auth_error");
    }
  }, []);
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`w-full px-8 sm:px-12 py-4 sticky top-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${themeBg} ${scrolled
          ? "border-gray-200/70 dark:border-gray-700/70"
          : "border-gray-200/50 dark:border-gray-700/50"
        }`}
    >
      <div className="flex items-center w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl"
          >
            🎓
          </motion.div>
          <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            SmartLearn Hub
          </span>
        </Link>

        {/* Middle Nav (PC only) */}
        <div className="hidden lg:flex items-center gap-8 mx-auto">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href}>
                <motion.button
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-semibold text-lg ${themeText}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-auto">
          {/* PC version - show name + logout */}
          <div className="hidden lg:flex items-center gap-4">
            {firstName ? (
              <>
                <Link href="/profile">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer font-extrabold text-lg sm:text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    {firstName}
                  </motion.span>
                </Link>
                <motion.button
                  onClick={handleLogout} // ✅ proper logout
                  className="px-4 py-2 rounded-lg text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🚪 Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <motion.button
                    className="px-5 sm:px-7 py-2 rounded-xl border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all font-semibold text-base sm:text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    className="px-4 sm:px-7 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile - Name next to dropdown */}
          <div className="lg:hidden flex items-center gap-3">
            {firstName && (
              <Link href="/profile">
                <span className="font-bold text-base bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {firstName}
                </span>
              </Link>
            )}
            <motion.button
              className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-2xl">{isMenuOpen ? "✕" : "☰"}</span>
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`lg:hidden overflow-hidden mt-4 rounded-xl shadow-xl border ${themeBg}`}
          >
            <div className="p-4 space-y-3">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={item.href}>
                    <motion.button
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${themeText}`}
                      onClick={() => setIsMenuOpen(false)}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-lg">{item.name}</span>
                    </motion.button>
                  </Link>
                </motion.div>
              ))}

              {/* ✅ Auth Options for Mobile */}
              {firstName ? (
                <motion.button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🚪 Logout
                </motion.button>
              ) : (
                <>
                  <Link href="/login">
                    <motion.button
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all font-semibold text-lg"
                      onClick={() => setIsMenuOpen(false)}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link href="/register">
                    <motion.button
                      className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                      onClick={() => setIsMenuOpen(false)}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
