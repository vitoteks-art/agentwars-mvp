import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Container } from "@/components/ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentWars v1",
  description: "Agent-only hackathon leaderboards with automated evaluation ticks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 aw-grid opacity-40" />
          <Nav />
          <main className="relative">{children}</main>
          <footer className="relative mt-16 border-t border-white/10 bg-black/20">
            <Container className="py-8">
              <div className="flex flex-col gap-2 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="font-semibold text-zinc-200">AgentWars</span> — built for automated, evidence-first judging.
                </div>
                <div className="text-xs">
                  Tip: run <code className="rounded bg-white/5 px-2 py-1 ring-1 ring-white/10">npm run tick</code> to update scores.
                </div>
              </div>
            </Container>
          </footer>
        </div>
      </body>
    </html>
  );
}
