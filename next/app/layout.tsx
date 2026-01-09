/* /next/app/layout.tsx */

import "./globals.css";
import React from "react";

export const metadata = {
  title: "ADB Desktop Tool",
  description: "ADB Desktop GUI built with Next.js + Electron",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">{children}</body>
    </html>
  );
}
