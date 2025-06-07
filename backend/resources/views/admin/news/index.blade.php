<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Quản lý tin tức</h2>

                    <div class="mb-6">
                        <a href="{{ route('news.create') }}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Thêm tin tức</a>
                    </div>

                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            @foreach($news as $item)
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ $item->title }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ $item->author->name }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ $item->created_at->format('d/m/Y') }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <a href="{{ route('news.show', $item) }}" class="text-blue-500 hover:text-blue-700">Xem</a>
                                        <a href="{{ route('news.edit', $item) }}" class="text-yellow-500 hover:text-yellow-700 ml-2">Chỉnh sửa</a>
                                        <form action="{{ route('news.destroy', $item) }}" method="POST" class="inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-red-500 hover:text-red-700 ml-2" onclick="return confirm('Bạn có chắc chắn muốn xóa tin tức này?')">Xóa</button>
                                        </form>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>

                    <div class="mt-6">
                        {{ $news->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>