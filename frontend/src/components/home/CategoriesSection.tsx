import React from 'react';
import { Category } from '@/services/api';
import Link from 'next/link';

interface CategoriesSectionProps {
  categories: Category[];
  title?: string;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ 
  categories, 
  title = "Các lĩnh vực gây quỹ" 
}) => {
  const getCategoryIcon = (slug: string): string => {
    const icons: { [key: string]: string } = {
      'y-te': '🏥',
      'medical': '🏥',
      'giao-duc': '📚',
      'education': '📚',
      'tre-em': '👶',
      'children': '👶',
      'nguoi-gia': '👴',
      'elderly': '👴',
      'moi-truong': '🌱',
      'environment': '🌱',
      'cong-dong': '🤝',
      'community': '🤝',
      'thien-tai': '⛑️',
      'disaster': '⛑️',
      'default': '🎯'
    };
    
    return icons[slug] || icons['default'];
  };

  const getCategoryColor = (index: number): string => {
    const colors = [
      'from-red-400 to-red-600',
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-yellow-400 to-yellow-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600'
    ];
    
    return colors[index % colors.length];
  };

  const getCategoryBg = (index: number): string => {
    const backgrounds = [
      'from-red-50 to-red-100',
      'from-blue-50 to-blue-100',
      'from-green-50 to-green-100',
      'from-purple-50 to-purple-100',
      'from-yellow-50 to-yellow-100',
      'from-pink-50 to-pink-100',
      'from-indigo-50 to-indigo-100',
      'from-teal-50 to-teal-100'
    ];
    
    return backgrounds[index % backgrounds.length];
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chọn lĩnh vực bạn quan tâm để ủng hộ và tạo ra sự thay đổi tích cực
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/campaigns?category=${category.slug}`}
              className="group cursor-pointer w-56"
            >
              <div className={`relative bg-gradient-to-br ${getCategoryBg(index)} rounded-2xl p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-transparent hover:border-white`}>
                {/* Background decoration */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(index)} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Icon */}
                <div className="relative z-10 text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {getCategoryIcon(category.slug)}
                </div>
                
                {/* Name */}
                <h3 className="relative z-10 font-semibold text-gray-800 text-base group-hover:text-gray-900 transition-colors duration-300">
                  {category.name}
                </h3>

                {/* Hover effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor(index)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl`}></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Bạn muốn tạo chiến dịch gây quỹ?
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy gia nhập cộng đồng những người tạo ra sự thay đổi tích cực
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Tạo chiến dịch
              </button>
              <button className="border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
