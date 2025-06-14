import Image from "next/image";
import { api, Campaign, Stats } from "@/services/api";
import ScrollToTop from "@/components/ScrollToTop";

async function getFeaturedCampaigns(): Promise<Campaign[]> {
  try {
    return await api.getFeaturedCampaigns();
  } catch (error) {
    console.error('Error fetching featured campaigns:', error);
    // Return placeholder data
    return [
      
    ];
  }
}

async function getStats(): Promise<Stats> {
  try {
    return await api.getStats();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      projects: 12,
      ambassadors: 50,
      organizations: 8,
      donations_count: 1500,
      total_amount: 500000000,
    };
  }
}

export default async function Home() {
  const [campaigns, stats] = await Promise.all([
    getFeaturedCampaigns(),
    getStats(),
  ]);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>
            Cùng nhau <span className="highlight">Gây quỹ</span>
            <br />
            Lan tỏa <span className="highlight">Yêu thương</span>
          </h1>
          <p>Tham gia và ủng hộ các chiến dịch ý nghĩa, giúp đỡ cộng đồng và tạo nên sự thay đổi tích cực.</p>
          <div className="hero-buttons">
            <a href="/campaigns" className="btn-primary">Khám phá chiến dịch</a>
            <a href="/register" className="btn-secondary">Trở thành sứ giả</a>
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

      <section className="featured-campaigns">
        <h2>Các chiến dịch nổi bật</h2>
        <div className="campaign-grid">
          {campaigns.map((campaign: Campaign) => (
            <div key={campaign.id} className="campaign-card">
              <Image 
                src={campaign.image_url || "/images/bg.jpeg"}
                alt={campaign.title}
                width={400}
                height={300}
              />
              <div className="campaign-content">
                <h3>{campaign.title}</h3>
                <p>{campaign.description}</p>
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{
                      width: `${Math.min((campaign.current_amount / campaign.target_amount) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                <div className="campaign-stats">
                  <span>
                    Đã đạt: {Math.round((campaign.current_amount / campaign.target_amount) * 100)}% 
                    ({campaign.current_amount.toLocaleString()} VND / {campaign.target_amount.toLocaleString()} VND)
                  </span>
                </div>
                <a href={`/ung-ho/${campaign.id}`} className="support-button">Ủng hộ ngay</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <h3>{stats.projects}</h3>
            <p>Dự án</p>
          </div>
          <div className="stat-item">
            <h3>{stats.ambassadors}</h3>
            <p>Sứ giả</p>
          </div>
          <div className="stat-item">
            <h3>{stats.organizations}</h3>
            <p>Tổ chức</p>
          </div>
          <div className="stat-item">
            <h3>{stats.donations_count.toLocaleString()}</h3>
            <p>Lượt ủng hộ</p>
          </div>
          <div className="stat-item">
            <h3>{(stats.total_amount / 1000000000).toFixed(2)} tỷ</h3>
            <p>Tiền ủng hộ</p>
          </div>
        </div>
      </section>
      
      <ScrollToTop />    </div>
  );
}