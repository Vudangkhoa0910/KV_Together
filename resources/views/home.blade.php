@extends('layouts.app')

@section('content')
    <div class="bg-cover bg-center h-96" style="background-image: url('https://source.unsplash.com/random/1200x400/?charity')">
        <div class="flex items-center justify-center h-full bg-black bg-opacity-50">
            <div class="text-center text-white">
                <h1 class="text-4xl font-bold mb-4">Join the Cause with {{ config('app.name') }}</h1>
                <p class="text-lg mb-6">Support meaningful campaigns and make a difference today.</p>
                <a href="{{ route('campaigns.index') }}" class="btn-primary px-6 py-3 rounded-full text-lg">Explore Campaigns</a>
            </div>
        </div>
    </div>

    <section class="py-12">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Featured Campaigns</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @foreach ($campaigns as $campaign)
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src="{{ $campaign->image ?? 'https://source.unsplash.com/random/400x300/?cause' }}" alt="{{ $campaign->title }}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800">{{ $campaign->title }}</h3>
                        <p class="text-gray-600 mt-2">{{ Str::limit($campaign->description, 100) }}</p>
                        <div class="mt-4">
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-green-600 h-2.5 rounded-full" style="width: {{ ($campaign->raised / $campaign->goal) * 100 }}%"></div>
                            </div>
                            <p class="text-sm text-gray-600 mt-2">Raised: ${{ $campaign->raised }} of ${{ $campaign->goal }}</p>
                        </div>
                        <a href="{{ route('campaigns.show', $campaign) }}" class="btn-primary mt-4 inline-block px-4 py-2 rounded">Support Now</a>
                    </div>
                </div>
            @endforeach
        </div>
    </section>
@endsection