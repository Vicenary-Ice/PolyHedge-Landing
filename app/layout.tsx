import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolyHedge | Alternative Data for Serious Traders",
  description: "Proprietary alternative data intelligence platform for stock market and prediction market traders.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0A0A0A", color: "#FFFFFF" }}>
        {children}
      </body>
    </html>
  );
}
