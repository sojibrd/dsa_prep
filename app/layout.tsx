import type { Metadata } from "next";
import {
  Archivo,
  Archivo_Black,
  Barlow_Semi_Condensed,
  JetBrains_Mono,
  Noto_Sans_Bengali,
} from "next/font/google";
import "./globals.css";
import { parseDsaWorkbook } from "./utils/dsaParser";
import Shell from "./components/Shell";

/**
 * The font shelf. Five families are declared once, each on its own variable;
 * the theme picks which role gets which family via `--t-font-sans` /
 * `--t-font-mono`.
 *
 * Bengali is on the shelf because the Latin faces carry no Bengali glyphs —
 * without it the browser falls back silently and the app loses the theme's
 * typography exactly where the explanations and notes are read.
 *
 * Adding a family no theme uses yet is the ONLY reason to edit this file.
 */
const grotesk = Archivo({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const display = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const condensed = Barlow_Semi_Condensed({
  variable: "--font-condensed",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  display: "swap",
});

const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DSA Practice Workbook",
  description: "Personal DSA Practice Tracker and Workbook",
  manifest: "/manifest.json",
  other: {
    "theme-color": "#17140f",
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
  // Parsed here rather than per page: the rail is part of the chassis, and
  // both routes need the same topic tree behind it.
  const topics = parseDsaWorkbook();

  return (
    <html
      lang="en"
      className={`${condensed.variable} ${mono.variable} ${bengali.variable} ${grotesk.variable} ${display.variable} h-full antialiased`}
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
      <body className="surface-app min-h-full flex flex-col">
        <Shell topics={topics}>{children}</Shell>
      </body>
    </html>
  );
}
