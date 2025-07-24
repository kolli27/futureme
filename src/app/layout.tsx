import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import GlobalErrorHandler from "@/components/error/GlobalErrorHandler";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// SF Pro equivalent using system fonts with Inter as primary
const systemFont = localFont({
  src: './fonts/GeistVF.woff', // Using existing Geist as a fallback, but we'll use CSS for SF Pro equivalent
  variable: '--font-system',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FutureSync - AI-Powered Life Transformation",
  description: "Transform your life through AI-powered daily habits that align with your future identity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${systemFont.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <GlobalErrorHandler>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </GlobalErrorHandler>
      </body>
    </html>
  );
}
