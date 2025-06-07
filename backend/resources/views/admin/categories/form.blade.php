<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ isset($category) ? 'Chỉnh sửa danh mục' : 'Thêm danh mục' }}</h2>

                    <form action="{{ isset($category) ? route('admin.categories.update', $category) : route('admin.categories.store') }}" method="POST" class="space-y-6">
                        @csrf
                        @if(isset($category))
                            @method('PUT')
                        @endif

                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700">Tên danh mục</label>
                            <input type="text" name="name" id="name" value="{{ old('name', isset($category) ? $category->name : '') }}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            @error('name')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="flex justify-end">
                            <a href="{{ route('admin.categories.index') }}" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Hủy</a>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{{ isset($category) ? 'Cập nhật' : 'Thêm' }}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>