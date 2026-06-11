import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://elevatesystems.us"),
  title: "Elevate Systems | AI Automation and Custom Websites",
  description:
    "Premium AI automation, lead capture, CRM, chatbot, and custom website systems for service businesses.",
  icons: {
    icon: "/elevate-logo-transparent.png",
    shortcut: "/elevate-logo-transparent.png",
    apple: "/elevate-logo-transparent.png"
  },
  openGraph: {
    title: "Elevate Systems",
    description:
      "Automate lead generation, customer communication, booking, follow-ups, and internal workflows with AI.",
    images: ["/elevate-logo-transparent.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
