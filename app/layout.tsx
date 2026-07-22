import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio.lucas-frischeisen.workers.dev"),
  title: "Lucas // Personal OS — IA, Backend & Creative Engineering",
  description:
    "Backend, inteligência artificial e experiências digitais que parecem vivas.",
  applicationName: "Lucas // Personal OS",
  authors: [{ name: "Lucas Frischeisen", url: "https://github.com/Rukafuu" }],
  creator: "Lucas Frischeisen",
  keywords: [
    "engenharia de IA",
    "backend",
    "agentes de IA",
    "TypeScript",
    "Python",
    "creative engineering",
    "Rukafuu",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Lucas // Personal OS",
    title: "Lucas // Personal OS — Sistemas que parecem vivos",
    description:
      "IA, backend, agentes, música e experiências digitais construídas entre código, curiosidade e um pouco de caos.",
    images: [
      {
        url: "/og-card.png",
        width: 1200,
        height: 630,
        alt: "Lucas Personal OS — Sistemas que parecem vivos",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lucas // Personal OS — Sistemas que parecem vivos",
    description:
      "IA, backend, agentes, música e experiências digitais construídas entre código e criatividade.",
    images: ["/og-card.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0b0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
