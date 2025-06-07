<x-app-layout>
    <div class="py-12 bg-gray-100">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <!-- Header -->
                    <h2 class="text-2xl font-bold text-gray-900 mb-8">Bảng điều khiển quản trị</h2>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="bg-gradient-to-r from-orange-100 to-yellow-100 border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 class="text-sm font-semibold text-gray-600 uppercase">Tổng chiến dịch</h3>
                            <p class="text-2xl font-bold text-gray-900 mt-2">{{ $totalCampaigns }}</p>
                            <p class="text-sm text-gray-600 mt-1">Chờ phê duyệt: {{ \App\Models\Campaign::where('status', 'pending')->count() }}</p>
                        </div>
                        <div class="bg-gradient-to-r from-orange-100 to-yellow-100 border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 class="text-sm font-semibold text-gray-600 uppercase">Tổng quyên góp</h3>
                            <p class="text-2xl font-bold text-gray-900 mt-2">{{ number_format($totalDonations) }}đ</p>
                            <p class="text-sm text-gray-600 mt-1">Số lượt: {{ \App\Models\Donation::count() }}</p>
                        </div>
                        <div class="bg-gradient-to-r from-orange-100 to-yellow-100 border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 class="text-sm font-semibold text-gray-600 uppercase">Tổng hoạt động</h3>
                            <p class="text-2xl font-bold text-gray-900 mt-2">{{ $totalActivities }}</p>
                            <p class="text-sm text-gray-600 mt-1">Sắp diễn ra: {{ \App\Models\Activity::where('status', 'upcoming')->count() }}</p>
                        </div>
                        <div class="bg-gradient-to-r from-orange-100 to-yellow-100 border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 class="text-sm font-semibold text-gray-600 uppercase">Tổng tin tức</h3>
                            <p class="text-2xl font-bold text-gray-900 mt-2">{{ $totalNews }}</p>
                            <p class="text-sm text-gray-600 mt-1">Đã đăng: {{ \App\Models\News::where('status', 'published')->count() }}</p>
                        </div>
                    </div>

                    <!-- Charts -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <!-- Donation Trend Chart -->
                        <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Xu hướng quyên góp</h3>
                            <canvas id="donationTrendChart" class="w-full"></canvas>
                            ```chartjs
                            {
                                "type": "line",
                                "data": {
                                    "labels": [
                                        @foreach($recentDonations->groupBy(fn($donation) => $donation->created_at->format('Y-m-d'))->keys()->take(7) as $date)
                                            "{{ $date }}",
                                        @endforeach
                                    ],
                                    "datasets": [{
                                        "label": "Số tiền quyên góp (VNĐ)",
                                        "data": [
                                            @foreach($recentDonations->groupBy(fn($donation) => $donation->created_at->format('Y-m-d'))->map->sum('amount')->take(7) as $total)
                                                {{ $total }},
                                            @endforeach
                                        ],
                                        "borderColor": "#f97316",
                                        "backgroundColor": "rgba(249, 115, 22, 0.1)",
                                        "fill": true,
                                        "tension": 0.4
                                    }]
                                },
                                "options": {
                                    "responsive": true,
                                    "plugins": {
                                        "legend": {
                                            "display": true,
                                            "position": "top"
                                        }
                                    },
                                    "scales": {
                                        "y": {
                                            "beginAtZero": true,
                                            "title": {
                                                "display": true,
                                                "text": "Số tiền (VNĐ)"
                                            }
                                        },
                                        "x": {
                                            "title": {
                                                "display": true,
                                                "text": "Ngày"
                                            }
                                        }
                                    }
                                }
                            }
                            ```
                        </div>
                        <!-- Campaign Status Chart -->
                        <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Trạng thái chiến dịch</h3>
                            <canvas id="campaignStatusChart" class="w-full"></canvas>
                            ```chartjs
                            {
                                "type": "doughnut",
                                "data": {
                                    "labels": ["Đang hoạt động", "Hoàn thành", "Chờ phê duyệt", "Bị từ chối"],
                                    "datasets": [{
                                        "data": [
                                            {{ \App\Models\Campaign::where('status', 'active')->count() }},
                                            {{ \App\Models\Campaign::where('status', 'completed')->count() }},
                                            {{ \App\Models\Campaign::where('status', 'pending')->count() }},
                                            {{ \App\Models\Campaign::where('status', 'rejected')->count() }}
                                        ],
                                        "backgroundColor": [
                                            "#f97316",
                                            "#f59e0b",
                                            "#ef4444",
                                            "#6b7280"
                                        ],
                                        "borderColor": "#ffffff",
                                        "borderWidth": 2
                                    }]
                                },
                                "options": {
                                    "responsive": true,
                                    "plugins": {
                                        "legend": {
                                            "position": "top"
                                        }
                                    }
                                }
                            }
                            ```
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Recent Campaigns -->
                        <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold text-gray-900">Chiến dịch gần đây</h3>
                                <a href="{{ route('admin.campaigns.index') }}" class="text-orange-600 hover:text-orange-800 text-sm">Xem tất cả</a>
                            </div>
                            <div class="space-y-4">
                                @forelse($recentCampaigns as $campaign)
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">{{ Str::limit($campaign->title, 30) }}</p>
                                            <p class="text-xs text-gray-600">{{ number_format($campaign->current_amount) }}đ / {{ number_format($campaign->target_amount) }}đ</p>
                                        </div>
                                        <span class="px-2 py-1 text-xs font-medium rounded-full
                                            @if($campaign->status == 'active') bg-orange-100 text-orange-800
                                            @elseif($campaign->status == 'completed') bg-yellow-100 text-yellow-800
                                            @elseif($campaign->status == 'pending') bg-red-100 text-red-800
                                            @else bg-gray-100 text-gray-800
                                            @endif">
                                            {{ Str::title($campaign->status) }}
                                        </span>
                                    </div>
                                @empty
                                    <p class="text-sm text-gray-600">Chưa có chiến dịch nào.</p>
                                @endforelse
                            </div>
                        </div>

                        <!-- Recent Donations -->
                        <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold text-gray-900">Quyên góp gần đây</h3>
                                <a href="{{ route('admin.donations.index') }}" class="text-orange-600 hover:text-orange-800 text-sm">Xem tất cả</a>
                            </div>
                            <div class="space-y-4">
                                @forelse($recentDonations as $donation)
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">{{ $donation->is_anonymous ? 'Ẩn danh' : $donation->user->name }}</p>
                                            <p class="text-xs text-gray-600">{{ Str::limit($donation->campaign->title, 20) }}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-sm font-medium text-gray-900">{{ number_format($donation->amount) }}đ</p>
                                            <p class="text-xs text-gray-600">{{ $donation->created_at->format('d/m/Y') }}</p>
                                        </div>
                                    </div>
                                @empty
                                    <p class="text-sm text-gray-600">Chưa có quyên góp nào.</p>
                                @endforelse
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
        // Donation Trend Chart
        const donationTrendCtx = document.getElementById('donationTrendChart').getContext('2d');
        new Chart(donationTrendCtx, {
            type: 'line',
            data: {
                labels: @json($recentDonations->groupBy(fn($donation) => $donation->created_at->format('Y-m-d'))->keys()->take(7)),
                datasets: [{
                    label: 'Số tiền quyên góp (VNĐ)',
                    data: @json($recentDonations->groupBy(fn($donation) => $donation->created_at->format('Y-m-d'))->map->sum('amount')->take(7)),
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số tiền (VNĐ)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Ngày'
                        }
                    }
                }
            }
        });

        // Campaign Status Chart
        const campaignStatusCtx = document.getElementById('campaignStatusChart').getContext('2d');
        new Chart(campaignStatusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Đang hoạt động', 'Hoàn thành', 'Chờ phê duyệt', 'Bị từ chối'],
                datasets: [{
                    data: [
                        {{ \App\Models\Campaign::where('status', 'active')->count() }},
                        {{ \App\Models\Campaign::where('status', 'completed')->count() }},
                        {{ \App\Models\Campaign::where('status', 'pending')->count() }},
                        {{ \App\Models\Campaign::where('status', 'rejected')->count() }}
                    ],
                    backgroundColor: [
                        '#f97316',
                        '#f59e0b',
                        '#ef4444',
                        '#6b7280'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    </script>
</x-app-layout>