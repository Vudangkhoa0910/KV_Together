import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { DonationModalProps } from '@/types/donation';

const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  donationInfo,
  campaign,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyField, setCopyField] = useState<string>('');

  useEffect(() => {
    console.log('Donation Info:', donationInfo);
  }, [donationInfo]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopyField(field);
    setTimeout(() => {
      setCopied(false);
      setCopyField('');
    }, 2000);
  };

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        Thông tin chuyển khoản
                      </Dialog.Title>
                      <div className="mt-4 space-y-4">
                        <div className="bg-orange-50 rounded-lg p-4">
                          <p className="text-sm text-orange-700">
                            Vui lòng chuyển khoản với nội dung dưới đây. Chúng tôi sẽ xác nhận sau khi nhận được tiền.
                          </p>
                        </div>

                        {/* Bank Transfer Info */}
                        {donationInfo?.payment_info && (
                          <div className="space-y-3">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-500">Số tài khoản</p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-lg font-semibold">{donationInfo.payment_info.account_number}</p>
                                <button
                                  onClick={() => copyToClipboard(donationInfo.payment_info.account_number, 'account')}
                                  className="text-orange-600 hover:text-orange-700 text-sm"
                                >
                                  {copied && copyField === 'account' ? 'Đã sao chép!' : 'Sao chép'}
                                </button>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-500">Ngân hàng</p>
                              <p className="text-lg font-semibold">{donationInfo.payment_info.bank_name}</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-500">Số tiền</p>
                              <p className="text-lg font-semibold">
                                {new Intl.NumberFormat('vi-VN').format(donationInfo.amount)}đ
                              </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-500">Nội dung chuyển khoản</p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-lg font-semibold">
                                  {`KVT${donationInfo.id}`}
                                </p>
                                <button
                                  onClick={() => copyToClipboard(`KVT${donationInfo.id}`, 'content')}
                                  className="text-orange-600 hover:text-orange-700 text-sm"
                                >
                                  {copied && copyField === 'content' ? 'Đã sao chép!' : 'Sao chép'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* QR Code */}
                        {donationInfo?.payment_info?.qr_url && (
                          <div className="flex justify-center mt-4">
                            <div className="relative w-[200px] h-[200px] bg-gray-50 rounded-lg overflow-hidden">
                              <img
                                src={donationInfo.payment_info.qr_url}
                                alt="Mã QR chuyển khoản"
                                className="w-full h-full object-contain p-2"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default DonationModal;
