import "@rainbow-me/rainbowkit/styles.css"; 
import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "CrypteK",
  description: "Mensajería onchain privada",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}