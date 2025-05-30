@extends('layouts.app')

@section('content')
<div class="container mx-auto py-12 px-4">
    <div class="grid md:grid-cols-2 gap-10">
        <div>
            <img src="{{ Storage::url($campaign->image) ?? 'https://source.unsplash.com/600x400/?help' }}" class="rounded-xl shadow" />
        </div>
        <div>
            <h1 class="text-3xl font-bold text-orange-700 mb-4">{{ $campaign->title }}</h1>
            <p class="text-gray-700 mb-4">{{ $campaign->description }}</p>
            <p class="text-sm text-gray-500">Danh mục: {{ $campaign->category->name ?? 'Không có' }}</p>
            <p class="text-sm text-gray-500">Số tiền đã quyên góp: {{ number_format($campaign->current_amount) }}đ / {{ number_format($campaign->target_amount) }}đ</p>
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