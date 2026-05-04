import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "兔兔护理队",
  description: "我们一起养兔兔的小社区",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
