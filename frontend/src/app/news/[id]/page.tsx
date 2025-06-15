'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const NewsDetail = ({ params }: { params: { id: string } }) => {
  // Mock data for news article
  const article = {
    id: params.id,
    title: 'Chương trình từ thiện "Tết cho người nghèo" đạt mục tiêu',
    category: 'events',
    image: '/images/news1.jpg',
    content: `
Trong không khí rộn ràng của những ngày cuối năm, chương trình "Tết cho người nghèo" đã kết thúc thành công tốt đẹp với sự đóng góp nhiệt tình từ cộng đồng. Chương trình đã quyên góp được hơn 500 triệu đồng, vượt xa mục tiêu ban đầu đề ra.

## Những con số ấn tượng

- Hơn 1000 hộ gia đình được hỗ trợ
- 500 suất quà Tết trị giá 1 triệu đồng/suất
- 200 phần học bổng cho học sinh nghèo
- 300 phần quà cho người già neo đơn

## Hành trình của yêu thương

Chương trình được triển khai trong vòng 2 tháng, với sự tham gia của hơn 100 tình nguyện viên. Các hoạt động chính bao gồm:

1. Khảo sát và lập danh sách các hộ gia đình khó khăn
2. Vận động quyên góp từ cộng đồng
3. Tổ chức các hoạt động gây quỹ
4. Phân phối quà Tết đến các gia đình

## Những câu chuyện cảm động

Trong quá trình thực hiện chương trình, chúng tôi đã chứng kiến nhiều câu chuyện cảm động về tinh thần tương thân tương ái. Có những em nhỏ góp tiền tiết kiệm, những cụ già góp từng đồng lương hưu, và cả những doanh nghiệp sẵn sàng đóng góp số tiền lớn.

## Kế hoạch tiếp theo

Sau thành công của chương trình này, chúng tôi dự định sẽ:

- Mở rộng phạm vi hỗ trợ
- Tổ chức thêm các hoạt động gây quỹ
- Xây dựng mạng lưới tình nguyện viên
- Phát triển các chương trình hỗ trợ dài hạn

## Lời cảm ơn

Chúng tôi xin chân thành cảm ơn tất cả các nhà hảo tâm, tình nguyện viên và đối tác đã đồng hành cùng chương trình. Sự thành công này là minh chứng cho sức mạnh của sự đoàn kết và lòng nhân ái trong cộng đồng.`,
    author: {
      name: 'Nguyễn Văn A',
      avatar: '/images/avatars/author1.jpg',
      role: 'Điều phối viên dự án'
    },
    date: '2024-03-15',
    readTime: '5 phút',
    tags: ['từ thiện', 'cộng đồng', 'tết', 'hỗ trợ'],
    relatedArticles: [
      {
        id: 2,
        title: 'Câu chuyện về những tấm lòng nhân ái trong mùa dịch',
        image: '/images/news2.jpg',
        date: '2024-03-14'
      },
      {
        id: 3,
        title: 'Chương trình học bổng cho học sinh nghèo vượt khó',
        image: '/images/news3.jpg',
        date: '2024-03-13'
      }
    ]
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link href="/news" className="hover:text-orange-500">
          <i className="fas fa-arrow-left mr-2"></i>
          Quay lại
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <article className="bg-white rounded-lg overflow-hidden">
            {/* Article Header */}
            <div className="relative h-[400px]">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-8">
              <h1 className="text-4xl font-bold mb-6">{article.title}</h1>

              {/* Article Meta */}
              <div className="flex items-center mb-8">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold">{article.author.name}</div>
                  <div className="text-sm text-gray-500">
                    <span>{article.author.role}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(article.date)}</span>
                    <span className="mx-2">•</span>
                    <span>{article.readTime} đọc</span>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="prose max-w-none">
                {article.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                        {paragraph.replace('## ', '')}
                      </h2>
                    );
                  }
                  return <p key={index} className="mb-4">{paragraph}</p>;
                })}
              </div>

              {/* Tags */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/news/tags/${tag}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">Chia sẻ bài viết</h3>
                <div className="flex space-x-4">
                  <button className="btn btn-outline">
                    <i className="fab fa-facebook-f mr-2"></i>
                    Facebook
                  </button>
                  <button className="btn btn-outline">
                    <i className="fab fa-twitter mr-2"></i>
                    Twitter
                  </button>
                  <button className="btn btn-outline">
                    <i className="far fa-envelope mr-2"></i>
                    Email
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Author Card */}
          <div className="card mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Về tác giả</h3>
              <div className="flex items-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold">{article.author.name}</div>
                  <div className="text-sm text-gray-500">{article.author.role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Bài viết liên quan</h3>
              <div className="space-y-6">
                {article.relatedArticles.map((related) => (
                  <div key={related.id} className="flex space-x-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={related.image}
                        alt={related.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium line-clamp-2 hover:text-orange-500">
                        <Link href={`/news/${related.id}`}>
                          {related.title}
                        </Link>
                      </h4>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(related.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail; 