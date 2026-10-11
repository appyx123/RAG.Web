import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScholarChat | BYOK Scientific Document Chat",
  description: "Bring Your Own Key document analysis and scientific research writing assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
