import './globals.css'
import '../styles/hero.css'
import '../styles/campaigns.css'
import '../styles/stats.css'
import '../styles/header.css'
import '../styles/footer.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KV Together - Cùng nhau gây quỹ, lan tỏa yêu thương',
  description: 'Nền tảng gây quỹ cộng đồng KV Together',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className={inter.className}>
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <a href="/">KV Together</a>
            </div>
            <nav className="nav-menu">
              <a href="/">Trang chủ</a>
              <a href="/chien-dich">Chiến dịch</a>
              <a href="/tin-tuc">Tin tức</a>
              <a href="/hoat-dong">Hoạt động</a>
              <a href="/ve-chung-toi">Về chúng tôi</a>
            </nav>
            <div className="auth-buttons">
              <a href="/dang-nhap" className="login">Đăng nhập</a>
              <a href="/dang-ky" className="register">Đăng ký</a>
            </div>
          </div>
        </header>
        
        {children}

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Về KV Together</h3>
              <p>Gây quỹ cộng đồng, lan tỏa yêu thương. Chúng tôi kết nối những tấm lòng thiện nguyện để tạo nên thay đổi tích cực.</p>
            </div>
            <div className="footer-section">
              <h3>Liên kết nhanh</h3>
              <div className="footer-links">
                <a href="/">Trang chủ</a>
                <a href="/chien-dich">Chiến dịch</a>
                <a href="/tin-tuc">Tin tức</a>
                <a href="/lien-he">Liên hệ</a>
              </div>
            </div>
            <div className="footer-section">
              <h3>Liên hệ</h3>
              <p>Email: contact@kvtogether.org</p>
              <div className="social-links">
                <a href="#" aria-label="Facebook">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 KV Together. Tất cả quyền được bảo lưu.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
