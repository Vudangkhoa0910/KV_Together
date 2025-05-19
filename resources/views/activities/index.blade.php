<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">Hoạt động từ thiện</h2>
                        @if(auth()->user() && auth()->user()->is_admin)
                            <a href="{{ route('activities.create') }}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Tạo hoạt động mới
                            </a>
                        @endif
                    </div>

                    <!-- Filters -->
                    <div class="mb-6">
                        <form action="{{ route('activities.index') }}" method="GET" class="flex gap-4">
                            <select name="status" class="rounded-md border-gray-300">
                                <option value="">Tất cả trạng thái</option>
                                <option value="upcoming" {{ request('status') == 'upcoming' ? 'selected' : '' }}>Sắp diễn ra</option>
                                <option value="ongoing" {{ request('status') == 'ongoing' ? 'selected' : '' }}>Đang diễn ra</option>
                                <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Đã kết thúc</option>
                            </select>
                            <button type="submit" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                Lọc
                            </button>
                        </form>
                    </div>

                    <!-- Activities Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        @foreach($activities as $activity)
                            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                                @if($activity->image)
                                    <img src="{{ asset('storage/' . $activity->image) }}" alt="{{ $activity->title }}" class="w-full h-48 object-cover">
                                @endif
                                <div class="p-4">
                                    <h3 class="text-lg font-semibold mb-2">{{ $activity->title }}</h3>
                                    <p class="text-gray-600 mb-4">{{ Str::limit($activity->description, 100) }}</p>
                                    <div class="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p class="text-sm text-gray-600">Ngày diễn ra</p>
                                            <p class="font-semibold">{{ $activity->date->format('d/m/Y') }}</p>
                                        </div>
                                        <div>
                                            <p class="text-sm text-gray-600">Địa điểm</p>
                                            <p class="font-semibold">{{ $activity->location }}</p>
                                        </div>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <p class="text-sm text-gray-600">Số người tham gia</p>
                                            <p class="font-semibold">{{ $activity->participants_count }}</p>
                                        </div>
                                        <div>
                                            <span class="px-2 py-1 text-sm rounded-full
                                                @if($activity->status == 'upcoming') bg-yellow-100 text-yellow-800
                                                @elseif($activity->status == 'ongoing') bg-green-100 text-green-800
                                                @else bg-gray-100 text-gray-800
                                                @endif">
                                                @if($activity->status == 'upcoming') Sắp diễn ra
                                                @elseif($activity->status == 'ongoing') Đang diễn ra
                                                @else Đã kết thúc
                                                @endif
                                            </span>
                                        </div>
                                    </div>
                                    <div class="mt-4">
                                        <a href="{{ route('activities.show', $activity) }}" class="block text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                            Xem chi tiết
                                        </a>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <!-- Pagination -->
                    <div class="mt-6">
                        {{ $activities->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 