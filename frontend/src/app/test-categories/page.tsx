export default function TestCategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Test Categories</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Categories from MenuItems:</h2>
        <ul className="space-y-2">
          <li><a href="/news" className="text-blue-600 hover:underline">Tất cả tin tức</a></li>
          <li><a href="/news?featured=true" className="text-blue-600 hover:underline">Tin nổi bật</a></li>
          <li><a href="/news?category=community" className="text-blue-600 hover:underline">Cộng đồng</a></li>
          <li><a href="/news?category=event" className="text-blue-600 hover:underline">Sự kiện</a></li>
          <li><a href="/news?category=story" className="text-blue-600 hover:underline">Câu chuyện</a></li>
          <li><a href="/news?category=announcement" className="text-blue-600 hover:underline">Thông báo</a></li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8">Search Tests:</h2>
        <ul className="space-y-2">
          <li><a href="/news?search=từ thiện" className="text-blue-600 hover:underline">Search: "từ thiện"</a></li>
          <li><a href="/news?search=Viettel" className="text-blue-600 hover:underline">Search: "Viettel"</a></li>
          <li><a href="/news?category=community&search=quỹ" className="text-blue-600 hover:underline">Cộng đồng + Search: "quỹ"</a></li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8">Combined Filters:</h2>
        <ul className="space-y-2">
          <li><a href="/news?category=community&featured=true" className="text-blue-600 hover:underline">Cộng đồng + Nổi bật</a></li>
          <li><a href="/news?category=story&page=1" className="text-blue-600 hover:underline">Câu chuyện + Page 1</a></li>
        </ul>
      </div>
    </div>
  );
}
