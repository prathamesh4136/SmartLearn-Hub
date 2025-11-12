import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext"; // ✅ import your AuthProvider
import Navbar from "../components/Navbar";
import ThemeDrawer from "../components/ThemeDrawer";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "SmartLearn Hub - AI-Powered Learning Platform",
  description:
    "Personalized AI-powered learning that adapts to your pace and helps you grow smarter.",
  keywords: [
    "AI learning",
    "SmartLearn Hub",
    "personalized education",
    "adaptive learning",
    "student platform",
  ],
  authors: [{ name: "SmartLearn Team" }],
  openGraph: {
    title: "SmartLearn Hub - AI-Powered Learning Platform",
    description:
      "Personalized AI-powered learning that adapts to your pace and helps you grow smarter.",
    url: "https://your-domain.com",
    siteName: "SmartLearn Hub",
    images: [
      {
        url: "https://your-domain.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "SmartLearn Hub Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartLearn Hub - AI-Powered Learning Platform",
    description:
      "Personalized AI-powered learning that adapts to your pace and helps you grow smarter.",
    images: ["https://your-domain.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <ThemeProvider>
            {/* Global Navigation */}
            <Navbar />

            {/* Main Content */}
            <main id="main-content" className="flex-grow relative z-10">
              {children}
            </main>

            {/* Global UI */}
            <ThemeDrawer />
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
