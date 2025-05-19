<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">Tin tức & Cập nhật</h2>
                        @if(auth()->user() && auth()->user()->is_admin)
                            <a href="{{ route('news.create') }}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Đăng tin mới
                            </a>
                        @endif
                    </div>

                    <!-- News Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        @foreach($news as $item)
                            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                                @if($item->image)
                                    <img src="{{ asset('storage/' . $item->image) }}" alt="{{ $item->title }}" class="w-full h-48 object-cover">
                                @endif
                                <div class="p-4">
                                    <h3 class="text-lg font-semibold mb-2">{{ $item->title }}</h3>
                                    <p class="text-gray-600 mb-4">{{ Str::limit($item->content, 100) }}</p>
                                    <div class="flex justify-between text-sm text-gray-500 mb-4">
                                        <span>Tác giả: {{ $item->author }}</span>
                                        <span>{{ $item->created_at->format('d/m/Y') }}</span>
                                    </div>
                                    <a href="{{ route('news.show', $item) }}" class="block text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                        Đọc thêm
                                    </a>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <!-- Pagination -->
                    <div class="mt-6">
                        {{ $news->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 