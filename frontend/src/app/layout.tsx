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
import { Toaster } from 'react-hot-toast'

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
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                fontSize: '14px',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
                style: {
                  borderLeft: '4px solid #10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                style: {
                  borderLeft: '4px solid #ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
