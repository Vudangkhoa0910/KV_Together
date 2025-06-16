'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement form submission
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cập nhật thông tin liên hệ chi tiết và đúng yêu cầu
  const contactInfo = [
    {
      icon: 'fa-map-marker-alt',
      title: 'Địa chỉ',
      content: 'P. Nguyễn Trác, Yên Nghĩa, Hà Đông, Hà Nội',
      link: 'https://www.google.com/maps/dir//P.+Nguy%E1%BB%85n+Tr%C3%A1c,+Y%C3%AAn+Ngh%C4%A9a,+H%C3%A0+%C4%90%C3%B4ng,+H%C3%A0+N%E1%BB%96i/@20.9625914,105.6662847,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x313452efff394ce3:0x391a39d4325be464!2m2!1d105.7486864!2d20.9626112?entry=ttu',
    },
    {
      icon: 'fa-phone',
      title: 'Điện thoại',
      content: '0822 608 286',
      link: 'tel:0822608286',
    },
    {
      icon: 'fa-envelope',
      title: 'Email',
      content: 'khoa@together.com',
      link: 'mailto:khoa@together.com',
    },
  ];

  const socialLinks = [
    {
      icon: 'fa-facebook',
      name: 'Facebook',
      url: 'https://facebook.com/kvtogether',
    },
    {
      icon: 'fa-twitter',
      name: 'Twitter',
      url: 'https://twitter.com/kvtogether',
    },
    {
      icon: 'fa-instagram',
      name: 'Instagram',
      url: 'https://instagram.com/kvtogether',
    },
    {
      icon: 'fa-linkedin',
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/kvtogether',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section với gradient cam-trắng */}
      <section className="relative h-[400px] bg-gradient-to-br from-orange-500 via-white to-white">
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto h-full flex items-center">
            <div className="max-w-2xl text-white drop-shadow-lg">
              <h1 className="text-4xl font-bold mb-4 text-orange-700">Liên hệ với chúng tôi</h1>
              <p className="text-xl text-orange-900 font-medium">
                Kết nối với KV Together để nhận tư vấn, hợp tác hoặc hỗ trợ các hoạt động cộng đồng. Chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              {/* Contact Cards */}
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-6 block hover:shadow-lg transition-shadow bg-white rounded-xl border border-gray-100 flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 text-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow">
                    <i className={`fas ${info.icon} text-2xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-gray-900">{info.title}</h3>
                    <p className="text-gray-600 text-base">{info.content}</p>
                  </div>
                </a>
              ))}

              {/* Social Links */}
              <div className="card p-6 bg-white rounded-xl border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Kết nối với chúng tôi</h3>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center hover:bg-orange-100 transition"
                    >
                      <i className={`fab ${social.icon} text-xl text-orange-500`}></i>
                    </a>
                  ))}
                </div>
              </div>

              {/* Office Hours */}
              <div className="card p-6 bg-white rounded-xl border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Giờ làm việc</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Thứ 2 - Thứ 6:</span>
                    <span className="font-medium">8:00 - 17:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thứ 7:</span>
                    <span className="font-medium">8:00 - 12:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chủ nhật:</span>
                    <span className="font-medium">Nghỉ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form nâng cấp UI */}
            <div className="lg:col-span-2">
              <div className="card p-10 bg-white rounded-xl border border-gray-100 shadow-lg">
                <h2 className="text-2xl font-bold mb-8 text-gray-900">Gửi tin nhắn cho chúng tôi</h2>
                {submitSuccess ? (
                  <div className="bg-green-50 text-green-600 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <i className="fas fa-check-circle text-xl mr-2"></i>
                      <span className="font-medium">Gửi tin nhắn thành công!</span>
                    </div>
                    <p>
                      Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label htmlFor="name" className="block text-base font-semibold mb-2 text-gray-700">Họ và tên</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-gray-900 bg-gray-50"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-base font-semibold mb-2 text-gray-700">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-gray-900 bg-gray-50"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label htmlFor="phone" className="block text-base font-semibold mb-2 text-gray-700">Số điện thoại</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-gray-900 bg-gray-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-base font-semibold mb-2 text-gray-700">Chủ đề</label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-gray-900 bg-gray-50"
                          required
                        >
                          <option value="">Chọn chủ đề</option>
                          <option value="general">Thông tin chung</option>
                          <option value="activity">Hoạt động thiện nguyện</option>
                          <option value="partnership">Hợp tác</option>
                          <option value="support">Hỗ trợ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-base font-semibold mb-2 text-gray-700">Tin nhắn</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-gray-900 bg-gray-50 min-h-[120px]"
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 rounded-full text-white font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-400 shadow-lg flex items-center justify-center gap-2 transition hover:from-orange-600 hover:to-orange-500 ${isSubmitting ? 'opacity-75 cursor-wait' : ''}`}
                    >
                      <i className="fas fa-paper-plane"></i>
                      Gửi tin nhắn
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Địa chỉ mới */}
      <section className="h-[400px] relative mt-10 rounded-xl overflow-hidden shadow-lg">
        <iframe
          src="https://www.google.com/maps?q=P.+Nguy%E1%BB%85n+Tr%C3%A1c,+Y%C3%AAn+Ngh%C4%A9a,+H%C3%A0+%C4%90%C3%B4ng,+H%C3%A0+N%E1%BB%96i&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactPage;