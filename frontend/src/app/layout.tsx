import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '../styles/globals.css'
import '../styles/hero.css'
import '../styles/campaigns.css'
import '../styles/stats.css'
import '../styles/header.css'
import '../styles/footer.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KV Together - Nền tảng gây quỹ cộng đồng',
  description: 'Kết nối những tấm lòng nhân ái, lan tỏa yêu thương và xây dựng một xã hội tốt đẹp hơn.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
