/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: { allowedOrigins: ["*"] }
  },
  async redirects() {
    // Legacy URLs: /search and /issue/* used to live at the root. Now they
    // live inside the authenticated /app shell.
    return [
      {
        source: "/search",
        destination: "/app/search",
        permanent: true
      },
      {
        source: "/issue/:owner/:name/:number",
        destination: "/app/issues/:owner/:name/:number",
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          }
        ]
      }
    ];
  }
};

// Only wrap with Sentry when a DSN is present. Lets the app build/run
// fine without Sentry installed in environments that don't want it.
let exported = nextConfig;
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { withSentryConfig } = require("@sentry/nextjs");
    exported = withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      hideSourceMaps: true,
      disableLogger: true
    });
  } catch (e) {
    console.warn("[next.config] Sentry requested but @sentry/nextjs unavailable:", e);
  }
}

module.exports = exported;
