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
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#7c5cff",
          colorBackground: "transparent",
          colorInputBackground: "rgba(255,255,255,0.04)",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#a3a3b2",
          colorNeutral: "#ffffff",
          colorDanger: "#ff5e6c",
          colorSuccess: "#3ecf8e",
          colorWarning: "#ffb454",
          colorShimmer: "rgba(255,255,255,0.08)",
          borderRadius: "0.875rem",
          fontFamily: "inherit",
          fontSize: "0.95rem"
        },
        layout: {
          socialButtonsPlacement: "top",
          socialButtonsVariant: "blockButton",
          showOptionalFields: true,
          logoPlacement: "none"
        },
        elements: {
          rootBox: "w-full",
          cardBox:
            "bg-bg-card/85 backdrop-blur-xl border border-bg-border " +
            "rounded-2xl shadow-2xl shadow-black/40 overflow-hidden",
          card:
            "bg-transparent shadow-none border-0 p-7 sm:p-8 " +
            "[&_*]:font-sans",

          header: "mb-4",
          headerTitle: "text-ink text-xl font-semibold tracking-tight",
          headerSubtitle: "text-ink-mute text-sm",

          // social buttons (GitHub etc.)
          socialButtonsBlockButton:
            "border border-bg-border bg-white/[0.04] hover:bg-white/[0.08] " +
            "text-ink rounded-xl py-2.5 transition-colors",
          socialButtonsBlockButtonText: "text-ink font-medium",
          socialButtonsProviderIcon: "brightness-[1.6]",

          // form
          formFieldLabel:
            "text-xs uppercase tracking-[0.14em] text-ink-dim mb-1.5",
          formFieldInput:
            "bg-white/[0.04] border border-bg-border text-ink rounded-xl " +
            "placeholder:text-ink-dim focus:border-brand/70 " +
            "focus:shadow-[0_0_0_3px_rgba(124,92,255,0.25)] " +
            "transition-shadow",
          formFieldInputShowPasswordButton: "text-ink-mute hover:text-ink",
          formFieldAction: "text-brand hover:text-brand/80 text-xs",
          formFieldHintText: "text-ink-dim text-xs",
          formFieldErrorText: "text-err text-xs",

          formButtonPrimary:
            "bg-brand hover:bg-brand/90 text-white font-medium " +
            "rounded-xl shadow-[0_0_24px_rgba(124,92,255,0.45)] " +
            "py-2.5 transition-all normal-case text-sm",
          formButtonReset:
            "text-ink-mute hover:text-ink rounded-xl",

          // divider
          dividerLine: "bg-bg-border",
          dividerText:
            "text-ink-dim text-[10px] uppercase tracking-[0.18em]",

          // footer
          footer:
            "bg-transparent border-t border-bg-border/60 " +
            "[&>*]:bg-transparent mt-2",
          footerAction: "text-ink-mute text-sm",
          footerActionText: "text-ink-mute",
          footerActionLink:
            "text-brand hover:text-brand/80 font-medium",
          footerPagesLink: "text-ink-dim hover:text-ink-mute",

          // identity preview (e.g. when verifying email)
          identityPreview:
            "bg-white/[0.04] border border-bg-border rounded-xl",
          identityPreviewText: "text-ink",
          identityPreviewEditButton: "text-brand hover:text-brand/80",

          // OTP code input
          otpCodeFieldInput:
            "bg-white/[0.04] border border-bg-border text-ink rounded-xl " +
            "focus:border-brand/70 focus:shadow-[0_0_0_3px_rgba(124,92,255,0.25)]",

          // alerts
          alert:
            "bg-warn/10 border border-warn/30 text-warn rounded-xl text-sm",
          alertText: "text-ink",

          // misc
          formResendCodeLink: "text-brand hover:text-brand/80",
          userButtonPopoverCard:
            "bg-bg-card/95 backdrop-blur-xl border border-bg-border " +
            "rounded-2xl shadow-2xl shadow-black/40",
          userButtonPopoverActionButton: "text-ink hover:bg-white/5",
          userButtonPopoverActionButtonText: "text-ink",
          userButtonPopoverFooter: "bg-transparent border-bg-border"
        }
      }}
    >
      {tree}
    </ClerkProvider>
  );
}
