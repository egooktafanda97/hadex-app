import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { AppProvider } from "@/components/app-provider";

export const metadata: Metadata={title:{default:"HDEX Trans",template:"%s | HDEX Trans"},description:"Pemesanan tiket bus HDEX Trans aman, cepat, dan nyaman."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body><AppProvider><Header/>{children}</AppProvider></body></html>}
