import "leaflet/dist/leaflet.css";
import "./globals.css";

import { DM_Sans, Syne } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata = {
  title: "Ashoknagar Kalyangarh Dashboard",
  description: "Ward-wise population density map with light and dark modes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${syne.variable}`}>
        {children}
      </body>
    </html>
  );
}