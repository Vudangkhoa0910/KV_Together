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
      year: 2020,
      title: 'Khởi đầu hành trình',
      description: 'KV Together được thành lập với mục tiêu kết nối những trái tim nhiệt huyết.',
      image: '/images/about/milestone-1.jpg'
    },
    {
      year: 2021,
      title: 'Mở rộng hoạt động',
      description: 'Triển khai các dự án lớn tại nhiều tỉnh thành, thu hút hàng nghìn tình nguyện viên.',
      image: '/images/about/milestone-2.jpg'
    },
    {
      year: 2022,
      title: 'Phát triển bền vững',
      description: 'Xây dựng mô hình hoạt động bền vững và thiết lập quan hệ đối tác chiến lược.',
      image: '/images/about/milestone-3.jpg'
    },
    {
      year: 2023,
      title: 'Vươn xa hơn nữa',
      description: 'Mở rộng phạm vi hoạt động ra quốc tế và phát triển các dự án mới.',
      image: '/images/about/milestone-4.jpg'
    }
  ];

  const team = [
    {
      name: 'Nguyễn Văn A',
      role: 'Người sáng lập',
      image: '/images/team/founder.jpg',
      description: 'Với hơn 10 năm kinh nghiệm trong lĩnh vực công tác xã hội.',
      social: {
        facebook: '#',
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Trần Thị B',
      role: 'Giám đốc điều hành',
      image: '/images/team/ceo.jpg',
      description: 'Chuyên gia về quản lý dự án và phát triển tổ chức.',
      social: {
        facebook: '#',
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Lê Văn C',
      role: 'Quản lý dự án',
      image: '/images/team/manager.jpg',
      description: 'Nhiều năm kinh nghiệm trong việc tổ chức các hoạt động cộng đồng.',
      social: {
        facebook: '#',
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Phạm Thị D',
      role: 'Điều phối viên',
      image: '/images/team/coordinator.jpg',
      description: 'Chuyên gia về truyền thông và phát triển cộng đồng.',
      social: {
        facebook: '#',
        linkedin: '#',
        twitter: '#'
      }
    }
  ];

  const partners = [
    {
      name: 'Tổ chức A',
      logo: '/images/partners/partner-1.png',
      description: 'Đối tác chiến lược trong các dự án giáo dục.'
    },
    {
      name: 'Công ty B',
      logo: '/images/partners/partner-2.png',
      description: 'Hỗ trợ tài chính và nguồn lực cho các hoạt động.'
    },
    {
      name: 'Quỹ C',
      logo: '/images/partners/partner-3.png',
      description: 'Đồng hành trong các dự án phát triển cộng đồng.'
    },
    {
      name: 'Tập đoàn D',
      logo: '/images/partners/partner-4.png',
      description: 'Cung cấp công nghệ và giải pháp kỹ thuật.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[700px]">
        <Image
          src="/images/about/about_us.png"
          alt="About Us Hero"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50">
          <div className="container mx-auto h-full flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl font-bold mb-6">
                Kết nối yêu thương, lan tỏa hạnh phúc
              </h1>
              <p className="text-xl mb-8">
                KV Together là nơi kết nối những trái tim nhiệt huyết, 
                cùng chung tay xây dựng một cộng đồng tốt đẹp hơn.
              </p>
              <Link href="/activities" className="btn btn-primary">
                Tham gia cùng chúng tôi
              </Link>
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
            <h2 className="text-3xl font-bold mb-4">Đội ngũ của chúng tôi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những con người tâm huyết, luôn nỗ lực hết mình vì cộng đồng
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card p-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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