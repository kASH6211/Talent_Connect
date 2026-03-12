import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/AppShell";
import ReduxProvider from "./StoreProvider";
import { AuthProvider } from "@/lib/AuthProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "HUNAR Punjab | Hub for Upskilling, Networking & Access to Rozgar",
  description: "Placement & Training Management Portal",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/public/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} ${poppins.variable}`}>
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
