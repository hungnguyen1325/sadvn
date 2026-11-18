import type { Metadata } from "next";
import "../assets/main.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sadvn - Hệ thống tra cứu sản phẩm",
  description: "Sadvn - Hệ thống tra cứu sản phẩm",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
