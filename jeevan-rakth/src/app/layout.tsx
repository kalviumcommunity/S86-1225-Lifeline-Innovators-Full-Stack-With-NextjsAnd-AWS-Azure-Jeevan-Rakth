import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LayoutWrapper } from "@/components";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "sonner";
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
        <ThemeProvider>
          <AuthProvider>
            <UIProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster
                position="top-right"
                expand={false}
                richColors
                closeButton
                toastOptions={{
                  className: "toast",
                  duration: 4000,
                }}
              />
            </UIProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
