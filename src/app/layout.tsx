import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bike Build",
  description: "Road bike configurator project scaffold."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
