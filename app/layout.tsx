import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitFlow CRM",
  description: "CRM and workflow hub for personal training, boutique gyms, and med spas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

