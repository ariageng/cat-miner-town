import type { Metadata } from "next";
import { Varela_Round } from "next/font/google"; // 1. 引入字体
import "./globals.css";

// 2. 配置字体
const varela = Varela_Round({ 
  weight: "400", 
  subsets: ["latin"] 
});

export const metadata: Metadata = {
  title: "Cat Miner Town",
  description: "A cute idle game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. 应用字体 */}
      <body className={varela.className}>{children}</body>
    </html>
  );
}