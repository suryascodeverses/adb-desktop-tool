/* /next/app/layout.tsx */

import "./globals.css";
import React from "react";

export const metadata = {
  title: "ADB Manager - Desktop Tool",
  description:
    "Professional ADB Desktop GUI built with Next.js + Electron for Android development",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}