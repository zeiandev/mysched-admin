import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  // ✅ Allow Supabase, Sentry, and Edge Config requests
  "connect-src 'self' https://*.supabase.co https://*.sentry.io https://edge-config.vercel.com",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

// ✅ Wrap Next.js config with Sentry monitoring
export default withSentryConfig(nextConfig, {
  silent: true,
  org: "mysched",
  project: "sentry-lightblue-elephant",
  widenClientFileUpload: true,
  reactComponentAnnotation: true,
  disableLogger: true,
});
