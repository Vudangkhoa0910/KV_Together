<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Bảng điều khiển quản trị</h2>

                    <!-- Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="bg-blue-100 rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-blue-800 mb-2">Tổng chiến dịch</h3>
                            <p class="text-3xl font-bold text-blue-600">{{ $totalCampaigns }}</p>
                        </div>
                        <div class="bg-green-100 rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-green-800 mb-2">Tổng quyên góp</h3>
                            <p class="text-3xl font-bold text-green-600">{{ number_format($totalDonations) }}đ</p>
                        </div>
                        <div class="bg-yellow-100 rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-yellow-800 mb-2">Tổng hoạt động</h3>
                            <p class="text-3xl font-bold text-yellow-600">{{ $totalActivities }}</p>
                        </div>
                        <div class="bg-purple-100 rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-purple-800 mb-2">Tổng tin tức</h3>
                            <p class="text-3xl font-bold text-purple-600">{{ $totalNews }}</p>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Campaigns -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold">Chiến dịch gần đây</h3>
                                <a href="{{ route('admin.campaigns.index') }}" class="text-blue-500 hover:text-blue-700">Xem tất cả</a>
                            </div>
                            <div class="space-y-4">
                                @foreach($recentCampaigns as $campaign)
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <p class="font-medium">{{ $campaign->title }}</p>
                                            <p class="text-sm text-gray-500">{{ number_format($campaign->current_amount) }}đ / {{ number_format($campaign->target_amount) }}đ</p>
                                        </div>
                                        <span class="px-2 py-1 text-sm rounded-full
                                            @if($campaign->status == 'active') bg-green-100 text-green-800
                                            @elseif($campaign->status == 'completed') bg-blue-100 text-blue-800
                                            @else bg-red-100 text-red-800
                                            @endif">
                                            {{ $campaign->status }}
                                        </span>
                                    </div>
                                @endforeach
                            </div>
                        </div>

                        <!-- Recent Donations -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold">Quyên góp gần đây</h3>
                                <a href="{{ route('admin.donations.index') }}" class="text-blue-500 hover:text-blue-700">Xem tất cả</a>
                            </div>
                            <div class="space-y-4">
                                @foreach($recentDonations as $donation)
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <p class="font-medium">{{ $donation->is_anonymous ? 'Ẩn danh' : $donation->user->name }}</p>
                                            <p class="text-sm text-gray-500">{{ $donation->campaign->title }}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-medium">{{ number_format($donation->amount) }}đ</p>
                                            <p class="text-sm text-gray-500">{{ $donation->created_at->format('d/m/Y') }}</p>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 