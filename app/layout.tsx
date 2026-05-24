import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import StoreBootstrap from "@/components/StoreBootstrap";

export const metadata: Metadata = {
  title: "Keepr-E3tate | Zero-Knowledge Digital Estate",
  description: "A zero-knowledge digital estate orchestration platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <StoreBootstrap />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto ml-64">
            <div className="container mx-auto px-8 py-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
