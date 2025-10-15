import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITTF Intelligence Hub - AI Table Tennis Assistant",
  description: "AI-powered assistant for the table tennis community providing instant answers about ITTF regulations, WTT events, rankings, and more in 15 languages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
