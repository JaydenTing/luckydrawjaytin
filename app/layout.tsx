import type React from "react"
import type { Metadata } from "next"
import { Jua } from "next/font/google"
import "./globals.css"

const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jua",
})

export const metadata: Metadata = {
  title: "JayTIN Lucky Draw",
  description: "JayTIN Lucky Draw Application",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className={jua.variable}>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
