import Image from "next/image";
import Link from "next/link";
import { api, Campaign, Stats, Category } from "@/services/api";
import ScrollToTop from "@/components/ScrollToTop";
import EnhancedStatsSection from "@/components/home/EnhancedStatsSection";
import CampaignsSection from "@/components/home/CampaignsSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import "@/styles/home-enhanced.css";

async function getFeaturedCampaigns(): Promise<Campaign[]> {
  try {
    return await api.getFeaturedCampaigns();
  } catch (error) {
    console.error('Error fetching featured campaigns:', error);
    // Return placeholder data
    return [
      {
        id: 1,
        title: "Xây dựng trường học cho trẻ em vùng cao Sapa",
        slug: "xay-dung-truong-hoc-sapa",
        description: "Hỗ trợ xây dựng trường học cho 200 em nhỏ tại vùng cao Sapa, Lào Cai",
        content: "Dự án này nhằm xây dựng một ngôi trường học hiện đại với đầy đủ trang thiết bị học tập cho các em nhỏ tại vùng cao Sapa. Trường sẽ có 6 phòng học, 1 thư viện và sân chơi an toàn.",
        target_amount: 500000000,
        current_amount: 385000000,
        start_date: "2024-01-15T00:00:00Z",
        end_date: "2024-12-31T00:00:00Z",
        image: "/images/bg_2.jpg",
        images: ["/images/bg_2.jpg", "/images/bg_3.jpg"],
        image_url: "/images/bg_2.jpg",
        images_url: ["/images/bg_2.jpg", "/images/bg_3.jpg"],
        status: "active" as const,
        is_featured: true,
        organizer: {
          id: 1,
          name: "Quỹ từ thiện Ánh Sáng",
          email: "anhsang@charity.org",
          avatar_url: "/images/bg.jpeg",
          bio: "Tổ chức từ thiện hoạt động 10 năm trong lĩnh vực giáo dục",
          fundraiser_type: "organization"
        },
        categories: [
          { id: 1, name: "Giáo dục", slug: "giao-duc", description: "Các dự án về giáo dục", icon: "📚" },
          { id: 2, name: "Trẻ em", slug: "tre-em", description: "Hỗ trợ trẻ em", icon: "👶" }
        ],
        progress_percentage: 77,
        days_remaining: 45,
        created_at: "2024-01-15T00:00:00Z",
        updated_at: "2024-06-10T00:00:00Z",
        donations_count: 324
      },
      {
        id: 2,
        title: "Phẫu thuật tim cho em bé Minh An",
        slug: "phau-thuat-tim-minh-an",
        description: "Cứu em bé 3 tuổi mắc bệnh tim bẩm sinh cần phẫu thuật khẩn cấp",
        content: "Em Minh An, 3 tuổi, mắc bệnh tim bẩm sinh nghiêm trọng cần phẫu thuật ngay. Gia đình em thuộc diện khó khăn, không đủ khả năng chi trả chi phí điều trị lên đến 120 triệu đồng.",
        target_amount: 120000000,
        current_amount: 95000000,
        start_date: "2024-05-01T00:00:00Z",
        end_date: "2024-07-31T00:00:00Z",
        image: "/images/bg_3.jpg",
        images: ["/images/bg_3.jpg"],
        image_url: "/images/bg_3.jpg",
        images_url: ["/images/bg_3.jpg"],
        status: "active" as const,
        is_featured: true,
        organizer: {
          id: 2,
          name: "Bệnh viện Nhi Trung ương",
          email: "contact@bvnhi.org",
          avatar_url: "/images/bg_2.jpg",
          bio: "Bệnh viện chuyên khoa nhi hàng đầu Việt Nam",
          fundraiser_type: "organization"
        },
        categories: [
          { id: 3, name: "Y tế", slug: "y-te", description: "Các dự án y tế", icon: "🏥" },
          { id: 2, name: "Trẻ em", slug: "tre-em", description: "Hỗ trợ trẻ em", icon: "👶" }
        ],
        progress_percentage: 79,
        days_remaining: 15,
        created_at: "2024-05-01T00:00:00Z",
        updated_at: "2024-06-12T00:00:00Z",
        donations_count: 567,
        urgency_level: "critical" as const,
        time_left: 15
      },
      {
        id: 3,
        title: "Hỗ trợ người cao tuổi neo đơn",
        slug: "ho-tro-nguoi-cao-tuoi",
        description: "Chương trình chăm sóc và hỗ trợ người cao tuổi cô đơn tại TP.HCM",
        content: "Dự án nhằm hỗ trợ 100 người cao tuổi neo đơn tại TP.HCM với các gói chăm sóc sức khỏe, dinh dưỡng và tinh thần. Mỗi tháng sẽ có các hoạt động thăm hỏi, khám sức khỏe định kỳ.",
        target_amount: 300000000,
        current_amount: 245000000,
        start_date: "2024-03-01T00:00:00Z",
        end_date: "2024-12-31T00:00:00Z",
        image: "/images/bg.jpeg",
        images: ["/images/bg.jpeg"],
        image_url: "/images/bg.jpeg",
        images_url: ["/images/bg.jpeg"],
        status: "active" as const,
        is_featured: true,
        organizer: {
          id: 3,
          name: "Hội Chữ thập đỏ TP.HCM",
          email: "hcm@redcross.org.vn",
          avatar_url: "/images/bg_3.jpg",
          bio: "Tổ chức nhân đạo uy tín với 50 năm hoạt động",
          fundraiser_type: "organization"
        },
        categories: [
          { id: 4, name: "Người già", slug: "nguoi-gia", description: "Hỗ trợ người cao tuổi", icon: "👴" },
          { id: 5, name: "Cộng đồng", slug: "cong-dong", description: "Phát triển cộng đồng", icon: "🤝" }
        ],
        progress_percentage: 82,
        days_remaining: 89,
        created_at: "2024-03-01T00:00:00Z",
        updated_at: "2024-06-13T00:00:00Z",
        donations_count: 456
      }
    ];
  }
}

async function getStats(): Promise<Stats> {
  try {
    return await api.getStats();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      active_campaigns: 45,
      total_donors: 12500,
      total_amount_raised: 8750000000, // 8.75 tỷ
      total_campaigns: 67,
      active_campaigns_count: 45,
      completed_campaigns: 18,
      pending_campaigns: 4,
      total_donations_count: 12500,
      avg_donation_amount: 700000, // 700k trung bình
      success_rate: 92,
      this_month_donations: 450000000, // 450 triệu tháng này
      this_month_donors: 890,
      projects: 45,
      ambassadors: 156,
      organizations: 23,
      donations_count: 12500,
      total_amount: 8750000000,
    };
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    return await api.getCategories();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function Home() {
  const [
    campaigns, 
    stats, 
    categories
  ] = await Promise.all([
    getFeaturedCampaigns(),
    getStats(),
    getCategories()
  ]);

  return (
    <div className="home">
      {/* Hero Section - Giữ phần này với 3 ảnh đẹp */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Cùng nhau <span className="highlight">Gây quỹ</span>
            <br />
            Lan tỏa <span className="highlight">Yêu thương</span>
          </h1>
          <p>Tham gia và ủng hộ các chiến dịch ý nghĩa, giúp đỡ cộng đồng và tạo nên sự thay đổi tích cực.</p>
          <div className="hero-buttons">
            <Link href="/campaigns" className="btn-primary">Khám phá chiến dịch</Link>
            <Link href="/auth/register" className="btn-secondary">Trở thành sứ giả</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-wrapper">
            <Image 
              src="/images/bg.jpeg" 
              alt="Together we make a difference"
              width={800}
              height={600}
              priority
              className="main-image"
            />
          </div>
          <div className="hero-image-wrapper">
            <Image 
              src="/images/bg_2.jpg" 
              alt="Community support"
              width={800}
              height={450}
              priority
            />
          </div>
          <div className="hero-image-wrapper">
            <Image 
              src="/images/bg_3.jpg" 
              alt="Making impact"
              width={800}
              height={450}
              priority
            />
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section - Thống kê quan trọng */}
      <EnhancedStatsSection stats={stats} />

      {/* Featured Campaigns Section - Chiến dịch chính */}
      {campaigns.length > 0 && (
        <CampaignsSection 
          campaigns={campaigns}
          title="Chiến dịch nổi bật"
          subtitle="Những chiến dịch được lựa chọn đặc biệt với tác động lớn đến cộng đồng"
          type="featured"
        />
      )}

      {/* Categories Section - Danh mục chính */}
      {categories.length > 0 && (
        <CategoriesSection categories={categories} />
      )}
      
      <ScrollToTop />
    </div>
  );
}