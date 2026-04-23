import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./lib/i18n";
import { PHProvider } from "./lib/posthog";
import PageView from "./components/PageView";

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
      <body className="min-h-screen antialiased">
        <PHProvider>
          <LanguageProvider>
            <PageView />
            {children}
          </LanguageProvider>
        </PHProvider>
      </body>
    </html>
  );
}
