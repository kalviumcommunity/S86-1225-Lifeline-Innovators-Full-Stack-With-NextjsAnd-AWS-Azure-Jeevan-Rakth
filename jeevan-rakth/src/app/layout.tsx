import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LayoutWrapper } from "@/components";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jeevan Rakth - Blood Donation Management",
  description: "Save lives by connecting blood donors with those in need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
