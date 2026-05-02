import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "./lib/i18n";
import { PHProvider } from "./lib/posthog";
import PageView from "./components/PageView";
import OnboardingTour from "./components/OnboardingTour";

export const metadata: Metadata = {
  title: "Yocias",
  description: "Precision Nutrition Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <Script src="https://www.googletagmanager.com/gtag/js?id=AW-965347290" strategy="afterInteractive" />
      <Script id="google-tag" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-965347290');
        gtag('config', 'G-HW4LW9PHX4');
      `}</Script>
      <body className="min-h-screen antialiased">
        <PHProvider>
          <LanguageProvider>
            <PageView />
            <OnboardingTour />
            {children}
          </LanguageProvider>
        </PHProvider>
      </body>
    </html>
  );
}
