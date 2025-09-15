import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";

const nonBureau = localFont({
  src: [
    // Black
    {
      path: './fonts/NonBureau-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/NonBureau-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
    // Bold
    {
      path: './fonts/NonBureau-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/NonBureau-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    // SemiBold
    {
      path: './fonts/NonBureau-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/NonBureau-SemiBoldItalic.woff2',
      weight: '600',
      style: 'italic',
    },
    // Medium
    {
      path: './fonts/NonBureau-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/NonBureau-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    // Regular
    {
      path: './fonts/NonBureau-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/NonBureau-RegularItalic.woff2',
      weight: '400',
      style: 'italic',
    },
    // Light
    {
      path: './fonts/NonBureau-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/NonBureau-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    // Thin
    {
      path: './fonts/NonBureau-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/NonBureau-ThinItalic.woff2',
      weight: '100',
      style: 'italic',
    },
  ]
})

export const metadata: Metadata = {
  title: "Mike Noired | UX Sketch",
  description: "some ux shit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nonBureau.className} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        {children}
      </body>
    </html>
  );
}
