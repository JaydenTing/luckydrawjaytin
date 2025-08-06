import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JayTIN Lucky Draw',
  description: 'JayTIN Lucky Draw Application',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
