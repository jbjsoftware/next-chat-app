import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "./globals.scss";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { UserPreferencesProvider } from "@/contexts/user-preferences-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatBot",
  description: "azure openai chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <UserPreferencesProvider>
              <main className="flex min-h-screen w-full flex-col">{children}</main>
            </UserPreferencesProvider>
          </ThemeProvider>
          <Toaster position="top-center" closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
