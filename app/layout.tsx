import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import StoreBootstrap from "@/components/StoreBootstrap";
import Toaster from "@/components/ui/Toaster";

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
        <Toaster />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to content
        </a>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main id="main-content" className="flex-1 overflow-y-auto ml-0 md:ml-64">
            <div className="container mx-auto px-4 md:px-8 pt-16 pb-6 md:pt-8 md:pb-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
