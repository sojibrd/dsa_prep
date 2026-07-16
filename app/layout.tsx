import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSA Practice Workbook",
  description: "Personal DSA Practice Tracker and Workbook",
  manifest: "/manifest.json",
  other: {
    "theme-color": "#4f46e5",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "DSAPrep"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href={process.env.GITHUB_ACTIONS ? "/dsa_prep/manifest.json" : "/manifest.json"} />
        <link rel="apple-touch-icon" href={process.env.GITHUB_ACTIONS ? "/dsa_prep/next.svg" : "/next.svg"} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  const basePath = window.location.pathname.startsWith('/dsa_prep') ? '/dsa_prep' : '';
                  navigator.serviceWorker.register(basePath + '/sw.js', { scope: basePath + '/' }).then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
