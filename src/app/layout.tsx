import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://shoplens-6st8.vercel.app'),
  title: 'ShopLens AI | Shop Smarter. Pay Less.',
  description: 'Compare prices, analyze reviews, and make smarter purchasing decisions across all Pakistani stores.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
