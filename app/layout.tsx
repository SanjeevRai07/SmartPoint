import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../components/CartProvider";

export const metadata: Metadata = {
  title: "SmartBuy — Shop Smarter, Live Better",
  description: "AI-powered shopping experience",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
