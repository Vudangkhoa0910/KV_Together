@extends('layouts.app')

@section('content')
<div class="container mx-auto py-12 px-4">
    <div class="flex flex-col lg:flex-row gap-8">
        <!-- Left column - Campaign content -->
        <div class="lg:w-2/3">
            <!-- Image gallery -->
            <div class="mb-8">
                <div class="rounded-xl shadow overflow-hidden">
                    <img src="{{ Storage::url($campaign->image) ?? 'https://source.unsplash.com/600x400/?help' }}" 
                        class="w-full h-[400px] object-cover" alt="{{ $campaign->title }}" />
                </div>
                @if($campaign->images)
                <div class="grid grid-cols-4 gap-4 mt-4">
                    @foreach($campaign->images as $image)
                    <div class="rounded-lg overflow-hidden shadow cursor-pointer hover:opacity-80 transition">
                        <img src="{{ Storage::url($image) }}" class="w-full h-20 object-cover" alt="Gallery image" />
                    </div>
                    @endforeach
                </div>
                @endif
            </div>

            <!-- Campaign info -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h1 class="text-3xl font-bold text-orange-700 mb-4">{{ $campaign->title }}</h1>
                <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <span class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.5-4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 0a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zm-7 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 0a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                        </svg>
                        {{ $campaign->category->name ?? 'Không có danh mục' }}
                    </span>
                </div>

                <div class="mb-6">
                    <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div class="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full" 
                            style="width: {{ min(($campaign->current_amount / $campaign->target_amount) * 100, 100) }}%">
                        </div>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="font-semibold text-gray-600">{{ number_format($campaign->current_amount) }}đ</span>
                        <span class="text-gray-500">Mục tiêu: {{ number_format($campaign->target_amount) }}đ</span>
                    </div>
                </div>

                <p class="text-gray-700 mb-6 leading-relaxed">{{ $campaign->description }}</p>
            <p class="text-sm text-gray-500">Trạng thái: {{ $campaign->status }}</p>

            @auth
                <a href="{{ route('campaigns.donate', $campaign->id) }}" class="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">Quyên góp ngay</a>
                @if(auth()->user()->id === $campaign->organizer_id || auth()->user()->role === 'admin')
                    <a href="{{ route('campaigns.analytics', $campaign->id) }}" class="mt-6 inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg ml-2">Phân tích</a>
                    <a href="{{ route('campaigns.updates', $campaign->id) }}" class="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg ml-2">Cập nhật</a>
                @endif
            @endauth
        </div>
    </div>

    <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Cập nhật chiến dịch</h2>
        @foreach($campaign->updates as $update)
            <div class="bg-white rounded-lg shadow p-6 mb-4">
                <p>{{ $update->content }}</p>
                @if($update->image)
                    <img src="{{ Storage::url($update->image) }}" class="h-32 mt-2 rounded" alt="Update image">
                @endif
                <p class="text-sm text-gray-500 mt-2">{{ $update->created_at->format('d/m/Y H:i') }}</p>
            </div>
        @endforeach
    </div>

    <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Danh sách quyên góp</h2>
        @foreach($campaign->donations as $donation)
            <div class="bg-white rounded-lg shadow p-6 mb-4">
                <p>{{ $donation->is_anonymous ? 'Ẩn danh' : $donation->user->name }} đã quyên góp {{ number_format($donation->amount) }}đ</p>
                <p class="text-sm text-gray-500">{{ $donation->message ?? 'Không có lời nhắn' }}</p>
                <p class="text-sm text-gray-500">{{ $donation->created_at->format('d/m/Y H:i') }}</p>
            </div>
        @endforeach
    </div>
</div>
@endsection