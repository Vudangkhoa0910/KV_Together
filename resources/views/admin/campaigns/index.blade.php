<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Quản lý chiến dịch</h2>

                    <div class="mb-6">
                        <a href="{{ route('admin.campaigns.approval') }}" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Chiến dịch chờ phê duyệt</a>
                    </div>

                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tổ chức</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            @foreach($campaigns as $campaign)
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ $campaign->title }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ $campaign->organizer->name }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ number_format($campaign->current_amount) }}đ / {{ number_format($campaign->target_amount) }}đ</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-sm rounded-full
                                            @if($campaign->status == 'active') bg-green-100 text-green-800
                                            @elseif($campaign->status == 'completed') bg-blue-100 text-blue-800
                                            @elseif($campaign->status == 'pending') bg-yellow-100 text-yellow-800
                                            @else bg-red-100 text-red-800
                                            @endif">
                                            {{ $campaign->status }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <a href="{{ route('campaigns.show', $campaign) }}" class="text-blue-500 hover:text-blue-700">Xem</a>
                                        @if($campaign->status == 'pending')
                                            <form action="{{ route('admin.campaigns.approve', $campaign) }}" method="POST" class="inline">
                                                @csrf
                                                <button type="submit" class="text-green-500 hover:text-green-700 ml-2">Phê duyệt</button>
                                            </form>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>

                    <div class="mt-6">
                        {{ $campaigns->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>