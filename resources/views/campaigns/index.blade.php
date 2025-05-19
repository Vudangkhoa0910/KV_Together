<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">Chiến dịch từ thiện</h2>
                        @if(auth()->user() && auth()->user()->is_admin)
                            <a href="{{ route('campaigns.create') }}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Tạo chiến dịch mới
                            </a>
                        @endif
                    </div>

                    <!-- Filters -->
                    <div class="mb-6">
                        <form action="{{ route('campaigns.index') }}" method="GET" class="flex gap-4">
                            <select name="status" class="rounded-md border-gray-300">
                                <option value="">Tất cả trạng thái</option>
                                <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Đang diễn ra</option>
                                <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Đã hoàn thành</option>
                                <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Đã hủy</option>
                            </select>
                            <button type="submit" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                Lọc
                            </button>
                        </form>
                    </div>

                    <!-- Campaigns Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        @foreach($campaigns as $campaign)
                            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                                @if($campaign->image)
                                    <img src="{{ asset('storage/' . $campaign->image) }}" alt="{{ $campaign->title }}" class="w-full h-48 object-cover">
                                @endif
                                <div class="p-4">
                                    <h3 class="text-lg font-semibold mb-2">{{ $campaign->title }}</h3>
                                    <p class="text-gray-600 mb-4">{{ Str::limit($campaign->description, 100) }}</p>
                                    <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: {{ ($campaign->current_amount / $campaign->target_amount) * 100 }}%"></div>
                                    </div>
                                    <div class="flex justify-between text-sm text-gray-600 mb-4">
                                        <span>Đã quyên góp: {{ number_format($campaign->current_amount) }}đ</span>
                                        <span>Mục tiêu: {{ number_format($campaign->target_amount) }}đ</span>
                                    </div>
                                    <div class="flex justify-between text-sm text-gray-600 mb-4">
                                        <span>Bắt đầu: {{ $campaign->start_date->format('d/m/Y') }}</span>
                                        <span>Kết thúc: {{ $campaign->end_date->format('d/m/Y') }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <a href="{{ route('campaigns.show', $campaign) }}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                            Xem chi tiết
                                        </a>
                                        @if($campaign->status == 'active')
                                            <a href="{{ route('campaigns.donate', $campaign) }}" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                                Quyên góp
                                            </a>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <!-- Pagination -->
                    <div class="mt-6">
                        {{ $campaigns->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 