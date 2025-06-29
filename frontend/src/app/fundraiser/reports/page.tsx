'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ArrowDownTrayIcon as DownloadIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  FunnelIcon as FilterIcon,
  ArrowPathIcon as RefreshIcon,
  PrinterIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { format, subDays, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';

// Dynamic imports for chart components
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DonationData {
  id: number;
  donor_name: string;
  donor_email: string;
  amount: number;
  campaign_title: string;
  status: 'completed' | 'pending' | 'failed';
  payment_method: string;
  created_at: string;
}

interface ReportTotals {
  totalRaised: number;
  totalDonations: number;
  averageDonation: number;
  totalDonors: number;
  successRate: number;
}

interface MonthlySummary {
  month: string;
  amount: number;
  count: number;
}

export default function FundraiserReportsPage() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState('month');
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState<ReportTotals>({
    totalRaised: 0,
    totalDonations: 0,
    averageDonation: 0,
    totalDonors: 0,
    successRate: 0
  });
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [reportType, dateRange, campaignFilter, statusFilter, user]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Fetch report data from API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fundraiser/reports`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const data = await response.json();
      
      if (data) {
        // Map backend data to frontend format
        setTotals({
          totalRaised: data.summary?.total_raised || 0,
          totalDonations: data.summary?.total_campaigns || 0,
          averageDonation: data.summary?.total_raised / Math.max(data.summary?.total_donors || 1, 1),
          totalDonors: data.summary?.total_donors || 0,
          successRate: 100
        });
        
        // Map monthly report
        if (data.monthly_report) {
          setMonthlySummary(data.monthly_report.map((item: any) => ({
            month: item.month,
            amount: item.total_raised || 0,
            count: item.total_donors || 0
          })));
        }
        
        // Set empty donations for now
        setDonations([]);
        setIsLoading(false);
        return;
      }
      
      // Fallback to mock data if API fails
      // Generate start date based on selected range
      const today = new Date();
      let startDate;
      
      switch(dateRange) {
        case 'week':
          startDate = subDays(today, 7);
          break;
        case 'month':
          startDate = subMonths(today, 1);
          break;
        case 'quarter':
          startDate = subMonths(today, 3);
          break;
        case 'year':
          startDate = subMonths(today, 12);
          break;
        default:
          startDate = subMonths(today, 1);
      }
      
      // Generate mock donations as fallback
      const mockDonations = generateMockDonations(startDate, today);
      setDonations(mockDonations);
      
      // Calculate report totals
      const filteredDonations = applyFilters(mockDonations);
      calculateTotals(filteredDonations);
      
      // Generate monthly summary for charts
      generateMonthlySummary(filteredDonations);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (donations: DonationData[]) => {
    return donations.filter(donation => {
      let keepItem = true;
      
      if (campaignFilter !== 'all') {
        keepItem = keepItem && donation.campaign_title === campaignFilter;
      }
      
      if (statusFilter !== 'all') {
        keepItem = keepItem && donation.status === statusFilter;
      }
      
      return keepItem;
    });
  };

  const calculateTotals = (donations: DonationData[]) => {
    const completed = donations.filter(d => d.status === 'completed');
    const totalRaised = completed.reduce((sum, donation) => sum + donation.amount, 0);
    const uniqueDonors = new Set(donations.map(d => d.donor_email)).size;
    const successRate = donations.length ? (completed.length / donations.length) * 100 : 0;
    
    setTotals({
      totalRaised,
      totalDonations: donations.length,
      averageDonation: completed.length > 0 ? Math.round(totalRaised / completed.length) : 0,
      totalDonors: uniqueDonors,
      successRate
    });
  };

  const generateMonthlySummary = (donations: DonationData[]) => {
    // Group by month and calculate totals
    const monthlyData: Record<string, { amount: number, count: number, monthLabel: string }> = {};
    
    donations.forEach(donation => {
      if (donation.status !== 'completed') return;
      
      const donationDate = new Date(donation.created_at);
      const monthKey = format(donationDate, 'yyyy-MM');
      const monthLabel = format(donationDate, 'MM/yyyy');
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { amount: 0, count: 0, monthLabel: monthLabel };
      }
      
      monthlyData[monthKey].amount += donation.amount;
      monthlyData[monthKey].count += 1;
    });
    
    // Convert to array and sort by date
    const summary = Object.keys(monthlyData).map(key => ({
      month: monthlyData[key].monthLabel || key,
      amount: monthlyData[key].amount,
      count: monthlyData[key].count
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    setMonthlySummary(summary);
  };

  const generateMockDonations = (startDate: Date, endDate: Date) => {
    const campaigns = [
      'Hỗ trợ trẻ em vùng cao',
      'Xây dựng thư viện số cho trường làng',
      'Cứu trợ đồng bào bị lũ lụt miền Trung',
      'Học bổng cho học sinh nghèo vượt khó'
    ];
    
    const paymentMethods = ['VNPay', 'Momo', 'Bank Transfer', 'ZaloPay', 'Credit Card'];
    const statuses = ['completed', 'completed', 'completed', 'pending', 'failed'] as const;
    
    // Generate random number of donations between 50 and 100
    const count = Math.floor(Math.random() * 50) + 50;
    const donations: DonationData[] = [];
    
    for (let i = 0; i < count; i++) {
      const donationDate = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      );
      
      donations.push({
        id: i + 1,
        donor_name: `Nhà hảo tâm ${i + 1}`,
        donor_email: `donor${i + 1}@example.com`,
        amount: Math.floor(Math.random() * 9000000) + 100000, // 100k - 9M VND
        campaign_title: campaigns[Math.floor(Math.random() * campaigns.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        created_at: donationDate.toISOString()
      });
    }
    
    return donations;
  };

  const formatCurrency = (amount: number) => {
    // Handle NaN, Infinity, and null/undefined values
    const safeAmount = isNaN(amount) || !isFinite(amount) || amount == null ? 0 : amount;
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(safeAmount);
  };

  const getChartOptions = (title: string) => {
    return {
      chart: {
        type: 'bar' as const,
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
        }
      },
      dataLabels: {
        enabled: false
      },
      title: {
        text: title,
        align: 'left' as const,
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      xaxis: {
        categories: monthlySummary.map(item => item.month),
      },
      tooltip: {
        y: {
          formatter: (val: number) => formatCurrency(val)
        }
      },
      colors: ['#10B981']
    };
  };

  const downloadReport = () => {
    alert('Tải xuống báo cáo tính năng sẽ được triển khai sau!');
  };

  const printReport = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto print:py-2 print:px-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Báo cáo và phân tích</h1>
          <p className="text-gray-600">Tổng hợp dữ liệu và báo cáo cho các hoạt động gây quỹ</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            <DownloadIcon className="h-5 w-5" />
            <span>Tải xuống</span>
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <PrinterIcon className="h-5 w-5" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex overflow-x-auto mb-6 print:hidden">
        <button
          onClick={() => setReportType('financial')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap ${
            reportType === 'financial'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <CurrencyDollarIcon className="inline-block h-5 w-5 mr-2" />
          Báo cáo tài chính
        </button>
        <button
          onClick={() => setReportType('campaign')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap ${
            reportType === 'campaign'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <ChartBarIcon className="inline-block h-5 w-5 mr-2" />
          Hiệu suất chiến dịch
        </button>
        <button
          onClick={() => setReportType('donor')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap ${
            reportType === 'donor'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <UserGroupIcon className="inline-block h-5 w-5 mr-2" />
          Phân tích nhà hảo tâm
        </button>
      </div>

      {/* Report Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 print:hidden">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
              >
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="quarter">3 tháng qua</option>
                <option value="year">Năm hiện tại</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chiến dịch</label>
            <div className="relative">
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
              >
                <option value="all">Tất cả chiến dịch</option>
                <option value="Hỗ trợ trẻ em vùng cao">Hỗ trợ trẻ em vùng cao</option>
                <option value="Xây dựng thư viện số cho trường làng">Xây dựng thư viện số cho trường làng</option>
                <option value="Cứu trợ đồng bào bị lũ lụt miền Trung">Cứu trợ đồng bào bị lũ lụt</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="pending">Đang xử lý</option>
                <option value="failed">Thất bại</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div className="ml-auto">
            <button
              onClick={fetchReportData}
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <RefreshIcon className="h-5 w-5" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Header with printable title */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          {reportType === 'financial' 
            ? 'Báo cáo tài chính' 
            : reportType === 'campaign' 
            ? 'Báo cáo hiệu suất chiến dịch' 
            : 'Báo cáo phân tích nhà hảo tâm'}
        </h1>
        <p className="text-center text-gray-600">
          Thời gian: {dateRange === 'week' ? '7 ngày qua' : dateRange === 'month' ? '30 ngày qua' : dateRange === 'quarter' ? '3 tháng qua' : 'Năm hiện tại'}
        </p>
        <p className="text-center text-gray-600">
          Ngày tạo: {format(new Date(), 'dd/MM/yyyy', { locale: vi })}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng quyên góp</p>
                <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totals.totalRaised)}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Số lượt quyên góp</p>
                <h3 className="text-2xl font-bold text-gray-800">{totals.totalDonations}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Số nhà hảo tâm</p>
                <h3 className="text-2xl font-bold text-gray-800">{totals.totalDonors}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Trung bình mỗi lượt</p>
                <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totals.averageDonation)}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Report Content */}
      {reportType === 'financial' && (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              {typeof window !== 'undefined' && (
                <Chart
                  type="bar"
                  height={350}
                  options={getChartOptions('Tổng thu theo tháng')}
                  series={[{
                    name: 'Doanh thu',
                    data: monthlySummary.map(item => item.amount)
                  }]}
                />
              )}
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              {typeof window !== 'undefined' && (
                <Chart
                  type="line"
                  height={350}
                  options={{
                    ...getChartOptions('Số lượt quyên góp theo tháng'),
                    chart: {
                      type: 'line' as const,
                      height: 350,
                      toolbar: {
                        show: false
                      }
                    },
                    colors: ['#8B5CF6']
                  }}
                  series={[{
                    name: 'Số lượt',
                    data: monthlySummary.map(item => item.count)
                  }]}
                />
              )}
            </div>
          </div>

          {/* Donations Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Chi tiết quyên góp</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhà hảo tâm
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chiến dịch
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donations.slice(0, 10).map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{donation.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{donation.donor_name}</div>
                        <div className="text-xs text-gray-500">{donation.donor_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(donation.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donation.campaign_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${donation.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {donation.status === 'completed' ? 'Hoàn thành' : 
                           donation.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(donation.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {donations.length > 10 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <Link href="/fundraiser/reports/financial" className="text-orange-500 hover:underline">
                  Xem tất cả {donations.length} khoản quyên góp
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Campaign Performance Report Content */}
      {reportType === 'campaign' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân tích hiệu suất chiến dịch</h3>
          <p className="text-gray-500 mb-6">
            Nội dung chi tiết về báo cáo hiệu suất chiến dịch sẽ được hiển thị ở đây. Hiện đang trong quá trình phát triển.
          </p>
        </div>
      )}

      {/* Donor Analysis Report Content */}
      {reportType === 'donor' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân tích nhà hảo tâm</h3>
          <p className="text-gray-500 mb-6">
            Nội dung chi tiết về phân tích nhà hảo tâm sẽ được hiển thị ở đây. Hiện đang trong quá trình phát triển.
          </p>
        </div>
      )}
    </div>
  );
}
