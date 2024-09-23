import localFont from "next/font/local";
import "./globals.css";
import { Head } from 'next/head';                                                                                                                                                                                                         

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Calculate SOL PNL of your tracked wallets!",
  description: "Calculate SOL PNL of your tracked wallets! 🚀",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
