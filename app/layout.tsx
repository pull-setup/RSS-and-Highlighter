import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { TextZoomProvider, TextZoomContent } from "./components/TextZoomContext";
import { Nav } from "./components/Nav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RSS & Highlights",
  description: "Personal knowledge hub: RSS reader and Kindle highlights",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <TextZoomProvider>
            <Nav />
            <main className="flex-1 max-w-4xl w-full mx-auto min-w-0 px-4 py-6 sm:px-6 md:px-8 bg-white dark:bg-zinc-950 [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))]">
              <TextZoomContent>{children}</TextZoomContent>
            </main>
          </TextZoomProvider>
        </Providers>
      </body>
    </html>
  );
}
