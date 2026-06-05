// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "ALONE Recipes",
    template: "%s | ALONE Recipes",
  },
  description:
    "A curated collection of handcrafted recipes. Discover, cook, and savor.",
  keywords: ["recipes", "cooking", "food", "culinary"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="noise bg-mesh min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
