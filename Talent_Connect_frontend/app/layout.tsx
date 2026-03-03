import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/AppShell";
import ReduxProvider from "./StoreProvider";
import { AuthProvider } from "@/lib/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HUNAR Punjab | Hub for Upskilling, Networking & Access to Rozgar",
  description: "Placement & Training Management Portal",
  icons: {
    icon: "/Gov Logo.png",
    shortcut: "/Gov Logo.png",
    apple: "/Gov Logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ReduxProvider>
            <Providers>
              <AppShell>{children}</AppShell>
            </Providers>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
