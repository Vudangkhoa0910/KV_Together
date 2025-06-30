
# BÁO CÁO PHÂN TÍCH HỆ THỐNG KV TOGETHER

## TỔNG QUAN KIẾN TRÚC HỆ THỐNG

### Công nghệ sử dụng:
- **Frontend**: Next.js 14 với TypeScript, TailwindCSS
- **Backend**: Laravel 10 với PHP, MySQL
- **Authentication**: Laravel Sanctum
- **UI Framework**: Headless UI, Heroicons

### Cấu trúc tổng thể:
```
KV_Together/
├── frontend/ (Next.js Application)
│   ├── src/app/ (App Router Pages)
│   ├── src/components/ (Reusable Components)
│   ├── src/contexts/ (React Contexts)
│   └── src/services/ (API Services)
├── backend/ (Laravel API)
│   ├── app/Http/Controllers/
│   ├── app/Models/
│   └── routes/api.php
└── data/ (Static Content)
```

---

## 1. VAI TRỒ USER (NGƯỜI DÙNG THÔNG THƯỜNG)

### A. GIAO DIỆN CHÍNH

#### 1. Trang chủ (`/`)
**Chức năng:**
- Hiển thị banner hero với slogan và call-to-action
- Thống kê tổng quan hệ thống (tổng quyên góp, số chiến dịch, người tham gia)
- Danh sách chiến dịch gây quỹ nổi bật
- Danh mục hoạt động từ thiện
- Tin tức và hoạt động cộng đồng mới nhất

**Phân tích giao diện:**
- Layout responsive với header, main content, footer
- Hero section với background image và overlay
- Cards layout cho campaigns với progress bars
- Statistics section với animated counters
- Featured news carousel

#### 2. Header Navigation
**Chức năng:**
- Logo và branding
- Menu điều hướng chính với MegaMenu
- Nút đăng nhập/đăng ký
- User menu dropdown (khi đã đăng nhập)

**Menu structure:**
- Trang chủ
- Chiến dịch (với MegaMenu hiển thị categories)
- Hoạt động
- Tin tức
- Về chúng tôi
- Liên hệ

#### 3. Trang Chiến dịch (`/campaigns`)
**Chức năng:**
- Danh sách tất cả chiến dịch gây quỹ
- Bộ lọc theo category, status, amount
- Tìm kiếm theo keyword
- Pagination
- Sorting options

**Chi tiết từng campaign card:**
- Hình ảnh campaign
- Tiêu đề và mô tả ngắn
- Progress bar (số tiền đã gây quỹ / mục tiêu)
- Số ngày còn lại
- Nút "Quyên góp ngay"

#### 4. Chi tiết Chiến dịch (`/campaigns/[slug]`)
**Chức năng:**
- Thông tin đầy đủ về chiến dịch
- Gallery hình ảnh/video
- Thông tin người tổ chức
- Lịch sử quyên góp
- Form quyên góp trực tiếp
- Nút chia sẻ social media
- Comments/feedback section

#### 5. Trang Hoạt động (`/activities`)
**Chức năng:**
- Danh sách hoạt động tình nguyện
- Lọc theo loại hoạt động, địa điểm, thời gian
- Tìm kiếm
- Đăng ký tham gia trực tiếp

#### 6. Trang Tin tức (`/news`)
**Chức năng:**
- Danh sách bài viết tin tức
- Categories: community, event, story, announcement
- Tìm kiếm và lọc
- Featured news section

### B. TÍNH NĂNG ĐĂNG NHẬP/ĐĂNG KÝ

#### 1. Trang Đăng nhập (`/auth/login`)
**Chức năng:**
- Form đăng nhập với email/password
- Remember me option
- Forgot password link
- Redirect về trang phù hợp sau đăng nhập

#### 2. Trang Đăng ký (`/auth/register`)
**Chức năng:**
- Form đăng ký với validation
- Xác nhận email
- Terms & conditions acceptance

### C. DASHBOARD NGƯỜI DÙNG (`/user/*`)

#### 1. Tổng quan Dashboard (`/user/dashboard`)
**Chức năng:**
- Thống kê cá nhân:
  - Tổng số lần quyên góp
  - Tổng số tiền đã quyên góp
  - Số chiến dịch đang theo dõi
- Lịch sử quyên góp gần đây
- Chiến dịch đang theo dõi
- Hoạt động đã đăng ký

#### 2. Quản lý Quyên góp (`/user/donations`)
**Chức năng:**
- Danh sách tất cả quyên góp đã thực hiện
- Trạng thái thanh toán
- Download receipt/certificate
- Lọc theo thời gian, campaign

#### 3. Hoạt động đã đăng ký (`/user/registrations`)
**Chức năng:**
- Danh sách hoạt động đã đăng ký
- Trạng thái tham gia
- Calendar view
- Cancel registration

#### 4. Profile cá nhân (`/user/profile`)
**Chức năng:**
- Cập nhật thông tin cá nhân
- Đổi mật khẩu
- Cài đặt notifications
- Privacy settings

---

## 2. VAI TRỒ FUNDRAISER (NGƯỜI GÂY QUỸ)

### A. LAYOUT CHUYÊN DỤNG (layout.tsx)
**Đặc điểm:**
- Sidebar navigation với menu items cụ thể
- Header với user info và logout
- Responsive mobile menu
- Color scheme: Orange theme

### B. DASHBOARD FUNDRAISER (`/fundraiser/dashboard`)

#### 1. Tổng quan
**Chức năng:**
- Statistics cards:
  - Tổng số chiến dịch (active/completed)
  - Tổng số hoạt động
  - Tổng số bài viết tin tức
  - Tổng số donors
  - Tổng tiền đã gây quỹ
  - Số dư ví

#### 2. Recent Activities Section
**Hiển thị:**
- Chiến dịch gần đây
- Hoạt động sắp tới
- Tin tức đã publish
- Quick action buttons

### C. QUẢN LÝ CHIẾN DỊCH (`/fundraiser/campaigns`)

#### 1. Danh sách Chiến dịch
**Chức năng:**
- View all campaigns (active, completed, draft)
- Create new campaign button
- Edit/Delete actions
- Campaign statistics overview
- Status management

#### 2. Tạo Chiến dịch mới
**Form fields:**
- Tiêu đề và mô tả
- Mục tiêu gây quỹ
- Thời gian bắt đầu/kết thúc
- Upload hình ảnh/video
- Category selection
- Detailed content editor

#### 3. Chỉnh sửa Chiến dịch
**Chức năng:**
- Update campaign information
- Add progress updates
- Manage donations
- Communication with donors

### D. QUẢN LÝ HOẠT ĐỘNG (`/fundraiser/activities`)

#### 1. Danh sách Hoạt động
**Chức năng:**
- View all activities
- Create new activity
- Manage registrations
- Event calendar view

#### 2. Tạo Hoạt động mới
**Form fields:**
- Tên hoạt động
- Địa điểm và thời gian
- Số lượng participants
- Registration fee (nếu có)
- Activity description
- Required skills/equipment

### E. QUẢN LÝ TIN TỨC (`/fundraiser/news`)

#### 1. Content Management
**Chức năng:**
- Create news articles
- Edit published content
- Manage categories
- Schedule publishing
- View analytics (views, engagement)

### F. BÁO CÁO & THỐNG KÊ (`/fundraiser/reports`)

#### 1. Financial Reports
**Chức năng:**
- Donation analytics
- Revenue tracking
- Withdrawal history
- Tax documentation

#### 2. Activity Reports
**Chức năng:**
- Participation rates
- Feedback analysis
- Impact measurement

### G. VÍ ĐIỆN TỬ (`/fundraiser/wallet`)

#### 1. Wallet Management
**Chức năng:**
- View current balance
- Withdrawal requests
- Transaction history
- Payment method management

---

## 3. VAI TRỒ ADMINISTRATOR (QUẢN TRỊ VIÊN)

### A. ADMIN LAYOUT (layout.tsx)
**Đặc điểm:**
- Dedicated admin sidebar với full navigation
- Admin header với search và notifications
- Protected routes với role-based access
- Admin-specific styling và branding

### B. ADMIN DASHBOARD (page.tsx)

#### 1. Tổng quan Hệ thống
**Statistics Cards:**
- Tổng số người dùng (với breakdown theo role)
- Tổng số chiến dịch (active/pending/completed)
- Tổng tiền quyên góp
- Hoạt động trong tháng

#### 2. Pending Approvals Section
**Chức năng:**
- Danh sách fundraiser chờ duyệt
- Danh sách campaign chờ duyệt
- Quick approve/reject buttons
- Batch actions

#### 3. Recent Activities Timeline
**Hiển thị:**
- User registrations
- Campaign creations
- Donation activities
- System events với timestamps

#### 4. Quick Management Links
**Navigation cards đến:**
- User management
- Campaign management
- Financial oversight
- System analytics

### C. QUẢN LÝ NGƯỜI DÙNG (`/admin/users`)

#### 1. User List Management
**Chức năng:**
- Danh sách tất cả users với pagination
- Search và filter theo role, status
- Bulk actions (approve, suspend, delete)
- User details modal

#### 2. User Actions
**Có thể thực hiện:**
- Approve pending users
- Suspend/activate accounts
- Change user roles
- View user activity history
- Delete users (except admins)

#### 3. Create New User
**Admin có thể:**
- Tạo user mới với role specified
- Set initial status
- Send invitation emails

### D. QUẢN LÝ CHIẾN DỊCH (`/admin/campaigns`)

#### 1. Campaign Oversight
**Chức năng:**
- View all campaigns across system
- Approve/reject submitted campaigns
- Monitor campaign performance
- Handle reported campaigns

#### 2. Campaign Moderation
**Actions available:**
- Edit campaign details
- Change campaign status
- Refund donations (if needed)
- Communicate with organizers

### E. QUẢN LÝ HOẠT ĐỘNG (`/admin/activities`)

#### 1. Activity Supervision
**Chức năng:**
- Oversight of all activities
- Approve activity registrations
- Monitor safety compliance
- Handle activity reports

### F. QUẢN LÝ TÀI CHÍNH (`/admin/finances`)

#### 1. Financial Oversight
**Chức năng:**
- Monitor all transactions
- Approve withdrawal requests
- Generate financial reports
- Tax compliance management

#### 2. Donation Management
**Features:**
- Track donation flows
- Handle refund requests
- Monitor fraud prevention
- Payment gateway management

### G. THỐNG KÊ & PHÂN TÍCH (`/admin/analytics`)

#### 1. System Analytics
**Reports include:**
- User growth metrics
- Campaign success rates
- Financial performance
- Platform usage statistics

#### 2. Content Analytics
**Tracking:**
- Most popular campaigns
- User engagement metrics
- Geographic distribution
- Seasonal trends

### H. CÀI ĐẶT HỆ THỐNG (`/admin/settings`)

#### 1. Platform Configuration
**Management của:**
- Site-wide settings
- Payment gateway configuration
- Email templates
- Notification settings

#### 2. Content Management
**Control over:**
- Category management
- Featured content selection
- Banner/announcement management
- SEO settings

---

## TÍNH NĂNG CHUNG TRÊN TẤT CẢ VAI TRỒ

### 1. Authentication & Authorization
- JWT token-based authentication với Laravel Sanctum
- Role-based access control
- Session management
- Password reset functionality

### 2. Responsive Design
- Mobile-first approach
- Tablet và desktop optimization
- Touch-friendly interfaces
- Progressive Web App features

### 3. Notification System
- In-app notifications
- Email notifications
- Push notifications (planned)
- Notification preferences

### 4. Search & Filter
- Global search functionality
- Advanced filtering options
- Category-based browsing
- Sort options

### 5. Social Features
- Social media sharing
- User following/followers
- Comments và feedback
- Community engagement

Báo cáo này cung cấp cái nhìn tổng quan chi tiết về cấu trúc và chức năng của hệ thống KV Together theo từng vai trò, giúp hiểu rõ scope và complexity của dự án để phục vụ việc viết báo cáo học thuật.