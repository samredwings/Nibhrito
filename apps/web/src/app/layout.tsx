import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nibhrito',
  description: 'A local-first private narrative companion',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
