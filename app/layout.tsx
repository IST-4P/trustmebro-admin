import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const firaSans = Fira_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fira-sans",
});

export const metadata: Metadata = {
  title: "trustmebro admin - Quản trị hệ thống",
  description: "Hệ thống quản trị sàn thương mại điện tử",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={firaSans.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
