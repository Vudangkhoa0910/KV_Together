<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 bg-white border-b border-gray-200">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Upcoming Activities</h2>
                        @can('create', App\Models\Activity::class)
                            <a href="{{ route('activities.create') }}" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150">
                                Create Activity
                            </a>
                        @endcan
                    </div>

                    @if(session('success'))
                        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span class="block sm:inline">{{ session('success') }}</span>
                        </div>
                    @endif

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        @foreach($activities as $activity)
                            <div class="bg-white overflow-hidden shadow-sm rounded-lg">
                                <div class="relative pb-48">
                                    <img class="absolute h-full w-full object-cover" src="{{ Storage::url($activity->image) }}" alt="{{ $activity->title }}">
                                </div>
                                <div class="p-6">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <span class="inline-flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </span>
                                        </div>
                                        <div class="ml-4">
                                            <h3 class="text-lg font-medium text-gray-900">{{ $activity->title }}</h3>
                                            <p class="text-sm text-gray-500">{{ $activity->date->format('M d, Y') }}</p>
                                        </div>
                                    </div>
                                    <div class="mt-4">
                                        <p class="text-sm text-gray-500">{{ Str::limit($activity->description, 150) }}</p>
                                    </div>
                                    <div class="mt-4">
                                        <div class="flex items-center text-sm text-gray-500">
                                            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{{ $activity->location }}</span>
                                        </div>
                                    </div>
                                    <div class="mt-6">
                                        <a href="{{ route('activities.show', $activity) }}" class="text-indigo-600 hover:text-indigo-900">
                                            View Details <span aria-hidden="true">&rarr;</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <div class="mt-6">
                        {{ $activities->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 