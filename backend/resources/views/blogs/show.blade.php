<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="mb-6">
                        <a href="{{ route('blogs.index') }}" class="text-blue-500 hover:text-blue-700">← Quay lại danh sách blog</a>
                    </div>

                    <img src="{{ Storage::url($blog->image) ?? 'https://source.unsplash.com/600x400/?blog' }}" class="w-full h-96 object-cover rounded-lg mb-6">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ $blog->title }}</h1>
                    <p class="text-sm text-gray-500 mb-4">Đăng bởi {{ $blog->user->name }} vào {{ $blog->published_at->format('d/m/Y H:i') }}</p>
                    <div class="prose max-w-none">
                        {!! nl2br(e($blog->content)) !!}
                    </div>

                    @can('update', $blog)
                        <div class="flex justify-end mt-6">
                            <a href="{{ route('blogs.edit', $blog) }}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">Chỉnh sửa</a>
                            <form action="{{ route('blogs.destroy', $blog) }}" method="POST" class="inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onclick="return confirm('Bạn có chắc chắn muốn xóa blog này?')">Xóa</button>
                            </form>
                        </div>
                    @endcan
                </div>
            </div>
        </div>
    </div>
</x-app-layout>