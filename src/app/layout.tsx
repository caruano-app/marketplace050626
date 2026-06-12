import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Caruano | Marketplace do Polo Textil do Agreste",
  description: "Marketplace regional para Caruaru, Toritama e Santa Cruz do Capibaribe.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FFC300",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased pb-16 md:pb-0`}>
        {children}
        <CartDrawer />
        <BottomNavigation />
        <InstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
