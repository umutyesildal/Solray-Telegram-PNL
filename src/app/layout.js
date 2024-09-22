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
      <Head>
        <title>Solray PnL Calculator</title>
        <meta name="title" content="Solray PnL Calculator" />
        <meta
          name="description"
          content="Calculate and analyze PnL from Solray message exports. Process, visualize, and share your Solray trading performance easily."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://https://solray-telegram-pnl.vercel.app" />
        <meta property="og:title" content="Solray PnL Calculator" />
        <meta
          property="og:description"
          content="Calculate and analyze PnL from Solray message exports. Process, visualize, and share your Solray trading performance easily."
        />
        <meta
          property="og:image"
          content="https://https://solray-telegram-pnl.vercel.app/images/solray-pnl-calculator.png"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://yourdomain.com/" />
        <meta property="twitter:title" content="Solray PnL Calculator" />
        <meta
          property="twitter:description"
          content="Calculate and analyze PnL from Solray message exports. Process, visualize, and share your Solray trading performance easily."
        />
        <meta
          property="twitter:image"
          content="https://https://solray-telegram-pnl.vercel.app/images/solray-pnl-calculator.png"
        />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
