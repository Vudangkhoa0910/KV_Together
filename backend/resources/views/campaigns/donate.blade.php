<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="mb-6">
                        <a href="{{ route('campaigns.show', $campaign) }}" class="text-blue-500 hover:text-blue-700">
                            ← Quay lại chiến dịch
                        </a>
                    </div>

                    <div class="max-w-2xl mx-auto">
                        <h1 class="text-3xl font-bold text-gray-900 mb-8">Quyên góp cho chiến dịch: {{ $campaign->title }}</h1>

                        <form action="{{ route('donations.store') }}" method="POST" class="space-y-6">
                            @csrf
                            <input type="hidden" name="campaign_id" value="{{ $campaign->id }}">

                            <!-- Amount -->
                            <div>
                                <label for="amount" class="block text-sm font-medium text-gray-700">Số tiền quyên góp (VNĐ)</label>
                                <div class="mt-1">
                                    <input type="number" name="amount" id="amount" required min="10000" step="10000"
                                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        placeholder="Nhập số tiền">
                                </div>
                                <p class="mt-2 text-sm text-gray-500">Số tiền tối thiểu: 10,000đ</p>
                            </div>

                            <!-- Payment Method -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
                                <div class="mt-2 space-y-4">
                                    <div class="flex items-center">
                                        <input type="radio" name="payment_method" value="momo" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300">
                                        <label class="ml-3 block text-sm font-medium text-gray-700">
                                            Ví MoMo
                                        </label>
                                    </div>
                                    <div class="flex items-center">
                                        <input type="radio" name="payment_method" value="vnpay" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300">
                                        <label class="ml-3 block text-sm font-medium text-gray-700">
                                            VNPay
                                        </label>
                                    </div>
                                    <div class="flex items-center">
                                        <input type="radio" name="payment_method" value="bank_transfer" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300">
                                        <label class="ml-3 block text-sm font-medium text-gray-700">
                                            Chuyển khoản ngân hàng
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Message -->
                            <div>
                                <label for="message" class="block text-sm font-medium text-gray-700">Lời nhắn (không bắt buộc)</label>
                                <div class="mt-1">
                                    <textarea name="message" id="message" rows="3"
                                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        placeholder="Nhập lời nhắn của bạn"></textarea>
                                </div>
                            </div>

                            <!-- Anonymous -->
                            <div class="flex items-center">
                                <input type="checkbox" name="is_anonymous" id="is_anonymous" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded">
                                <label for="is_anonymous" class="ml-2 block text-sm text-gray-900">
                                    Quyên góp ẩn danh
                                </label>
                            </div>

                            <div class="pt-5">
                                <button type="submit" class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded">
                                    Xác nhận quyên góp
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>