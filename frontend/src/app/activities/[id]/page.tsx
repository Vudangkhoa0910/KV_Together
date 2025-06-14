'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ActivityOptions from '@/components/ActivityOptions';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const [isRegistered, setIsRegistered] = useState(false);

  // Mock data for the activity
  const activity = {
    id: 1,
    title: 'Dọn dẹp bãi biển và trồng rừng ngập mặn',
    category: 'environment',
    status: 'upcoming',
    image: '/images/activities/beach-cleanup.jpg',
    location: 'Bãi biển Vũng Tàu',
    startDate: '2024-04-15',
    endDate: '2024-04-16',
    participants: 45,
    maxParticipants: 100,
    organizer: {
      name: 'CLB Môi trường Xanh',
      avatar: '/images/organizers/green-club.jpg',
      description: 'Câu lạc bộ hoạt động vì môi trường, tập trung vào các hoạt động bảo vệ biển và trồng rừng.',
      foundedYear: 2020,
      totalActivities: 24,
      totalParticipants: 1200,
    },
    description: 'Hoạt động dọn dẹp bãi biển và trồng rừng ngập mặn nhằm bảo vệ môi trường biển và hệ sinh thái.',
    content: `
# Mục tiêu
- Thu gom rác thải nhựa và rác thải khác trên bãi biển
- Trồng mới 500 cây rừng ngập mặn
- Nâng cao ý thức bảo vệ môi trường cho cộng đồng

# Thời gian và địa điểm
- Thời gian: 15-16/04/2024 (2 ngày)
- Địa điểm: Bãi biển Vũng Tàu và khu vực rừng ngập mặn lân cận
- Tập trung: 7h00 sáng tại Công viên Bãi Trước

# Lịch trình chi tiết
## Ngày 1 (15/04):
- 7:00 - 7:30: Tập trung, điểm danh
- 7:30 - 8:00: Phổ biến kế hoạch, chia nhóm
- 8:00 - 11:30: Dọn dẹp bãi biển
- 11:30 - 13:30: Nghỉ trưa
- 13:30 - 16:30: Tiếp tục dọn dẹp và phân loại rác
- 16:30 - 17:00: Tổng kết ngày 1

## Ngày 2 (16/04):
- 7:00 - 7:30: Tập trung
- 7:30 - 8:00: Di chuyển đến khu vực trồng rừng
- 8:00 - 11:30: Trồng rừng ngập mặn
- 11:30 - 13:30: Nghỉ trưa
- 13:30 - 16:00: Tiếp tục trồng rừng
- 16:00 - 17:00: Tổng kết chương trình

# Những điều cần chuẩn bị
- Mang theo nước uống cá nhân
- Mũ, khăn, kem chống nắng
- Găng tay làm việc (BTC sẽ chuẩn bị thêm)
- Quần áo gọn gàng, giày dép phù hợp
- Thuốc chống côn trùng

# Quyền lợi tham gia
- Được cung cấp dụng cụ làm việc
- Được cung cấp áo đồng phục của chương trình
- Được cung cấp giấy chứng nhận tham gia
- Được bảo hiểm trong thời gian tham gia
- Được ghi nhận giờ CTXH (đối với sinh viên)

# Liên hệ
- Điện thoại: 0123.456.789
- Email: contact@mtvxanh.org
- Facebook: fb.com/mtvxanh
    `,
    requirements: [
      'Từ 16 tuổi trở lên',
      'Sức khỏe tốt, có khả năng hoạt động ngoài trời',
      'Có tinh thần bảo vệ môi trường',
      'Cam kết tham gia đầy đủ chương trình',
    ],
    benefits: [
      'Được cung cấp dụng cụ làm việc',
      'Được cung cấp áo đồng phục của chương trình',
      'Được cung cấp giấy chứng nhận tham gia',
      'Được bảo hiểm trong thời gian tham gia',
      'Được ghi nhận giờ CTXH (đối với sinh viên)',
    ],
    gallery: [
      '/images/activities/beach-1.jpg',
      '/images/activities/beach-2.jpg',
      '/images/activities/beach-3.jpg',
      '/images/activities/beach-4.jpg',
    ],
    relatedActivities: [
      {
        id: 2,
        title: 'Dạy học cho trẻ em vùng cao',
        image: '/images/activities/teaching.jpg',
        category: 'education',
        status: 'ongoing',
      },
      {
        id: 3,
        title: 'Quyên góp sách vở cho trường làng',
        image: '/images/activities/books.jpg',
        category: 'charity',
        status: 'upcoming',
      },
    ],
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-600';
      case 'ongoing':
        return 'bg-green-100 text-green-600';
      case 'completed':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã hoàn thành';
      default:
        return status;
    }
  };

  const handleRegister = () => {
    setIsRegistered(true);
    // TODO: Implement registration logic
  };

  return (
    <div className="container mx-auto py-8">
      {/* Hero Section */}
      <div className="relative h-[500px] rounded-lg overflow-hidden mb-8">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
          <div className="absolute top-4 right-4">
            <ActivityOptions
              activityId={activity.id}
              userRole="member" // TODO: Get from auth context
              status={activity.status}
              onDelete={() => {
                // TODO: Implement delete functionality
                console.log('Delete activity:', activity.id);
              }}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center space-x-4 mb-4">
              <span className={`badge ${getStatusColor(activity.status)}`}>
                {getStatusName(activity.status)}
              </span>
              <span className="badge badge-primary">
                Môi trường
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">{activity.title}</h1>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={activity.organizer.avatar}
                    alt={activity.organizer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{activity.organizer.name}</div>
                  <div className="text-sm text-gray-300">{activity.location}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                </div>
                <div className="text-sm text-gray-300">
                  {activity.participants}/{activity.maxParticipants} người tham gia
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="card mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Giới thiệu</h2>
              <p className="text-gray-600">{activity.description}</p>
            </div>
          </div>

          {/* Content */}
          <div className="card mb-8">
            <div className="p-6">
              <div className="prose max-w-none">
                {activity.content.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{line.slice(2)}</h2>;
                  } else if (line.startsWith('## ')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-3">{line.slice(3)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index} className="ml-4">{line.slice(2)}</li>;
                  } else if (line.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="mb-4">{line}</p>;
                  }
                })}
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="card mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Hình ảnh hoạt động</h2>
              <div className="grid grid-cols-2 gap-4">
                {activity.gallery.map((image, index) => (
                  <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Activities */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Hoạt động liên quan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activity.relatedActivities.map((related) => (
                  <Link
                    key={related.id}
                    href={`/activities/${related.id}`}
                    className="group"
                  >
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src={related.image}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className={`badge ${getStatusColor(related.status)} mb-2`}>
                            {getStatusName(related.status)}
                          </span>
                          <h3 className="text-white font-medium group-hover:text-orange-500 transition-colors">
                            {related.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Registration Card */}
          <div className="card">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {activity.participants}/{activity.maxParticipants}
                </div>
                <div className="text-gray-600">người đã đăng ký tham gia</div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <i className="fas fa-calendar text-gray-400 w-6"></i>
                  <span className="ml-2">
                    {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                  </span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-gray-400 w-6"></i>
                  <span className="ml-2">{activity.location}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-users text-gray-400 w-6"></i>
                  <span className="ml-2">Còn {activity.maxParticipants - activity.participants} chỗ trống</span>
                </div>
              </div>
              <button
                onClick={handleRegister}
                disabled={isRegistered}
                className={`btn btn-primary w-full ${isRegistered ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRegistered ? 'Đã đăng ký tham gia' : 'Đăng ký tham gia'}
              </button>
            </div>
          </div>

          {/* Requirements Card */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Yêu cầu tham gia</h3>
              <ul className="space-y-3">
                {activity.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Benefits Card */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Quyền lợi</h3>
              <ul className="space-y-3">
                {activity.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-gift text-orange-500 mt-1 mr-2"></i>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Organizer Card */}
          <div className="card">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                  <Image
                    src={activity.organizer.avatar}
                    alt={activity.organizer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{activity.organizer.name}</h3>
                  <p className="text-gray-600">Thành lập năm {activity.organizer.foundedYear}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{activity.organizer.description}</p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">
                    {activity.organizer.totalActivities}
                  </div>
                  <div className="text-sm text-gray-600">Hoạt động đã tổ chức</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">
                    {activity.organizer.totalParticipants}
                  </div>
                  <div className="text-sm text-gray-600">Người đã tham gia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailPage; 