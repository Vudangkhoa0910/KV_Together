<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 bg-white border-b border-gray-200">
                    @if(session('success'))
                        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span class="block sm:inline">{{ session('success') }}</span>
                        </div>
                    @endif

                    <div class="mb-6">
                        <a href="{{ route('news.index') }}" class="text-indigo-600 hover:text-indigo-900">
                            &larr; Back to News
                        </a>
                    </div>

                    <article>
                        <div class="relative pb-96 mb-8">
                            <img class="absolute h-full w-full object-cover rounded-lg" src="{{ Storage::url($news->image) }}" alt="{{ $news->title }}">
                        </div>

                        <header class="mb-8">
                            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ $news->title }}</h1>
                            <div class="flex items-center text-gray-500">
                                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{{ $news->created_at->format('M d, Y') }}</span>
                                <span class="mx-2">•</span>
                                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{{ $news->user->name }}</span>
                            </div>
                        </header>

                        <div class="prose max-w-none">
                            {!! nl2br(e($news->content)) !!}
                        </div>

                        @can('update', $news)
                            <div class="mt-8 flex space-x-4">
                                <a href="{{ route('news.edit', $news) }}" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150">
                                    Edit Article
                                </a>

                                <form action="{{ route('news.destroy', $news) }}" method="POST" class="inline">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150" onclick="return confirm('Are you sure you want to delete this article?')">
                                        Delete Article
                                    </button>
                                </form>
                            </div>
                        @endcan
                    </article>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 