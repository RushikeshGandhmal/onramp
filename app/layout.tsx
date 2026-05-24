import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "On-Ramp — Find your next OSS issue in 10 seconds",
    template: "%s · On-Ramp"
  },
  description: SITE_DESCRIPTION,
  applicationName: "On-Ramp",
  keywords: [
    "open source",
    "github issues",
    "good first issue",
    "beginner friendly",
    "contribute",
    "oss",
    "first pr",
    "developer tools"
  ],
  authors: [{ name: "On-Ramp" }],
  creator: "On-Ramp",
  openGraph: {
    title: "On-Ramp — Find your next OSS issue in 10 seconds",
    description:
      "Type what you want to work on. On-Ramp finds curated, beginner-friendly GitHub issues and explains them with AI — no filters, no clutter, no signup.",
    url: SITE_URL,
    siteName: "On-Ramp",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "On-Ramp — Find your next OSS issue in 10 seconds",
    description:
      "Tell On-Ramp what you want to work on. It hands you the perfect open-source issue with AI explanations in seconds."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" }
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const tree = (
    <html lang="en">
      <body className="min-h-screen bg-bg text-ink font-sans antialiased selection:bg-brand/40">
        <div className="relative">{children}</div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );

  if (!clerkConfigured) return tree;

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#7c5cff",
          colorBackground: "#0a0a0f",
          colorInputBackground: "#15151c",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#a3a3b2",
          borderRadius: "0.75rem",
          fontFamily: "inherit"
        },
        elements: {
          card: "bg-bg-card border border-bg-border shadow-2xl shadow-black/40",
          headerTitle: "text-ink",
          headerSubtitle: "text-ink-mute",
          socialButtonsBlockButton:
            "border-bg-border bg-white/5 hover:bg-white/10 text-ink",
          formButtonPrimary:
            "bg-brand hover:bg-brand/90 text-white shadow-[0_0_24px_rgba(124,92,255,0.45)]",
          footerActionLink: "text-brand hover:text-brand/80"
        }
      }}
    >
      {tree}
    </ClerkProvider>
  );
}
