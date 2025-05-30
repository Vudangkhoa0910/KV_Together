<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Chỉnh sửa blog</h2>

                    <form action="{{ route('blogs.update', $blog) }}" method="POST" enctype="multipart/form-data" class="space-y-6">
                        @csrf
                        @method('PUT')

                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700">Tiêu đề</label>
                            <input type="text" name="title" id="title" value="{{ old('title', $blog->title) }}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            @error('title')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label for="content" class="block text-sm font-medium text-gray-700">Nội dung</label>
                            <textarea name="content" id="content" rows="10" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">{{ old('content', $blog->content) }}</textarea>
                            @error('content')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label for="image" class="block text-sm font-medium text-gray-700">Hình ảnh</label>
                            @if($blog->image)
                                <img src="{{ Storage::url($blog->image) }}" class="h-32 w-32 object-cover rounded-lg mb-2">
                            @endif
                            <input type="file" name="image" id="image" accept="image/*" class="mt-1 block w-full">
                            @error('image')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="flex justify-end">
                            <a href="{{ route('blogs.show', $blog) }}" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Hủy</a>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Cập nhật</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>