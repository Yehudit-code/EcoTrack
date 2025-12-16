import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Bootstrap for loading authenticated user from cookie
import AppUserBootstrap from "@/app/components/AppUserBootstrap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoTrack",
  description:
    "Track and manage your environmental impact with EcoTrack's comprehensive consumption monitoring system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sync user from HttpOnly cookie → Zustand (runs once on app load) */}
        <AppUserBootstrap />

        <main style={{ flex: "1" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
