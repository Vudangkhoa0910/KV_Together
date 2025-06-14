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

  const contactInfo = [
    {
      icon: 'fa-map-marker-alt',
      title: 'Địa chỉ',
      content: '123 Đường ABC, Quận XYZ, TP.HCM',
      link: 'https://goo.gl/maps/123',
    },
    {
      icon: 'fa-phone',
      title: 'Điện thoại',
      content: '(+84) 123 456 789',
      link: 'tel:+84123456789',
    },
    {
      icon: 'fa-envelope',
      title: 'Email',
      content: 'contact@kvtogether.com',
      link: 'mailto:contact@kvtogether.com',
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
      {/* Hero Section */}
      <section className="relative h-[400px]">
        <Image
          src="/images/contact/hero.jpg"
          alt="Contact Hero"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50">
          <div className="container mx-auto h-full flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl font-bold mb-4">Liên hệ với chúng tôi</h1>
              <p className="text-xl">
                Hãy chia sẻ với chúng tôi những ý kiến, thắc mắc hoặc đề xuất của bạn.
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.
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
                  className="card p-6 block hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className={`fas ${info.icon} text-xl`}></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold mb-1">{info.title}</h3>
                      <p className="text-gray-600">{info.content}</p>
                    </div>
                  </div>
                </a>
              ))}

              {/* Social Links */}
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4">Kết nối với chúng tôi</h3>
                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <i className={`fab ${social.icon} text-gray-600`}></i>
                      </div>
                      <span className="ml-2 text-gray-600">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Office Hours */}
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4">Giờ làm việc</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thứ 2 - Thứ 6:</span>
                    <span className="font-medium">8:00 - 17:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thứ 7:</span>
                    <span className="font-medium">8:00 - 12:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chủ nhật:</span>
                    <span className="font-medium">Nghỉ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card p-8">
                <h2 className="text-2xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h2>
                {submitSuccess ? (
                  <div className="bg-green-50 text-green-600 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <i className="fas fa-check-circle text-xl mr-2"></i>
                      <span className="font-medium">Gửi tin nhắn thành công!</span>
                    </div>
                    <p>
                      Cảm ơn bạn đã liên hệ với chúng tôi. 
                      Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="label">Họ và tên</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="input"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="label">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="input"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="label">Số điện thoại</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="label">Chủ đề</label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="input"
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
                      <label htmlFor="message" className="label">Tin nhắn</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="input min-h-[200px]"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`btn btn-primary w-full ${isSubmitting ? 'opacity-75 cursor-wait' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-circle-notch fa-spin mr-2"></i>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i>
                          Gửi tin nhắn
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[400px] relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197956!2d106.69141731533417!3d10.777167362124685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9d8d1bb3%3A0xc4eca1b1726b7e37!2sNguyen%20Hue%20Walking%20Street!5e0!3m2!1sen!2s!4v1647095757201!5m2!1sen!2s"
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