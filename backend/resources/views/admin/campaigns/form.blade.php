<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">{{ isset($campaign) ? 'Sửa chiến dịch' : 'Tạo chiến dịch mới' }}</h2>
                    </div>

                    <form action="{{ isset($campaign) ? route('admin.campaigns.update', $campaign) : route('admin.campaigns.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
                        @csrf
                        @if(isset($campaign))
                            @method('PUT')
                        @endif

                        <!-- Title -->
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700">Tên chiến dịch</label>
                            <input type="text" name="title" id="title" value="{{ old('title', $campaign->title ?? '') }}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                            @error('title')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Description -->
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-700">Mô tả</label>
                            <textarea name="description" id="description" rows="4" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">{{ old('description', $campaign->description ?? '') }}</textarea>
                            @error('description')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Target Amount -->
                        <div>
                            <label for="target_amount" class="block text-sm font-medium text-gray-700">Mục tiêu quyên góp (VNĐ)</label>
                            <input type="number" name="target_amount" id="target_amount" value="{{ old('target_amount', $campaign->target_amount ?? '') }}" required min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                            @error('target_amount')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Start Date -->
                        <div>
                            <label for="start_date" class="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                            <input type="date" name="start_date" id="start_date" value="{{ old('start_date', isset($campaign) ? $campaign->start_date->format('Y-m-d') : '') }}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                            @error('start_date')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- End Date -->
                        <div>
                            <label for="end_date" class="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                            <input type="date" name="end_date" id="end_date" value="{{ old('end_date', isset($campaign) ? $campaign->end_date->format('Y-m-d') : '') }}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                            @error('end_date')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Status -->
                        <div>
                            <label for="status" class="block text-sm font-medium text-gray-700">Trạng thái</label>
                            <select name="status" id="status" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                <option value="active" {{ old('status', $campaign->status ?? '') == 'active' ? 'selected' : '' }}>Đang diễn ra</option>
                                <option value="completed" {{ old('status', $campaign->status ?? '') == 'completed' ? 'selected' : '' }}>Hoàn thành</option>
                                <option value="cancelled" {{ old('status', $campaign->status ?? '') == 'cancelled' ? 'selected' : '' }}>Đã hủy</option>
                            </select>
                            @error('status')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Image -->
                        <div>
                            <label for="image" class="block text-sm font-medium text-gray-700">Hình ảnh</label>
                            @if(isset($campaign) && $campaign->image_url)
                                <div class="mt-2">
                                    <img src="{{ $campaign->image_url }}" alt="{{ $campaign->title }}" class="h-32 w-32 object-cover rounded-lg">
                                </div>
                            @endif
                            <input type="file" name="image" id="image" accept="image/*" {{ !isset($campaign) ? 'required' : '' }} class="mt-1 block w-full">
                            @error('image')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Submit Button -->
                        <div class="flex justify-end">
                            <a href="{{ route('admin.campaigns.index') }}" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                                Hủy
                            </a>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                {{ isset($campaign) ? 'Cập nhật' : 'Tạo mới' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 