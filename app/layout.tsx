import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://darusamajparty.online"),
  title: "Daru Samaj Party | Join The Movement",
  description:
    "Join Daru Samaj Party, a community movement standing for the dignity and rights of responsible adult drinkers. Get your Instagram-ready membership card.",
  openGraph: {
    title: "Daru Samaj Party | Join The Movement",
    description:
      "Join Daru Samaj Party — a community movement standing for the dignity and rights of responsible adult drinkers. Get your official membership card.",
    url: "https://darusamajparty.online",
    siteName: "Daru Samaj Party",
    images: [
      {
        url: "/assets/dsp-rally-poster.jpeg",
        width: 1200,
        height: 630,
        alt: "Daru Samaj Party — The Voice of Responsible Drinkers",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daru Samaj Party | Join The Movement",
    description:
      "Join Daru Samaj Party — a community movement standing for the dignity and rights of responsible adult drinkers.",
    images: ["/assets/dsp-rally-poster.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bebas.variable}`}>{children}</body>
    </html>
  );
}
