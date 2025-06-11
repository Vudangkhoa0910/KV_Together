interface MenuItem {
  label: string;
  href: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface FeaturedNewsItem extends MenuItem {
  date: string;
}

interface BaseMenuItem {
  title: string;
  sections: MenuSection[];
}

interface NewsMenuItem extends BaseMenuItem {
  featured: {
    title: string;
    items: FeaturedNewsItem[];
  };
}

interface MenuItems {
  campaigns: BaseMenuItem;
  news: NewsMenuItem;
  activities: BaseMenuItem;
  about: BaseMenuItem;
}

export const MENU_ITEMS: MenuItems = {
  campaigns: {
    title: 'Chiến dịch',
    sections: [
      {
        title: 'Danh mục',
        items: [
          { label: 'Giáo dục', href: '/campaigns/education' },
          { label: 'Y tế', href: '/campaigns/healthcare' },
          { label: 'Môi trường', href: '/campaigns/environment' },
          { label: 'Cộng đồng', href: '/campaigns/community' },
          { label: 'Thiên tai', href: '/campaigns/disaster' }
        ]
      },
      {
        title: 'Tình trạng',
        items: [
          { label: 'Khẩn cấp', href: '/campaigns/urgent' },
          { label: 'Nổi bật', href: '/campaigns/featured' },
          { label: 'Sắp hoàn thành', href: '/campaigns/nearly-complete' },
          { label: 'Đã thành công', href: '/campaigns/successful' }
        ]
      },
      {
        title: 'Hành động',
        items: [
          { label: 'Tạo chiến dịch mới', href: '/campaigns/create' },
          { label: 'Đóng góp của tôi', href: '/campaigns/my-donations' },
          { label: 'Đã lưu', href: '/campaigns/saved' }
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
          { label: 'Cập nhật chiến dịch', href: '/news/campaign-updates' },
          { label: 'Câu chuyện thành công', href: '/news/success-stories' },
          { label: 'Tin cộng đồng', href: '/news/community' },
          { label: 'Sự kiện', href: '/news/events' }
        ]
      },
      {
        title: 'Xu hướng',
        items: [
          { label: 'Tin nổi bật', href: '/news/trending' },
          { label: 'Đọc nhiều nhất', href: '/news/most-read' },
          { label: 'Tin mới nhất', href: '/news/latest' }
        ]
      }
    ],
    featured: {
      title: 'Tin tức nổi bật',
      items: [
        {
          date: '24/03/2024',
          label: 'Chiến dịch "Vì học sinh vùng cao" đạt mục tiêu',
          href: '/news/1'
        },
        {
          date: '23/03/2024',
          label: 'Khánh thành 5 cây cầu mới tại Đồng bằng sông Cửu Long',
          href: '/news/2'
        }
      ]
    }
  },
  activities: {
    title: 'Hoạt động',
    sections: [
      {
        title: 'Sự kiện',
        items: [
          { label: 'Sắp diễn ra', href: '/activities/upcoming' },
          { label: 'Đang diễn ra', href: '/activities/ongoing' },
          { label: 'Đã kết thúc', href: '/activities/past' }
        ]
      },
      {
        title: 'Tình nguyện',
        items: [
          { label: 'Cơ hội tình nguyện', href: '/activities/volunteer' },
          { label: 'Đăng ký tham gia', href: '/activities/register' },
          { label: 'Nhóm tình nguyện', href: '/activities/teams' }
        ]
      },
      {
        title: 'Thành tựu',
        items: [
          { label: 'Tác động xã hội', href: '/activities/impact' },
          { label: 'Ghi nhận', href: '/activities/recognition' },
          { label: 'Chia sẻ', href: '/activities/testimonials' }
        ]
      }
    ]
  },
  about: {
    title: 'Về chúng tôi',
    sections: [
      {
        title: 'Giới thiệu',
        items: [
          { label: 'Câu chuyện', href: '/about/story' },
          { label: 'Sứ mệnh', href: '/about/mission' },
          { label: 'Đội ngũ', href: '/about/team' },
          { label: 'Đối tác', href: '/about/partners' }
        ]
      },
      {
        title: 'Minh bạch',
        items: [
          { label: 'Báo cáo tài chính', href: '/about/reports' },
          { label: 'Báo cáo tác động', href: '/about/impact' },
          { label: 'Pháp lý', href: '/about/legal' }
        ]
      },
      {
        title: 'Liên hệ',
        items: [
          { label: 'Thông tin liên hệ', href: '/about/contact' },
          { label: 'Hỗ trợ', href: '/about/support' },
          { label: 'Cơ hội việc làm', href: '/about/careers' }
        ]
      }
    ]
  }
}; 