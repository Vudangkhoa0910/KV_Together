'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import { 
  ChevronLeftIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShareIcon,
  EyeIcon,
  ChartBarIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  PencilIcon,
  ComputerDesktopIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/format';

// Dynamic imports for chart components
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Campaign type for the analytics page
interface CampaignData {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: string;
  current_amount: number;
  target_amount: number;
  start_date: string;
  end_date: string;
  progress_percentage: number;
  image_url: string;
  days_remaining: number;
}

interface DonationData {
  date: string;
  amount: number;
  count: number;
}

interface DonorData {
  gender: string;
  count: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

interface ReferrerData {
  source: string;
  count: number;
  percentage: number;
}

interface LocationData {
  city: string;
  count: number;
  percentage: number;
}

// Helper to format number values in a readable way
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export default function CampaignAnalytics() {
  const params = useParams() as { slug: string };
  const router = useRouter();
  const { slug } = params;
  
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [donationData, setDonationData] = useState<DonationData[]>([]);
  const [donationStats, setDonationStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    averageDonation: 0,
    conversionRate: 0,
    visitCount: 0
  });
  const [donorStats, setDonorStats] = useState({
    totalDonors: 0,
    newDonors: 0,
    returningDonors: 0,
    donorGrowthRate: 0
  });
  const [donorDemographics, setDonorDemographics] = useState<DonorData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [referrerData, setReferrerData] = useState<ReferrerData[]>([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function for chart formatters with proper type handling
  const percentageFormatter = (val: string | number, opts?: any): string => {
    // Make sure we're dealing with a number before calling toFixed
    const numVal = typeof val === 'number' ? val : parseFloat(val);
    if (!opts || !opts.w || !opts.w.globals || !opts.w.globals.labels || !opts.seriesIndex) {
      return `${numVal.toFixed(1)}%`;
    }
    return `${opts.w.globals.labels[opts.seriesIndex]}: ${numVal.toFixed(1)}%`;
  };
  
  useEffect(() => {
    if (!slug) return;
    fetchCampaignAnalytics();
  }, [slug, dateRange]);

  const fetchCampaignAnalytics = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      
      try {
        const analyticsData = await api.getCampaignAnalytics(slug, dateRange);
        
        // Map API campaign data to our interface
        const campaignData: CampaignData = {
          id: analyticsData.campaign.id,
          title: analyticsData.campaign.title,
          slug: analyticsData.campaign.slug,
          description: analyticsData.campaign.description,
          status: analyticsData.campaign.status,
          current_amount: analyticsData.campaign.current_amount,
          target_amount: analyticsData.campaign.target_amount,
          start_date: analyticsData.campaign.start_date,
          end_date: analyticsData.campaign.end_date,
          progress_percentage: analyticsData.campaign.progress_percentage,
          image_url: analyticsData.campaign.image_url || '',
          days_remaining: analyticsData.campaign.days_remaining
        };
        
        // Set data from the API response
        setCampaign(campaignData);
        setDonationData(analyticsData.donationData);
        setDonationStats(analyticsData.donationStats);
        setDonorStats(analyticsData.donorStats);
        setDonorDemographics(analyticsData.donorDemographics);
        setDeviceData(analyticsData.deviceData);
        setReferrerData(analyticsData.referrerData);
        setLocationData(analyticsData.locationData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.');
        
        // Fallback to mock data in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data for development');
          useMockData();
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  const useMockData = () => {
    // Mock campaign data
    const mockCampaign: CampaignData = {
      id: 1,
      title: 'Hỗ trợ trẻ em vùng cao',
      slug: 'ho-tro-tre-em-vung-cao',
      description: 'Chương trình hỗ trợ trẻ em vùng cao với các nhu yếu phẩm và đồ dùng học tập',
      status: 'active',
      current_amount: 452000000,
      target_amount: 500000000,
      start_date: '2025-04-15',
      end_date: '2025-08-15',
      progress_percentage: 90.4,
      image_url: '/images/campaigns/education.jpg',
      days_remaining: 59
    };
    
    setCampaign(mockCampaign);
    
    // Generate donation data for the chart
    const days = parseInt(dateRange);
    const generatedDonationData: DonationData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const amount = Math.floor(Math.random() * 10000000) + 1000000; // Random amount between 1M and 11M
      const count = Math.floor(Math.random() * 20) + 1; // Random count between 1 and 21
      
      generatedDonationData.push({
        date,
        amount,
        count
      });
    }
    
    setDonationData(generatedDonationData);
    
    // Set donation stats
    setDonationStats({
      totalDonations: 124,
      totalAmount: 452000000,
      averageDonation: 3645161, // 452M / 124
      conversionRate: 12.4,
      visitCount: 1000
    });
    
    // Set donor stats
    setDonorStats({
      totalDonors: 98,
      newDonors: 72,
      returningDonors: 26,
      donorGrowthRate: 15.2
    });
    
    // Set donor demographics
    setDonorDemographics([
      { gender: 'Nam', count: 45, percentage: 45.9 },
      { gender: 'Nữ', count: 53, percentage: 54.1 }
    ]);
    
    // Set device data
    setDeviceData([
      { device: 'Điện thoại', count: 76, percentage: 77.6 },
      { device: 'Máy tính', count: 18, percentage: 18.4 },
      { device: 'Tablet', count: 4, percentage: 4.0 }
    ]);
    
    // Set referrer data
    setReferrerData([
      { source: 'Facebook', count: 42, percentage: 42.9 },
      { source: 'Trực tiếp', count: 23, percentage: 23.5 },
      { source: 'Google', count: 18, percentage: 18.4 },
      { source: 'Email', count: 10, percentage: 10.2 },
      { source: 'Khác', count: 5, percentage: 5.0 }
    ]);
    
    // Set location data
    setLocationData([
      { city: 'Hà Nội', count: 35, percentage: 35.7 },
      { city: 'TP.HCM', count: 28, percentage: 28.6 },
      { city: 'Đà Nẵng', count: 12, percentage: 12.2 },
      { city: 'Hải Phòng', count: 8, percentage: 8.2 },
      { city: 'Cần Thơ', count: 6, percentage: 6.1 },
      { city: 'Khác', count: 9, percentage: 9.2 }
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <Link href={`/fundraiser/campaigns/${slug}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Quay lại chiến dịch
            </Link>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="h-72 bg-gray-200 rounded"></div>
              <div className="h-72 bg-gray-200 rounded"></div>
            </div>
            <div className="h-80 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <Link href="/fundraiser/campaigns" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Quay lại danh sách
            </Link>
          </div>
          
          {error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Không tìm thấy chiến dịch</h2>
              <p className="text-gray-500 mb-6">Chiến dịch này không tồn tại hoặc đã bị xóa</p>
              <Link href="/fundraiser/campaigns" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                Quay lại danh sách chiến dịch
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <Link href={`/fundraiser/campaigns/${slug}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Quay lại chiến dịch
          </Link>
        </div>
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Phân tích chiến dịch</h1>
              <p className="text-gray-500 mt-1">{campaign.title}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <select
                className="w-full md:w-auto rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7">7 ngày qua</option>
                <option value="30">30 ngày qua</option>
                <option value="90">90 ngày qua</option>
                <option value="365">365 ngày qua</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng số tiền quyên góp</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(donationStats.totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{campaign.progress_percentage}% mục tiêu</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Nhà hảo tâm</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(donorStats.totalDonors)}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs font-medium text-green-600">
                    {donorStats.donorGrowthRate}% tăng trưởng
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <ShareIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tỷ lệ chuyển đổi</p>
                <p className="text-2xl font-semibold text-gray-900">{donationStats.conversionRate}%</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-medium text-purple-600">
                    {formatNumber(donationStats.visitCount)} lượt truy cập
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <ClockIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Trung bình</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(donationStats.averageDonation)}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-medium text-orange-600">
                    {formatNumber(donationStats.totalDonations)} lượt quyên góp
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Donation Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Số tiền quyên góp theo thời gian</h3>
            {typeof window !== 'undefined' && donationData.length > 0 && (
              <Chart 
                type="area"
                height={300}
                options={{
                  chart: {
                    toolbar: {
                      show: false
                    },
                    zoom: {
                      enabled: false
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  stroke: {
                    curve: 'smooth',
                    width: 2
                  },
                  fill: {
                    type: 'gradient',
                    gradient: {
                      shadeIntensity: 1,
                      opacityFrom: 0.7,
                      opacityTo: 0.3,
                      stops: [0, 100]
                    }
                  },
                  xaxis: {
                    categories: donationData.map(d => format(new Date(d.date), 'dd/MM')),
                    labels: {
                      style: {
                        colors: '#777',
                        fontSize: '12px'
                      }
                    }
                  },
                  yaxis: {
                    labels: {
                      formatter: (value) => formatCurrency(value),
                      style: {
                        colors: '#777',
                        fontSize: '12px'
                      }
                    }
                  },
                  tooltip: {
                    y: {
                      formatter: (value) => formatCurrency(value)
                    }
                  },
                  colors: ['#f97316']
                }}
                series={[
                  {
                    name: 'Số tiền quyên góp',
                    data: donationData.map(d => d.amount)
                  }
                ]}
              />
            )}
          </div>
          
          {/* Donation Count Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Số lượt quyên góp theo thời gian</h3>
            {typeof window !== 'undefined' && donationData.length > 0 && (
              <Chart 
                type="bar"
                height={300}
                options={{
                  chart: {
                    toolbar: {
                      show: false
                    },
                    zoom: {
                      enabled: false
                    }
                  },
                  plotOptions: {
                    bar: {
                      borderRadius: 4,
                      dataLabels: {
                        position: 'top'
                      }
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  xaxis: {
                    categories: donationData.map(d => format(new Date(d.date), 'dd/MM')),
                    labels: {
                      style: {
                        colors: '#777',
                        fontSize: '12px'
                      }
                    }
                  },
                  yaxis: {
                    labels: {
                      style: {
                        colors: '#777',
                        fontSize: '12px'
                      }
                    }
                  },
                  colors: ['#3b82f6']
                }}
                series={[
                  {
                    name: 'Số lượt quyên góp',
                    data: donationData.map(d => d.count)
                  }
                ]}
              />
            )}
          </div>
        </div>
        
        {/* Donor Demographics & Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Donor Demographics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Thông tin nhà hảo tâm</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* New vs Returning */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Loại nhà hảo tâm</h4>
                {typeof window !== 'undefined' && (
                  <Chart 
                    type="donut"
                    height={220}
                    options={{
                      labels: ['Mới', 'Quay lại'],
                      colors: ['#3b82f6', '#8b5cf6'],
                      legend: {
                        position: 'bottom'
                      },
                      dataLabels: {
                        formatter: percentageFormatter
                      },
                      tooltip: {
                        y: {
                          formatter: (val, { dataPointIndex, w }) => {
                            const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                            const count = dataPointIndex === 0 ? donorStats.newDonors : donorStats.returningDonors;
                            return count + ' người (' + (100 * count / total).toFixed(1) + '%)';
                          }
                        }
                      }
                    }}
                    series={[donorStats.newDonors, donorStats.returningDonors]}
                  />
                )}
              </div>
              
              {/* Gender Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Phân bố giới tính</h4>
                {typeof window !== 'undefined' && donorDemographics.length > 0 && (
                  <Chart 
                    type="pie"
                    height={220}
                    options={{
                      labels: donorDemographics.map(d => d.gender),
                      colors: ['#2563eb', '#ec4899'],
                      legend: {
                        position: 'bottom'
                      },
                      dataLabels: {
                        formatter: percentageFormatter
                      },
                      tooltip: {
                        y: {
                          formatter: (val, { dataPointIndex, w }) => {
                            return donorDemographics[dataPointIndex].count + ' người (' + donorDemographics[dataPointIndex].percentage + '%)';
                          }
                        }
                      }
                    }}
                    series={donorDemographics.map(d => d.count)}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Donation Sources */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Nguồn quyên góp</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Referrer Sources */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Nguồn truy cập</h4>
                {typeof window !== 'undefined' && referrerData.length > 0 && (
                  <Chart 
                    type="pie"
                    height={220}
                    options={{
                      labels: referrerData.map(d => d.source),
                      legend: {
                        position: 'bottom',
                        fontSize: '14px'
                      },
                      dataLabels: {
                        formatter: percentageFormatter
                      },
                      tooltip: {
                        y: {
                          formatter: (val, { dataPointIndex, w }) => {
                            return referrerData[dataPointIndex].count + ' người (' + referrerData[dataPointIndex].percentage + '%)';
                          }
                        }
                      },
                      colors: ['#4f46e5', '#f59e0b', '#10b981', '#f43f5e', '#6b7280']
                    }}
                    series={referrerData.map(d => d.count)}
                  />
                )}
              </div>
              
              {/* Device Data */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Thiết bị</h4>
                {typeof window !== 'undefined' && deviceData.length > 0 && (
                  <div className="mt-6">
                    <div className="space-y-5">
                      <div className="flex items-center">
                        <DevicePhoneMobileIcon className="h-6 w-6 text-blue-500 mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Điện thoại</span>
                            <span className="text-sm font-medium text-gray-900">{deviceData[0].percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${deviceData[0].percentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ComputerDesktopIcon className="h-6 w-6 text-green-500 mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Máy tính</span>
                            <span className="text-sm font-medium text-gray-900">{deviceData[1].percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${deviceData[1].percentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DeviceTabletIcon className="h-6 w-6 text-purple-500 mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Tablet</span>
                            <span className="text-sm font-medium text-gray-900">{deviceData[2].percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${deviceData[2].percentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Location Data */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">Vị trí địa lý</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Top thành phố</h4>
              <div className="space-y-4">
                {locationData.map((location, index) => (
                  <div key={index} className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{location.city}</span>
                        <span className="text-sm font-medium text-gray-900">{location.count} ({location.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${location.percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              {typeof window !== 'undefined' && locationData.length > 0 && (
                <Chart 
                  type="bar"
                  height={300}
                  options={{
                    chart: {
                      toolbar: {
                        show: false
                      }
                    },
                    plotOptions: {
                      bar: {
                        horizontal: true,
                        borderRadius: 4,
                        distributed: true
                      }
                    },
                    dataLabels: {
                      enabled: false
                    },
                    xaxis: {
                      categories: locationData.map(d => d.city)
                    },
                    colors: ['#f97316', '#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#6b7280']
                  }}
                  series={[{
                    name: 'Nhà hảo tâm',
                    data: locationData.map(d => d.count)
                  }]}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">Thao tác</h3>
          <div className="flex flex-wrap gap-3">
            <Link href={`/fundraiser/campaigns/${campaign.slug}/edit`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              <PencilIcon className="h-4 w-4 mr-2" />
              Chỉnh sửa chiến dịch
            </Link>
            <Link href={`/fundraiser/campaigns/${campaign.slug}/updates`} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              <ChartBarIcon className="h-4 w-4 mr-2 text-gray-400" />
              Quản lý cập nhật
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
