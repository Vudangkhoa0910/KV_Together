<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Quản lý quyên góp</h2>

                    <div class="mb-6">
                        <form action="{{ route('admin.donations.index') }}" method="GET" class="flex gap-4">
                            <select name="campaign_id" class="rounded-md border-gray-300 shadow-sm">
                                <option value="">Tất cả chiến dịch</option>
                                @foreach($campaigns as $campaign)
                                    <option value="{{ $campaign->id }}" {{ request('campaign_id') == $campaign->id ? 'selected' : '' }}>{{ $campaign->title }}</option>
                                @endforeach
                            </select>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Lọc</button>
                        </form>
                    </div>

                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người quyên góp</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chiến dịch</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            @foreach($donations as $donation)
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ $donation->is_anonymous ? 'Ẩn danh' : $donation->user->name }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ $donation->campaign->title }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ number_format($donation->amount) }}đ</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-sm rounded-full
                                            @if($donation->status == 'completed') bg-green-100 text-green-800
                                            @else bg-yellow-100 text-yellow-800
                                            @endif">
                                            {{ $donation->status }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ $donation->created_at->format('d/m/Y H:i') }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>

                    <div class="mt-6">
                        {{ $donations->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>