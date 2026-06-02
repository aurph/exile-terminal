import type { Metadata } from "next";
import { Cinzel, Spectral, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cinzel",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-spectral",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Exile Terminal · Path of Exile 2",
  description:
    "A personal command terminal for Path of Exile 2: economy, builds, uniques, and a current-patch Oracle.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cinzel.variable} ${spectral.variable} ${plexMono.variable} antialiased`}
    >
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
