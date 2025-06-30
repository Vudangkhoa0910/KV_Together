'use client';

import React from 'react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thông tin pháp lý
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Các quy định pháp lý, chính sách và điều khoản sử dụng của nền tảng từ thiện
          </p>
        </div>

        {/* Legal Sections */}
        <div className="space-y-8">
          {/* Terms of Service */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-blue-600 mr-3"></span>
              Điều khoản sử dụng
            </h2>
            <div className="prose max-w-none text-gray-700">
              <h3 className="text-lg font-semibold mb-3">1. Về dịch vụ</h3>
              <p className="mb-4">
                Nền tảng từ thiện KV Together cung cấp dịch vụ kết nối những người có nhu cầu 
                quyên góp với các tổ chức, cá nhân cần hỗ trợ thông qua các chiến dịch từ thiện.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">2. Trách nhiệm người dùng</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Cung cấp thông tin chính xác khi đăng ký tài khoản</li>
                <li>Không sử dụng nền tảng cho các mục đích bất hợp pháp</li>
                <li>Tôn trọng quyền riêng tư và thông tin của người dùng khác</li>
                <li>Tuân thủ các quy định về quyên góp và từ thiện</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">3. Quy định về quyên góp</h3>
              <p className="mb-4">
                100% số tiền quyên góp sẽ được chuyển đến đối tượng thụ hưởng. 
                Nền tảng không thu bất kỳ phí nào từ các khoản quyên góp.
              </p>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-green-600 mr-3"></span>
              Chính sách bảo mật
            </h2>
            <div className="prose max-w-none text-gray-700">
              <h3 className="text-lg font-semibold mb-3">Thu thập thông tin</h3>
              <p className="mb-4">
                Chúng tôi thu thập thông tin cần thiết để cung cấp dịch vụ bao gồm:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Thông tin cá nhân: Họ tên, email, số điện thoại</li>
                <li>Thông tin giao dịch: Lịch sử quyên góp, số tiền, phương thức thanh toán</li>
                <li>Thông tin kỹ thuật: IP address, thiết bị, trình duyệt</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">Sử dụng thông tin</h3>
              <p className="mb-4">
                Thông tin được sử dụng để xử lý giao dịch, cung cấp hỗ trợ khách hàng, 
                cải thiện dịch vụ và tuân thủ các quy định pháp lý.
              </p>

              <h3 className="text-lg font-semibold mb-3">Bảo vệ thông tin</h3>
              <p className="mb-4">
                Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin 
                cá nhân của người dùng khỏi truy cập trái phép.
              </p>
            </div>
          </div>

          {/* Legal Compliance */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-orange-600 mr-3"></span>
              Tuân thủ pháp luật
            </h2>
            <div className="prose max-w-none text-gray-700">
              <h3 className="text-lg font-semibold mb-3">Giấy phép hoạt động</h3>
              <p className="mb-4">
                KV Together hoạt động theo các quy định của pháp luật Việt Nam về 
                hoạt động từ thiện và quyên góp.
              </p>

              <h3 className="text-lg font-semibold mb-3">Báo cáo minh bạch</h3>
              <p className="mb-4">
                Nền tảng cam kết công khai 100% thông tin tài chính và báo cáo định kỳ 
                về việc sử dụng các khoản quyên góp.
              </p>

              <h3 className="text-lg font-semibold mb-3">Giải quyết tranh chấp</h3>
              <p className="mb-4">
                Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng, 
                hòa giải hoặc theo quy định của pháp luật Việt Nam.
              </p>
            </div>
          </div>

          {/* Contact Legal */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-purple-600 mr-3"></span>
              Liên hệ pháp lý
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p className="mb-4">
                Nếu bạn có bất kỳ câu hỏi nào về các vấn đề pháp lý, vui lòng liên hệ:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> khoalegal@kvtogether.org</p>
                <p><strong>Điện thoại:</strong> 0822608286</p>
                <p><strong>Địa chỉ:</strong> P. Nguyễn Trác, Phường Yên Nghĩa, Quận Hà Đông, Thành Phố Hà Nội.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-12 text-gray-500">
          <p>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </div>
    </div>
  );
}
