<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Activity;
use App\Models\News;
use App\Models\Role;
use App\Models\Category;
use App\Models\VirtualWallet;
use App\Models\CreditTransaction;
use App\Models\ActivityRegistration;
use App\Models\Notification;
use App\Models\CampaignClosure;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class SuperAdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            if (!auth()->user() || !auth()->user()->isAdmin()) {
                return response()->json(['message' => 'Super Admin access required'], 403);
            }
            return $next($request);
        });
    }

    // ============ SYSTEM INFO ============
    
    /**
     * Get comprehensive system information
     */
    public function getSystemInfo(): JsonResponse
    {
        try {
            // Database tables information
            $tables = [];
            $tableNames = Schema::getTableListing();
            
            foreach ($tableNames as $tableName) {
                $columns = Schema::getColumnListing($tableName);
                $count = DB::table($tableName)->count();
                
                $tables[] = [
                    'name' => $tableName,
                    'columns' => $columns,
                    'records_count' => $count
                ];
            }
            
            // Models mapping
            $models = [
                'users' => User::class,
                'campaigns' => Campaign::class,
                'donations' => Donation::class,
                'activities' => Activity::class,
                'news' => News::class,
                'roles' => Role::class,
                'categories' => Category::class,
                'virtual_wallets' => VirtualWallet::class,
                'credit_transactions' => CreditTransaction::class,
                'activity_registrations' => ActivityRegistration::class,
                'notifications' => Notification::class,
                'campaign_closures' => CampaignClosure::class,
                'testimonials' => Testimonial::class,
            ];
            
            return response()->json([
                'database_info' => [
                    'total_tables' => count($tables),
                    'tables' => $tables
                ],
                'models' => $models,
                'system_stats' => [
                    'total_users' => User::count(),
                    'total_campaigns' => Campaign::count(),
                    'total_donations' => Donation::count(),
                    'total_amount_raised' => Donation::where('status', 'completed')->sum('amount'),
                    'total_activities' => Activity::count(),
                    'total_news' => News::count(),
                    'admin_users' => User::whereHas('role', function($q) { $q->where('slug', 'admin'); })->count(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Super Admin System Info Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch system info'], 500);
        }
    }

    // ============ GENERIC CRUD OPERATIONS ============
    
    /**
     * Get all records from any table
     */
    public function getAllRecords(Request $request, string $table): JsonResponse
    {
        try {
            if (!Schema::hasTable($table)) {
                return response()->json(['error' => 'Table not found'], 404);
            }
            
            $perPage = $request->get('per_page', 50);
            $search = $request->get('search');
            $sortBy = $request->get('sort_by', 'id');
            $sortOrder = $request->get('sort_order', 'desc');
            
            $query = DB::table($table);
            
            // Search functionality
            if ($search) {
                $columns = Schema::getColumnListing($table);
                $query->where(function($q) use ($columns, $search, $table) {
                    foreach ($columns as $column) {
                        $columnType = Schema::getColumnType($table, $column);
                        if (in_array($columnType, ['string', 'text'])) {
                            $q->orWhere($column, 'like', "%{$search}%");
                        }
                    }
                });
            }
            
            // Sorting
            if (Schema::hasColumn($table, $sortBy)) {
                $query->orderBy($sortBy, $sortOrder);
            }
            
            $data = $query->paginate($perPage);
            
            return response()->json([
                'table' => $table,
                'columns' => Schema::getColumnListing($table),
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error("Super Admin Get Records Error for table {$table}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch records'], 500);
        }
    }
    
    /**
     * Get single record from any table
     */
    public function getRecord(string $table, int $id): JsonResponse
    {
        try {
            if (!Schema::hasTable($table)) {
                return response()->json(['error' => 'Table not found'], 404);
            }
            
            $record = DB::table($table)->find($id);
            
            if (!$record) {
                return response()->json(['error' => 'Record not found'], 404);
            }
            
            return response()->json([
                'table' => $table,
                'columns' => Schema::getColumnListing($table),
                'record' => $record
            ]);
        } catch (\Exception $e) {
            Log::error("Super Admin Get Record Error for table {$table}, id {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch record'], 500);
        }
    }
    
    /**
     * Create new record in any table
     */
    public function createRecord(Request $request, string $table): JsonResponse
    {
        try {
            if (!Schema::hasTable($table)) {
                return response()->json(['error' => 'Table not found'], 404);
            }
            
            $data = $request->all();
            
            // Handle password hashing for users table
            if ($table === 'users' && isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }
            
            // Add timestamps if columns exist
            if (Schema::hasColumn($table, 'created_at')) {
                $data['created_at'] = now();
            }
            if (Schema::hasColumn($table, 'updated_at')) {
                $data['updated_at'] = now();
            }
            
            $id = DB::table($table)->insertGetId($data);
            $record = DB::table($table)->find($id);
            
            return response()->json([
                'message' => 'Record created successfully',
                'table' => $table,
                'record' => $record
            ], 201);
        } catch (\Exception $e) {
            Log::error("Super Admin Create Record Error for table {$table}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to create record: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Update record in any table
     */
    public function updateRecord(Request $request, string $table, int $id): JsonResponse
    {
        try {
            if (!Schema::hasTable($table)) {
                return response()->json(['error' => 'Table not found'], 404);
            }
            
            $exists = DB::table($table)->where('id', $id)->exists();
            if (!$exists) {
                return response()->json(['error' => 'Record not found'], 404);
            }
            
            $data = $request->all();
            
            // Handle password hashing for users table
            if ($table === 'users' && isset($data['password'])) {
                if (empty($data['password'])) {
                    unset($data['password']); // Don't update password if empty
                } else {
                    $data['password'] = Hash::make($data['password']);
                }
            }
            
            // Add updated timestamp if column exists
            if (Schema::hasColumn($table, 'updated_at')) {
                $data['updated_at'] = now();
            }
            
            DB::table($table)->where('id', $id)->update($data);
            $record = DB::table($table)->find($id);
            
            return response()->json([
                'message' => 'Record updated successfully',
                'table' => $table,
                'record' => $record
            ]);
        } catch (\Exception $e) {
            Log::error("Super Admin Update Record Error for table {$table}, id {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to update record: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Delete record from any table
     */
    public function deleteRecord(string $table, int $id): JsonResponse
    {
        try {
            if (!Schema::hasTable($table)) {
                return response()->json(['error' => 'Table not found'], 404);
            }
            
            $exists = DB::table($table)->where('id', $id)->exists();
            if (!$exists) {
                return response()->json(['error' => 'Record not found'], 404);
            }
            
            // Check for soft deletes
            if (Schema::hasColumn($table, 'deleted_at')) {
                DB::table($table)->where('id', $id)->update(['deleted_at' => now()]);
                $message = 'Record soft deleted successfully';
            } else {
                DB::table($table)->where('id', $id)->delete();
                $message = 'Record permanently deleted successfully';
            }
            
            return response()->json(['message' => $message]);
        } catch (\Exception $e) {
            Log::error("Super Admin Delete Record Error for table {$table}, id {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to delete record: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Execute raw SQL query (for advanced operations)
     */
    public function executeQuery(Request $request): JsonResponse
    {
        try {
            $sql = $request->input('sql');
            
            if (empty($sql)) {
                return response()->json(['error' => 'SQL query is required'], 400);
            }
            
            // Basic security check - prevent dangerous operations
            $sql = trim($sql);
            $dangerousKeywords = ['drop', 'truncate', 'delete from', 'alter table'];
            
            foreach ($dangerousKeywords as $keyword) {
                if (stripos($sql, $keyword) !== false) {
                    return response()->json(['error' => 'Dangerous SQL operation detected'], 403);
                }
            }
            
            // Only allow SELECT queries for safety
            if (stripos($sql, 'select') !== 0) {
                return response()->json(['error' => 'Only SELECT queries are allowed'], 403);
            }
            
            $results = DB::select($sql);
            
            return response()->json([
                'query' => $sql,
                'results' => $results,
                'count' => count($results)
            ]);
        } catch (\Exception $e) {
            Log::error("Super Admin Execute Query Error: " . $e->getMessage());
            return response()->json(['error' => 'Query execution failed: ' . $e->getMessage()], 500);
        }
    }
    
    // ============ BULK OPERATIONS ============
    
    /**
     * Bulk update records
     */
    public function bulkUpdate(Request $request, string $table): JsonResponse
    {
        try {
            if (!Schema::hasTable($table)) {
                return response()->json(['error' => 'Table not found'], 404);
            }
            
            $ids = $request->input('ids', []);
            $data = $request->input('data', []);
            
            if (empty($ids) || empty($data)) {
                return response()->json(['error' => 'IDs and data are required'], 400);
            }
            
            // Add updated timestamp if column exists
            if (Schema::hasColumn($table, 'updated_at')) {
                $data['updated_at'] = now();
            }
            
            $affected = DB::table($table)->whereIn('id', $ids)->update($data);
            
            return response()->json([
                'message' => "Bulk updated {$affected} records successfully",
                'affected_rows' => $affected
            ]);
        } catch (\Exception $e) {
            Log::error("Super Admin Bulk Update Error for table {$table}: " . $e->getMessage());
            return response()->json(['error' => 'Bulk update failed: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Bulk delete records
     */
    public function bulkDelete(Request $request, string $table): JsonResponse
    {
        try {
            if (!Schema::hasTable($table)) {
                return response()->json(['error' => 'Table not found'], 404);
            }
            
            $ids = $request->input('ids', []);
            
            if (empty($ids)) {
                return response()->json(['error' => 'IDs are required'], 400);
            }
            
            // Check for soft deletes
            if (Schema::hasColumn($table, 'deleted_at')) {
                $affected = DB::table($table)->whereIn('id', $ids)->update(['deleted_at' => now()]);
                $message = "Bulk soft deleted {$affected} records successfully";
            } else {
                $affected = DB::table($table)->whereIn('id', $ids)->delete();
                $message = "Bulk permanently deleted {$affected} records successfully";
            }
            
            return response()->json([
                'message' => $message,
                'affected_rows' => $affected
            ]);
        } catch (\Exception $e) {
            Log::error("Super Admin Bulk Delete Error for table {$table}: " . $e->getMessage());
            return response()->json(['error' => 'Bulk delete failed: ' . $e->getMessage()], 500);
        }
    }
    
    // ============ ANALYTICS AND REPORTS ============
    
    /**
     * Get comprehensive analytics
     */
    public function getAnalytics(): JsonResponse
    {
        try {
            $analytics = [
                'users' => [
                    'total' => User::count(),
                    'by_role' => User::join('roles', 'users.role_id', '=', 'roles.id')
                        ->select('roles.name', 'roles.slug', DB::raw('count(*) as count'))
                        ->groupBy('roles.id', 'roles.name', 'roles.slug')
                        ->get(),
                    'by_status' => User::select('status', DB::raw('count(*) as count'))
                        ->groupBy('status')
                        ->get(),
                    'monthly_growth' => User::select(
                        DB::raw('YEAR(created_at) as year'),
                        DB::raw('MONTH(created_at) as month'),
                        DB::raw('COUNT(*) as count')
                    )->groupBy('year', 'month')->orderBy('year')->orderBy('month')->get(),
                ],
                'campaigns' => [
                    'total' => Campaign::count(),
                    'by_status' => Campaign::select('status', DB::raw('count(*) as count'))
                        ->groupBy('status')
                        ->get(),
                    'total_raised' => Campaign::sum('current_amount'),
                    'total_target' => Campaign::sum('target_amount'),
                    'avg_success_rate' => Campaign::whereColumn('current_amount', '>=', 'target_amount')->count() / max(1, Campaign::count()) * 100,
                ],
                'donations' => [
                    'total' => Donation::count(),
                    'total_amount' => Donation::where('status', 'completed')->sum('amount'),
                    'by_payment_method' => Donation::select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
                        ->groupBy('payment_method')
                        ->get(),
                    'monthly_trend' => Donation::select(
                        DB::raw('YEAR(created_at) as year'),
                        DB::raw('MONTH(created_at) as month'),
                        DB::raw('COUNT(*) as count'),
                        DB::raw('SUM(amount) as total_amount')
                    )->groupBy('year', 'month')->orderBy('year')->orderBy('month')->get(),
                ],
                'activities' => [
                    'total' => Activity::count(),
                    'by_category' => Activity::select('category', DB::raw('count(*) as count'))
                        ->groupBy('category')
                        ->get(),
                    'by_status' => Activity::select('status', DB::raw('count(*) as count'))
                        ->groupBy('status')
                        ->get(),
                ],
                'virtual_wallets' => [
                    'total_users_with_wallet' => VirtualWallet::count(),
                    'total_balance' => VirtualWallet::sum('balance'),
                    'total_earned' => VirtualWallet::sum('total_earned'),
                    'total_spent' => VirtualWallet::sum('total_spent'),
                ],
            ];
            
            return response()->json($analytics);
        } catch (\Exception $e) {
            Log::error("Super Admin Analytics Error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch analytics'], 500);
        }
    }
    
    // ============ SYSTEM MAINTENANCE ============
    
    /**
     * Clear system cache and logs
     */
    public function clearCache(): JsonResponse
    {
        try {
            // Clear application cache
            \Artisan::call('cache:clear');
            \Artisan::call('config:clear');
            \Artisan::call('route:clear');
            \Artisan::call('view:clear');
            
            return response()->json(['message' => 'System cache cleared successfully']);
        } catch (\Exception $e) {
            Log::error("Super Admin Clear Cache Error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to clear cache'], 500);
        }
    }
    
    /**
     * Get system logs
     */
    public function getSystemLogs(Request $request): JsonResponse
    {
        try {
            $lines = $request->get('lines', 100);
            $logFile = storage_path('logs/laravel.log');
            
            if (!file_exists($logFile)) {
                return response()->json(['logs' => []]);
            }
            
            $logs = [];
            $file = new \SplFileObject($logFile, 'r');
            $file->seek(PHP_INT_MAX);
            $totalLines = $file->key();
            
            $startLine = max(0, $totalLines - $lines);
            $file->seek($startLine);
            
            while (!$file->eof()) {
                $line = $file->current();
                if (!empty(trim($line))) {
                    $logs[] = trim($line);
                }
                $file->next();
            }
            
            return response()->json([
                'logs' => array_reverse($logs),
                'total_lines' => $totalLines,
                'showing_lines' => count($logs)
            ]);
        } catch (\Exception $e) {
            Log::error("Super Admin Get Logs Error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch logs'], 500);
        }
    }
}
