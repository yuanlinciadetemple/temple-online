import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "線上財神廟｜點數敬獻",
  description: "註冊會員，用點數向財神廟敬獻供品",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700;900&family=Noto+Sans+TC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink font-sansTC">{children}</body>
    </html>
  );
}
