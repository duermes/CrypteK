"use client";
import "@rainbow-me/rainbowkit/styles.css";

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <div>{children}</div>
  );
}
