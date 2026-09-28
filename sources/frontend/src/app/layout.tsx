import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../assets/main.css";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

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
  const runtimeApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "";

  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <head>
        {runtimeApiUrl && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__ENV__ = { NEXT_PUBLIC_API_URL: ${JSON.stringify(runtimeApiUrl)} };`,
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
