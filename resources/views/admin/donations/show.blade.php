<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">Chi tiết quyên góp</h2>
                        <a href="{{ route('admin.donations.index') }}" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Quay lại
                        </a>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Donation Info -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h3 class="text-lg font-semibold mb-4">Thông tin quyên góp</h3>
                            <div class="space-y-4">
                                <div>
                                    <p class="text-sm text-gray-500">Mã quyên góp</p>
                                    <p class="font-medium">{{ $donation->id }}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Số tiền</p>
                                    <p class="font-medium text-xl text-green-600">{{ number_format($donation->amount) }}đ</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Trạng thái</p>
                                    <span class="px-2 py-1 text-sm rounded-full
                                        @if($donation->status == 'completed') bg-green-100 text-green-800
                                        @elseif($donation->status == 'pending') bg-yellow-100 text-yellow-800
                                        @else bg-red-100 text-red-800
                                        @endif">
                                        {{ $donation->status }}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Ngày quyên góp</p>
                                    <p class="font-medium">{{ $donation->created_at->format('d/m/Y H:i') }}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Ghi chú</p>
                                    <p class="font-medium">{{ $donation->note ?? 'Không có' }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Campaign Info -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h3 class="text-lg font-semibold mb-4">Thông tin chiến dịch</h3>
                            <div class="space-y-4">
                                <div>
                                    <p class="text-sm text-gray-500">Tên chiến dịch</p>
                                    <p class="font-medium">{{ $donation->campaign->title }}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Mục tiêu</p>
                                    <p class="font-medium">{{ number_format($donation->campaign->target_amount) }}đ</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Đã quyên góp</p>
                                    <p class="font-medium">{{ number_format($donation->campaign->current_amount) }}đ</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Tiến độ</p>
                                    <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: {{ ($donation->campaign->current_amount / $donation->campaign->target_amount) * 100 }}%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Donor Info -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h3 class="text-lg font-semibold mb-4">Thông tin người quyên góp</h3>
                            <div class="space-y-4">
                                <div>
                                    <p class="text-sm text-gray-500">Tên</p>
                                    <p class="font-medium">{{ $donation->is_anonymous ? 'Ẩn danh' : $donation->user->name }}</p>
                                </div>
                                @if(!$donation->is_anonymous)
                                    <div>
                                        <p class="text-sm text-gray-500">Email</p>
                                        <p class="font-medium">{{ $donation->user->email }}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500">Số điện thoại</p>
                                        <p class="font-medium">{{ $donation->user->phone ?? 'Không có' }}</p>
                                    </div>
                                @endif
                            </div>
                        </div>

                        <!-- Payment Info -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h3 class="text-lg font-semibold mb-4">Thông tin thanh toán</h3>
                            <div class="space-y-4">
                                <div>
                                    <p class="text-sm text-gray-500">Phương thức</p>
                                    <p class="font-medium">{{ $donation->payment_method }}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Mã giao dịch</p>
                                    <p class="font-medium">{{ $donation->transaction_id ?? 'Không có' }}</p>
                                </div>
                                @if($donation->status == 'pending')
                                    <div class="mt-6">
                                        <form action="{{ route('admin.donations.update', $donation) }}" method="POST">
                                            @csrf
                                            @method('PUT')
                                            <input type="hidden" name="status" value="completed">
                                            <button type="submit" class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                                Xác nhận quyên góp
                                            </button>
                                        </form>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 