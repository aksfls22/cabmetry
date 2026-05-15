import type { Metadata, Viewport } from "next";

import { Inter } from "next/font/google";

import { ThemeScript } from "@/components/ThemeScript";
import { es } from "@/lib/i18n/es";

import "./globals.css";



const inter = Inter({

  subsets: ["latin"],

  variable: "--font-geist-sans",

});



export const metadata: Metadata = {

  title: es.meta.appTitle,

  description: es.meta.appDescription,

  manifest: "/manifest.json",

  appleWebApp: {

    capable: true,

    statusBarStyle: "black-translucent",

    title: es.brand,

  },

};



export const viewport: Viewport = {

  width: "device-width",

  initialScale: 1,

  maximumScale: 1,

  themeColor: [

    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },

    { media: "(prefers-color-scheme: dark)", color: "#0f1419" },

  ],

};



export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {

  return (

    <html lang="es" suppressHydrationWarning>

      <body className={`${inter.variable} font-sans`}>

        <ThemeScript />

        {children}

      </body>

    </html>

  );

}

