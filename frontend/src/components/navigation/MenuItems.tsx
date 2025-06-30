interface MenuItem {
  label: string;
  href: string;
  requireAuth?: boolean;
  requireRole?: 'user' | 'fundraiser' | 'admin';
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface BaseMenuItem {
  title: string;
  sections: MenuSection[];
}

interface MenuItems {
  campaigns: BaseMenuItem;
  news: BaseMenuItem;
  activities: BaseMenuItem;
  about: BaseMenuItem;
}

export const MENU_ITEMS: MenuItems = {
  campaigns: {
    title: 'Chiến dịch',
    sections: [
      {
        title: 'Danh mục chiến dịch',
        items: [
          { label: 'Tất cả chiến dịch', href: '/campaigns' },
          { label: 'Giáo dục', href: '/campaigns?category=giao-duc' },
          { label: 'Y tế', href: '/campaigns?category=y-te' },
          { label: 'Môi trường', href: '/campaigns?category=moi-truong' },
          { label: 'Cộng đồng', href: '/campaigns?category=cong-dong' },
          { label: 'Thiên tai', href: '/campaigns?category=thien-tai' },
          { label: 'Trẻ em', href: '/campaigns?category=tre-em' },
          { label: 'Người già', href: '/campaigns?category=nguoi-gia' }
        ]
      },
      {
        title: 'Tình trạng',
        items: [
          { label: 'Đang hoạt động', href: '/campaigns' },
          { label: 'Đã hoàn thành', href: '/campaigns/completed' },
          { label: 'Đã kết thúc', href: '/campaigns/ended' }
        ]
      },
      {
        title: 'Dành cho fundraiser',
        items: [
          { label: 'Tạo chiến dịch', href: '/campaigns/create', requireAuth: true, requireRole: 'fundraiser' },
          { label: 'Quản lý chiến dịch', href: '/fundraiser/campaigns', requireAuth: true, requireRole: 'fundraiser' }
        ]
      },
      {
        title: 'Dành cho người dùng',
        items: [
          { label: 'Lịch sử đóng góp', href: '/user/donations', requireAuth: true }
        ]
      }
    ]
  },
  news: {
    title: 'Tin tức',
    sections: [
      {
        title: 'Chủ đề',
        items: [
          { label: 'Tất cả tin tức', href: '/news' },
          { label: 'Tin nổi bật', href: '/news?featured=true' },
          { label: 'Cộng đồng', href: '/news?category=community' },
          { label: 'Sự kiện', href: '/news?category=event' },
          { label: 'Câu chuyện', href: '/news?category=story' },
          { label: 'Thông báo', href: '/news?category=announcement' }
        ]
      }
    ]
  },
  activities: {
    title: 'Hoạt động',
    sections: [
      {
        title: 'Danh mục hoạt động',
        items: [
          { label: 'Tất cả hoạt động', href: '/activities' },
          { label: 'Sự kiện', href: '/activities?category=event' },
          { label: 'Hội thảo', href: '/activities?category=workshop' },
          { label: 'Cộng đồng', href: '/activities?category=community' },
          { label: 'Tình nguyện', href: '/activities?category=volunteer' }
        ]
      },
      {
        title: 'Trạng thái',
        items: [
          { label: 'Sắp diễn ra', href: '/activities?status=upcoming' },
          { label: 'Đang diễn ra', href: '/activities?status=ongoing' },
          { label: 'Đã kết thúc', href: '/activities?status=past' }
        ]
      },
      {
        title: 'Tham gia',
        items: [
          { label: 'Hoạt động đã đăng ký', href: '/user/activity-registrations', requireAuth: true }
        ]
      }
    ]
  },
  about: {
    title: 'Về chúng tôi',
    sections: [
      {
        title: 'Minh bạch',
        items: [
          { label: 'Báo cáo tài chính', href: '/financial-transparency' },
          { label: 'Pháp lý', href: '/about/legal' }
        ]
      }
    ]
  }
}; 