<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Blog</h2>
                        @auth
                            <a href="{{ route('blogs.create') }}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Viết blog mới</a>
                        @endauth
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        @foreach($blogs as $blog)
                            <div class="bg-white rounded-lg shadow">
                                <img src="{{ Storage::url($blog->image) ?? 'https://source.unsplash.com/400x200/?blog' }}" class="w-full h-48 object-cover rounded-t-lg">
                                <div class="p-6">
                                    <h3 class="text-lg font-semibold">{{ $blog->title }}</h3>
                                    <p class="text-sm text-gray-600">{{ Str::limit($blog->content, 100) }}</p>
                                    <p class="text-sm text-gray-500 mt-2">Đăng bởi {{ $blog->user->name }} vào {{ $blog->published_at->format('d/m/Y') }}</p>
                                    <a href="{{ route('blogs.show', $blog) }}" class="text-blue-500 mt-4 inline-block">Đọc thêm →</a>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <div class="mt-6">
                        {{ $blogs->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>