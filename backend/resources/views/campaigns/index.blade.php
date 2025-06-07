@extends('layouts.app')

@section('content')
<div class="container mx-auto py-12 px-4">
    <h2 class="text-3xl font-bold mb-8 text-center text-orange-700">Tất cả chiến dịch</h2>

    <div class="mb-6">
        <form action="{{ route('campaigns.index') }}" method="GET" class="flex gap-4">
            <select name="category_id" class="rounded-md border-gray-300 shadow-sm">
                <option value="">Tất cả danh mục</option>
                @foreach($categories as $category)
                    <option value="{{ $category->id }}" {{ request('category_id') == $category->id ? 'selected' : '' }}>{{ $category->name }}</option>
                @endforeach
            </select>
            <button type="submit" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">Lọc</button>
        </form>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @foreach($campaigns as $campaign)
            <div class="bg-white rounded-xl shadow hover:shadow-lg transition">
                <img src="{{ Storage::url($campaign->image) ?? 'https://source.unsplash.com/400x200/?donate' }}" class="w-full h-48 object-cover rounded-t-xl" />
                <div class="p-4">
                    <h3 class="font-semibold text-lg text-orange-700">{{ $campaign->title }}</h3>
                    <p class="text-sm text-gray-600">{{ Str::limit($campaign->description, 100) }}</p>
                    <p class="text-sm text-gray-500 mt-2">{{ $campaign->category->name ?? 'Không có danh mục' }}</p>
                    <a href="{{ route('campaigns.show', $campaign->id) }}" class="text-orange-500 mt-3 inline-block">Xem chi tiết →</a>
                </div>
            </div>
        @endforeach
    </div>

    <div class="mt-6">
        {{ $campaigns->links() }}
    </div>
</div>
@endsection