<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="mb-6">
                        <a href="{{ route('campaigns.show', $campaign) }}" class="text-blue-500 hover:text-blue-700">← Quay lại chiến dịch</a>
                    </div>

                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Cập nhật chiến dịch: {{ $campaign->title }}</h2>

                    <form action="{{ route('campaigns.updates.store', $campaign) }}" method="POST" enctype="multipart/form-data" class="space-y-6 mb-12">
                        @csrf
                        <div>
                            <label for="content" class="block text-sm font-medium text-gray-700">Nội dung cập nhật</label>
                            <textarea name="content" id="content" rows="4" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                            @error('content')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                        <div>
                            <label for="image" class="block text-sm font-medium text-gray-700">Hình ảnh (không bắt buộc)</label>
                            <input type="file" name="image" id="image" accept="image/*" class="mt-1 block w-full">
                            @error('image')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                        <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Thêm cập nhật</button>
                    </form>

                    <h3 class="text-xl font-semibold mb-4">Danh sách cập nhật</h3>
                    @foreach($updates as $update)
                        <div class="bg-white rounded-lg shadow p-6 mb-4">
                            <p>{{ $update->content }}</p>
                            @if($update->image)
                                <img src="{{ Storage::url($update->image) }}" class="h-32 mt-2 rounded" alt="Update image">
                            @endif
                            <p class="text-sm text-gray-500 mt-2">{{ $update->created_at->format('d/m/Y H:i') }}</p>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</x-app-layout>