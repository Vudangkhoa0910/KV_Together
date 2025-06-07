<x-app-layout>
    <div class="py-12 bg-gray-100">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <!-- Breadcrumb -->
                    <nav class="flex mb-6">
                        <a href="{{ route('campaigns.show', $campaign) }}" class="text-orange-600 hover:text-orange-800 flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                            Quay lại chiến dịch
                        </a>
                    </nav>

                    <!-- Header -->
                    <h2 class="text-2xl font-bold text-gray-900 mb-8">Phân tích chiến dịch: {{ $campaign->title }}</h2>

                    <!-- Overview Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-gradient-to-r from-orange-100 to-yellow-100 border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 class="text-sm font-semibold text-gray-600 uppercase">Tổng số tiền quyên góp</h3>
                            <p class="text-2xl font-bold text-gray-900 mt-2">{{ number_format($campaign->current_amount) }}đ</p>
                            <p class="text-sm text-gray-600 mt-1">/ {{ number_format($campaign->target_amount) }}đ</p>
                        </div>
                        <div class="bg-gradient-to-r from-orange-100 to-yellow-100 border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 class="text-sm font-semibold text-gray-600 uppercase">Tỷ lệ hoàn thành</h3>
                            <p class="text-2xl font-bold text-gray-900 mt-2">{{ number_format(($campaign->current_amount / $campaign->target_amount) * 100, 2) }}%</p>
                            <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div class="bg-gradient-to-r from-orange-400 to-yellow-400 h-2.5 rounded-full" style="width: {{ min(($campaign->current_amount / $campaign->target_amount) * 100, 100) }}%"></div>
                            </div>
                        </div>
                        <div class="bg-gradient-to-r from-orange-100 to-yellow-100 border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 class="text-sm font-semibold text-gray-600 uppercase">Thông tin khác</h3>
                            <p class="text-sm text-gray-600 mt-2">Lượt quyên góp: {{ $campaign->donations->count() }}</p>
                            <p class="text-sm text-gray-600">Ngày còn lại: {{ $campaign->end_date->gte(now()) ? $campaign->end_date->diffInDays(now()) : 'Đã kết thúc' }}</p>
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
                                        @foreach($donationData as $data)
                                            "{{ $data->date }}",
                                        @endforeach
                                    ],
                                    "datasets": [{
                                        "label": "Số tiền quyên góp (VNĐ)",
                                        "data": [
                                            @foreach($donationData as $data)
                                                {{ $data->total }},
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
                        <!-- Top Donors Chart -->
                        <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Nhà tài trợ tích cực</h3>
                            <canvas id="topDonorsChart" class="w-full"></canvas>
                            ```chartjs
                            {
                                "type": "bar",
                                "data": {
                                    "labels": [
                                        @foreach($campaign->donations->groupBy('user_id')->map(function($group) { return $group->first()->is_anonymous ? 'Ẩn danh' : $group->first()->user->name; })->take(5) as $name)
                                            "{{ $name }}",
                                        @endforeach
                                    ],
                                    "datasets": [{
                                        "label": "Số tiền quyên góp (VNĐ)",
                                        "data": [
                                            @foreach($campaign->donations->groupBy('user_id')->map->sum('amount')->take(5) as $total)
                                                {{ $total }},
                                            @endforeach
                                        ],
                                        "backgroundColor": "#f59e0b",
                                        "borderColor": "#d97706",
                                        "borderWidth": 1
                                    }]
                                },
                                "options": {
                                    "responsive": true,
                                    "plugins": {
                                        "legend": {
                                            "display": false
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
                                                "text": "Nhà tài trợ"
                                            }
                                        }
                                    }
                                }
                            }
                            ```
                        </div>
                    </div>

                    <!-- Donations Table -->
                    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Danh sách quyên góp</h3>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người quyên góp</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lời nhắn</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    @forelse($donations as $donation)
                                        <tr>
                                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ $donation->is_anonymous ? 'Ẩn danh' : $donation->user->name }}</td>
                                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ number_format($donation->amount) }}đ</td>
                                            <td class="px-4 py-3 text-sm text-gray-600">{{ $donation->message ?? 'Không có' }}</td>
                                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ $donation->created_at->format('d/m/Y H:i') }}</td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="4" class="px-4 py-3 text-center text-sm text-gray-500">Chưa có quyên góp nào.</td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-6">
                            {{ $donations->links() }}
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
                labels: @json($donationData->pluck('date')),
                datasets: [{
                    label: 'Số tiền quyên góp (VNĐ)',
                    data: @json($donationData->pluck('total')),
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

        // Top Donors Chart
        const topDonorsCtx = document.getElementById('topDonorsChart').getContext('2d');
        new Chart(topDonorsCtx, {
            type: 'bar',
            data: {
                labels: @json($campaign->donations->groupBy('user_id')->map(function($group) { return $group->first()->is_anonymous ? 'Ẩn danh' : $group->first()->user->name; })->take(5)),
                datasets: [{
                    label: 'Số tiền quyên góp (VNĐ)',
                    data: @json($campaign->donations->groupBy('user_id')->map->sum('amount')->take(5)),
                    backgroundColor: '#f59e0b',
                    borderColor: '#d97706',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
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
                            text: 'Nhà tài trợ'
                        }
                    }
                }
            }
        });
    </script>
</x-app-layout>