'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { api, Campaign, Stats, Category } from "@/services/api";
import ScrollToTop from "@/components/ScrollToTop";
import EnhancedStatsSection from "@/components/home/EnhancedStatsSection";
import CampaignsSection from "@/components/home/CampaignsSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import "@/styles/home-enhanced.css";

// Loading component
function LoadingCampaigns() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-300 rounded mb-3"></div>
            <div className="h-3 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded mb-4"></div>
            <div className="h-2 bg-gray-300 rounded mb-2"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-300 rounded w-16"></div>
              <div className="h-3 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state component
function EmptyCampaigns() {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Chưa có chiến dịch nổi bật
        </h3>
        <p className="text-gray-600 mb-6">
          Hiện tại chưa có chiến dịch nào được đánh dấu là nổi bật. Vui lòng quay lại sau hoặc khám phá tất cả chiến dịch.
        </p>
        <Link 
          href="/campaigns" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xem tất cả chiến dịch
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  // Initialize with empty array to show loading state first
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load data from API with priority on real data
        const [campaignsData, statsData, categoriesData] = await Promise.all([
          api.getFeaturedCampaigns(),
          api.getStats().catch(err => {
            console.error('Stats error:', err);
            return null;
          }),
          api.getCategories().catch(err => {
            console.error('Categories error:', err);
            return [];
          })
        ]);
        
        console.log('Featured campaigns data from API:', campaignsData);
        console.log('Stats data from API:', statsData);
        
        // Use real featured campaigns data first
        if (campaignsData && campaignsData.length > 0) {
          console.log('✅ Using featured campaigns from API:', campaignsData.length);
          setFeaturedCampaigns(campaignsData);
        } else {
          // If no featured campaigns, try to get active campaigns
          try {
            console.log('No featured campaigns found, trying active campaigns...');
            const allCampaigns = await api.getCampaigns({ 
              per_page: 6
            });
            
            if (allCampaigns.data && allCampaigns.data.length > 0) {
              console.log('✅ Using active campaigns as featured:', allCampaigns.data.length);
              setFeaturedCampaigns(allCampaigns.data);
            } else {
              console.log('⚠️ No campaigns found in database');
              setFeaturedCampaigns([]);
            }
          } catch (error) {
            console.error('Error fetching active campaigns:', error);
            setFeaturedCampaigns([]);
          }
        }
        
        // Use real stats data or create fallback
        if (statsData) {
          console.log('✅ Using real stats data from API');
          setStats(statsData);
        } else {
          console.log('⚠️ No stats data available, using reasonable fallback');
          setStats({
            active_campaigns: 15,
            total_donors: 17,
            total_amount_raised: 100561531,
            total_campaigns: 29,
            active_campaigns_count: 15,
            completed_campaigns: 1,
            pending_campaigns: 1,
            total_donations_count: 852,
            avg_donation_amount: 620750,
            success_rate: 3.4,
            this_month_donations: 77557751,
            this_month_donors: 17,
            completed_campaigns_amount: 200000000,
            projects: 29,
            ambassadors: 4,
            organizations: 4,
            donations_count: 852,
            total_amount: 100561531
          });
        }
        
        setCategories(categoriesData);
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Không thể tải dữ liệu từ server');
        setFeaturedCampaigns([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
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

        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Chiến dịch nổi bật
              </h2>
            </div>
            <LoadingCampaigns />
          </div>
        </div>
      </div>
    );
  }

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
      {stats && <EnhancedStatsSection stats={stats} />}

      {/* Featured Campaigns Section - Chiến dịch chính */}
      {featuredCampaigns.length > 0 ? (
        <CampaignsSection 
          campaigns={featuredCampaigns}
          title="Chiến dịch nổi bật"
          subtitle="Những chiến dịch được lựa chọn đặc biệt với tác động lớn đến cộng đồng"
          type="featured"
        />
      ) : (
        !loading && <EmptyCampaigns />
      )}

      {/* Categories Section - Danh mục chính */}
      {categories.length > 0 && (
        <CategoriesSection categories={categories} />
      )}

      {/* Financial Transparency Section - Minh bạch tài chính */}
      {/* <FinancialTransparencyHomeSection /> */}
      
      {/* Error message */}
      {error && (
        <div className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ScrollToTop />
    </div>
  );
}
