<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Thông báo</h2>

                    <div class="space-y-4">
                        @foreach($notifications as $notification)
                            <div class="bg-white rounded-lg shadow p-4 flex justify-between items-center {{ $notification->read ? 'opacity-50' : '' }}">
                                <div>
                                    <p class="font-medium">{{ $notification->message }}</p>
                                    <p class="text-sm text-gray-500">{{ $notification->created_at->format('d/m/Y H:i') }}</p>
                                </div>
                                @unless($notification->read)
                                    <form action="{{ route('notifications.read', $notification) }}" method="POST">
                                        @csrf
                                        <button type="submit" class="text-blue-500 hover:text-blue-700">Đánh dấu đã đọc</button>
                                    </form>
                                @endunless
                            </div>
                        @endforeach
                    </div>

                    <div class="mt-6">
                        {{ $notifications->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>