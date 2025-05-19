<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="mb-6">
                        <a href="{{ route('campaigns.index') }}" class="text-blue-500 hover:text-blue-700">
                            &larr; Quay lại danh sách
                        </a>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Campaign Image -->
                        <div>
                            @if($campaign->image)
                                <img src="{{ asset('storage/' . $campaign->image) }}" alt="{{ $campaign->title }}" class="w-full h-96 object-cover rounded-lg">
                            @endif
                        </div>

                        <!-- Campaign Details -->
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ $campaign->title }}</h1>
                            
                            <div class="mb-6">
                                <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
                                    <div class="bg-blue-600 h-4 rounded-full" style="width: {{ ($campaign->current_amount / $campaign->target_amount) * 100 }}%"></div>
                                </div>
                                <div class="flex justify-between text-sm text-gray-600">
                                    <span>Đã quyên góp: {{ number_format($campaign->current_amount) }}đ</span>
                                    <span>Mục tiêu: {{ number_format($campaign->target_amount) }}đ</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p class="text-sm text-gray-600">Ngày bắt đầu</p>
                                    <p class="font-semibold">{{ $campaign->start_date->format('d/m/Y') }}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-600">Ngày kết thúc</p>
                                    <p class="font-semibold">{{ $campaign->end_date->format('d/m/Y') }}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-600">Trạng thái</p>
                                    <p class="font-semibold">
                                        @if($campaign->status == 'active')
                                            <span class="text-green-600">Đang diễn ra</span>
                                        @elseif($campaign->status == 'completed')
                                            <span class="text-blue-600">Đã hoàn thành</span>
                                        @else
                                            <span class="text-red-600">Đã hủy</span>
                                        @endif
                                    </p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-600">Số người quyên góp</p>
                                    <p class="font-semibold">{{ $campaign->donations->count() }}</p>
                                </div>
                            </div>

                            <div class="mb-6">
                                <h2 class="text-xl font-semibold mb-2">Mô tả chiến dịch</h2>
                                <p class="text-gray-600">{{ $campaign->description }}</p>
                            </div>

                            @if($campaign->status == 'active')
                                <a href="{{ route('campaigns.donate', $campaign) }}" class="block w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded text-center">
                                    Quyên góp ngay
                                </a>
                            @endif
                        </div>
                    </div>

                    <!-- Donation History -->
                    <div class="mt-12">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Lịch sử quyên góp</h2>
                        <div class="bg-white rounded-lg shadow overflow-hidden">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người quyên góp</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lời nhắn</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    @foreach($campaign->donations as $donation)
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                @if($donation->is_anonymous)
                                                    <span class="text-gray-500">Ẩn danh</span>
                                                @else
                                                    {{ $donation->user->name }}
                                                @endif
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                {{ number_format($donation->amount) }}đ
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                {{ $donation->created_at->format('d/m/Y H:i') }}
                                            </td>
                                            <td class="px-6 py-4">
                                                {{ $donation->message }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 