import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WTS Stats',
  description: 'Water Polo Statistics Dashboard',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}

