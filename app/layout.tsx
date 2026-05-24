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
          colorPrimary: "#58a6ff",
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
          // Card is invisible — our AuthShell already provides the panel.
          cardBox: "bg-transparent border-0 shadow-none rounded-none",
          card:
            "bg-transparent shadow-none border-0 p-0 " +
            "[&_*]:font-sans",

          // Hide Clerk's own header (we render our own "Welcome back" above)
          header: "hidden",
          headerTitle: "hidden",
          headerSubtitle: "hidden",

          // Social buttons — GitHub-themed hero CTA.
          // GitHub's actual primary button colors: bg #24292f, hover #32383f.
          // The icon brightness filter ensures the octocat reads as pure white
          // even though Clerk renders it as the provider's brand color.
          socialButtonsBlockButton:
            "!bg-[#24292f] hover:!bg-[#32383f] !border !border-[#30363d] " +
            "!text-white !rounded-lg !py-3 !px-4 !transition-colors " +
            "!font-medium !text-[14px] !shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_0_0_1px_rgba(255,255,255,0.06)] " +
            "[&[data-provider=github]]:!bg-[#24292f] " +
            "[&[data-provider=github]]:hover:!bg-[#32383f]",
          socialButtonsBlockButtonText:
            "!text-white !font-medium !text-[14px] !normal-case",
          socialButtonsProviderIcon:
            "!brightness-[2] !invert-0 !w-5 !h-5",

          // form
          formFieldLabel:
            "text-xs uppercase tracking-[0.14em] text-ink-dim mb-1.5",
          formFieldInput:
            "bg-white/[0.04] border border-bg-border text-ink rounded-lg " +
            "placeholder:text-ink-dim focus:border-brand/70 " +
            "focus:shadow-[0_0_0_3px_rgba(124,92,255,0.25)] " +
            "transition-shadow",
          formFieldInputShowPasswordButton: "text-ink-mute hover:text-ink",
          formFieldAction: "text-brand hover:text-brand/80 text-xs",
          formFieldHintText: "text-ink-dim text-xs",
          formFieldErrorText: "text-err text-xs",

          formButtonPrimary:
            "bg-brand hover:bg-brand/90 text-white font-medium " +
            "rounded-lg shadow-[0_0_24px_rgba(124,92,255,0.45)] " +
            "py-2.5 transition-all normal-case text-sm",
          formButtonReset: "text-ink-mute hover:text-ink rounded-lg",

          // divider — "or sign in with email" feel
          dividerRow: "my-5",
          dividerLine: "bg-bg-border",
          dividerText:
            "text-ink-dim text-[10.5px] uppercase tracking-[0.2em] font-mono-tight px-3",

          // footer — Clerk's "Don't have an account? Sign up"
          footer:
            "bg-transparent border-t border-bg-border/60 " +
            "[&>*]:bg-transparent mt-4 pt-4",
          footerAction: "text-ink-mute text-[13px]",
          footerActionText: "text-ink-mute",
          footerActionLink: "text-brand hover:text-brand/80 font-medium",
          footerPagesLink: "text-ink-dim hover:text-ink-mute",

          // identity preview (post-OAuth email confirm)
          identityPreview:
            "bg-white/[0.04] border border-bg-border rounded-lg",
          identityPreviewText: "text-ink",
          identityPreviewEditButton: "text-brand hover:text-brand/80",

          // OTP
          otpCodeFieldInput:
            "bg-white/[0.04] border border-bg-border text-ink rounded-lg " +
            "focus:border-brand/70 focus:shadow-[0_0_0_3px_rgba(124,92,255,0.25)]",

          // alerts
          alert:
            "bg-warn/10 border border-warn/30 text-warn rounded-lg text-sm",
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
