'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutPage = () => {
  // Mock data
  const stats = [
    { number: '10,000+', label: 'Người tham gia' },
    { number: '500+', label: 'Hoạt động đã tổ chức' },
    { number: '50+', label: 'Đối tác' },
    { number: '20+', label: 'Tỉnh thành' },
  ];

  const values = [
    {
      icon: 'fa-heart',
      title: 'Tình nguyện',
      description: 'Chúng tôi tin vào sức mạnh của tinh thần tình nguyện và sự sẻ chia trong cộng đồng.'
    },
    {
      icon: 'fa-hands-helping',
      title: 'Trách nhiệm',
      description: 'Mỗi hoạt động của chúng tôi đều hướng đến mục tiêu phát triển bền vững cho cộng đồng.'
    },
    {
      icon: 'fa-users',
      title: 'Kết nối',
      description: 'Xây dựng mạng lưới kết nối rộng khắp, tạo cơ hội cho mọi người cùng tham gia.'
    },
    {
      icon: 'fa-lightbulb',
      title: 'Sáng tạo',
      description: 'Luôn tìm tòi những giải pháp mới, cách tiếp cận mới để giải quyết các vấn đề xã hội.'
    }
  ];

  const milestones = [
    {
      year: 2024,
      title: 'Khởi đầu mới',
      description: 'KV Together bước vào giai đoạn phát triển mới với nhiều dự án cộng đồng ý nghĩa, mở rộng quy mô hoạt động trên toàn quốc.',
      image: '/images/about/about_us_1.png',
    },
    {
      year: 2024,
      title: 'Lan tỏa giá trị',
      description: 'Tổ chức các chương trình thiện nguyện, kết nối hàng nghìn tình nguyện viên và đối tác trên khắp cả nước.',
      image: '/images/about/about_us_2.jpg',
    },
    {
      year: 2025,
      title: 'Vững bước phát triển',
      description: 'Xây dựng hệ sinh thái thiện nguyện số, ứng dụng công nghệ để tối ưu hóa hoạt động và minh bạch hóa thông tin.',
      image: '/images/about/about_us_3.webp',
    },
    {
      year: 2025,
      title: 'Vươn tầm quốc tế',
      description: 'Mở rộng hợp tác với các tổ chức quốc tế, đưa hình ảnh thiện nguyện Việt Nam ra thế giới.',
      image: '/images/about/about_us_1.webp',
    },
  ];

  const heroImages = [
    '/images/about/about_us_1.png',
    '/images/about/about_us_2.jpg',
    '/images/about/about_us_3.webp',
  ];

  const team = [
    {
      name: 'Vũ Đăng Khoa',
      role: 'Người sáng lập',
      image: '/images/about/owner/VuDangKhoa.jpg',
      description: 'Vũ Đăng Khoa là người sáng lập KV Together, với tầm nhìn xây dựng một cộng đồng kết nối và sẻ chia. Anh có nhiều năm kinh nghiệm trong lĩnh vực công tác xã hội và phát triển cộng đồng.',
      social: {
        facebook: '#',
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Nguyễn Hữu Vinh',
      role: 'Đồng sáng lập',
      image: '/images/about/owner/Vinh.png',
      description: 'Nguyễn Hữu Vinh đồng hành cùng KV Together từ những ngày đầu, đóng vai trò quan trọng trong việc phát triển các dự án cộng đồng và kết nối các đối tác chiến lược.',
      social: {
        facebook: '#',
        linkedin: '#',
        twitter: '#'
      }
    },
  ];

  const partners = [
    {
      name: 'FPT',
      logo: '/images/about/partner/fpt.png',
      description: 'Đối tác công nghệ đồng hành cùng các dự án chuyển đổi số cộng đồng.'
    },
    {
      name: 'Phenikaa',
      logo: '/images/about/partner/phenikaa.webp',
      description: 'Hỗ trợ nghiên cứu, phát triển giải pháp sáng tạo cho xã hội.'
    },
    {
      name: 'VinGroup',
      logo: '/images/about/partner/vin.jpg',
      description: 'Đồng hành trong các dự án thiện nguyện quy mô lớn.'
    },
    {
      name: 'VNPay',
      logo: '/images/about/partner/vnpay.jpg',
      description: 'Đối tác thanh toán, hỗ trợ các chiến dịch gây quỹ minh bạch.'
    },
    {
      name: 'Đoàn Thanh Niên',
      logo: '/images/about/partner/ĐoànTN.jpg',
      description: 'Đồng hành tổ chức các hoạt động thiện nguyện cho thanh thiếu niên.'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Carousel */}
      <section
        className="relative w-full h-[420px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/about/about_us.png)' }}
      >
        <div className="absolute inset-0 bg-orange-500/70" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về KV Together</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Kết nối - Lan tỏa - Sẻ chia. Chúng tôi xây dựng một cộng đồng vững mạnh, nơi mọi người cùng nhau tạo nên những giá trị tốt đẹp cho xã hội.
          </p>
          <div className="flex justify-center gap-12 mt-10 w-full">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">10,000+</span>
              <span className="text-base">Người tham gia</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">500+</span>
              <span className="text-base">Hoạt động đã tổ chức</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">50+</span>
              <span className="text-base">Đối tác</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">20+</span>
              <span className="text-base">Tỉnh thành</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Giá trị cốt lõi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những giá trị định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card text-center p-6">
                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`fas ${value.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Hành trình phát triển</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những dấu mốc quan trọng trong quá trình phát triển của KV Together
            </p>
          </div>
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}>
                <div className="flex-1">
                  <div className="relative h-64 rounded-lg overflow-hidden">
                    <Image
                      src={milestone.image}
                      alt={milestone.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-orange-500 font-bold text-xl mb-2">
                    {milestone.year}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Đội ngũ sáng lập</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những người đặt nền móng và dẫn dắt KV Together phát triển bền vững
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
                <div className="relative w-40 h-40 mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover rounded-full border-4 border-orange-200 shadow-md"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-1 text-orange-700">{member.name}</h3>
                  <div className="text-orange-500 font-medium mb-2">{member.role}</div>
                  <p className="text-gray-600 mb-4">{member.description}</p>
                  <div className="flex justify-center space-x-4">
                    <a href={member.social.facebook} className="text-gray-400 hover:text-orange-500">
                      <i className="fab fa-facebook"></i>
                    </a>
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-orange-500">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href={member.social.twitter} className="text-gray-400 hover:text-orange-500">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Đối tác của chúng tôi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cảm ơn sự đồng hành và hỗ trợ của các đối tác
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            {partners.map((partner, index) => (
              <div key={index} className="card p-6">
                <div className="relative h-24 mb-4">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">{partner.name}</h3>
                  <p className="text-gray-600">{partner.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Hãy cùng chúng tôi lan tỏa yêu thương
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Mỗi hành động nhỏ đều có thể tạo nên sự thay đổi lớn. 
            Hãy tham gia cùng chúng tôi để xây dựng một cộng đồng tốt đẹp hơn.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/activities" className="btn btn-white">
              Khám phá hoạt động
            </Link>
            <Link href="/contact" className="btn btn-outline-white">
              Liên hệ với chúng tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;