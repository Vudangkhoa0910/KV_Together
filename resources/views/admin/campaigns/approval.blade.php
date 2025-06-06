<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Chiến dịch chờ phê duyệt</h2>

                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tổ chức</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mục tiêu</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            @foreach($campaigns as $campaign)
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ $campaign->title }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ $campaign->organizer->name }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ number_format($campaign->target_amount) }}đ</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <a href="{{ route('campaigns.show', $campaign) }}" class="text-blue-500 hover:text-blue-700">Xem</a>
                                        <form action="{{ route('admin.campaigns.approve', $campaign) }}" method="POST" class="inline">
                                            @csrf
                                            <button type="submit" class="text-green-500 hover:text-green-700 ml-2">Phê duyệt</button>
                                        </form>
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