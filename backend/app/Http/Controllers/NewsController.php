<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'featured', 'categories']);
    }

    /**
     * Get paginated news list for API
     */
    public function index(Request $request)
    {
        try {
            $query = News::with('author')
                ->orderBy('published_date', 'desc');

            // For authenticated users requesting their own news
            if ($request->has('author_id') && $request->author_id === 'me' && Auth::check()) {
                $query->where('author_id', Auth::id());
            } else {
                // For public news, only show published
                $query->published();
            }

            // Filter by category
            if ($request->has('category') && $request->category !== 'all') {
                $query->byCategory($request->category);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->search($request->search);
            }

            // Filter by featured
            if ($request->has('featured') && $request->featured === 'true') {
                $query->featured();
            }

            $news = $query->paginate(9);

            // Add image URLs for each news item
            foreach ($news as $item) {
                $item->image_url = $item->getImageUrlAttribute();
                $item->images_url = $item->getImagesUrlAttribute();
                $item->excerpt = $item->getExcerptAttribute();
                $item->read_time = $item->getReadTimeAttribute();
            }

            return response()->json([
                'data' => $news->items(),
                'meta' => [
                    'current_page' => $news->currentPage(),
                    'last_page' => $news->lastPage(),
                    'total' => $news->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get featured news for homepage
     */
    public function featured(Request $request)
    {
        try {
            $limit = $request->get('limit', 3);
            
            $news = News::with('author')
                ->published()
                ->featured()
                ->orderBy('published_date', 'desc')
                ->limit($limit)
                ->get();

            foreach ($news as $item) {
                $item->image_url = $item->getImageUrlAttribute();
                $item->images_url = $item->getImagesUrlAttribute();
                $item->excerpt = $item->getExcerptAttribute();
                $item->read_time = $item->getReadTimeAttribute();
            }

            return response()->json($news);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching featured news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single news article
     */
    public function show($slug)
    {
        try {
            $news = News::with('author')
                ->where('slug', $slug)
                ->where('status', 'published')
                ->firstOrFail();

            // Increment views count
            $news->increment('views_count');

            $news->image_url = $news->getImageUrlAttribute();
            $news->images_url = $news->getImagesUrlAttribute();
            $news->read_time = $news->getReadTimeAttribute();

            // Get related news
            $relatedNews = News::published()
                ->where('category', $news->category)
                ->where('id', '!=', $news->id)
                ->limit(3)
                ->get();

            foreach ($relatedNews as $item) {
                $item->image_url = $item->getImageUrlAttribute();
                $item->excerpt = $item->getExcerptAttribute();
                $item->read_time = $item->getReadTimeAttribute();
            }

            return response()->json([
                'news' => $news,
                'related' => $relatedNews
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'News not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create new news article (for authenticated users)
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Check permission to create news
            if (!$user->canCreateNews()) {
                return response()->json(['message' => 'Unauthorized to create news'], 403);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'summary' => 'required|string',
                'content' => 'required|string',
                'category' => 'required|in:community,event,story,announcement',
                'image' => 'nullable|image|max:2048',
                'is_featured' => 'boolean',
                'status' => 'in:draft,published'
            ]);

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $filename = time() . '_' . Str::slug($validated['title']) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('news', $filename, 'public');
                $validated['image'] = $path;
            }

            $validated['author_id'] = $user->id;
            $validated['author_name'] = $user->name;
            $validated['slug'] = Str::slug($validated['title']);
            $validated['published_date'] = now();
            $validated['status'] = $validated['status'] ?? 'published';

            // Only admins can set featured
            if (!$user->hasRole('admin')) {
                $validated['is_featured'] = false;
            }

            $news = News::create($validated);

            return response()->json([
                'message' => 'News created successfully',
                'news' => $news
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update news article
     */
    public function update(Request $request, News $news)
    {
        try {
            $user = Auth::user();
            
            // Check if user can edit this news
            if ($news->author_id !== $user->id && !$user->hasRole('admin')) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'summary' => 'sometimes|string',
                'content' => 'sometimes|string',
                'category' => 'sometimes|in:community,event,story,announcement',
                'image' => 'nullable|image|max:2048',
                'is_featured' => 'boolean',
                'status' => 'in:draft,published'
            ]);

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image
                if ($news->image) {
                    Storage::disk('public')->delete($news->image);
                }

                $image = $request->file('image');
                $filename = time() . '_' . Str::slug($validated['title'] ?? $news->title) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('news', $filename, 'public');
                $validated['image'] = $path;
            }

            // Only admins can set featured
            if (!$user->hasRole('admin')) {
                unset($validated['is_featured']);
            }

            // Update slug if title changed
            if (isset($validated['title'])) {
                $validated['slug'] = Str::slug($validated['title']);
            }

            $news->update($validated);

            return response()->json([
                'message' => 'News updated successfully',
                'news' => $news
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete news article
     */
    public function destroy(News $news)
    {
        try {
            $user = Auth::user();
            
            // Check if user can delete this news
            if ($news->author_id !== $user->id && !$user->hasRole('admin')) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Delete image
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }

            // Delete additional images
            if ($news->images) {
                foreach ($news->images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }

            $news->delete();

            return response()->json([
                'message' => 'News deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get news categories
     */
    public function categories()
    {
        $categories = [
            ['id' => 'community', 'name' => 'Cộng đồng'],
            ['id' => 'event', 'name' => 'Sự kiện'],
            ['id' => 'story', 'name' => 'Câu chuyện'],
            ['id' => 'announcement', 'name' => 'Thông báo'],
        ];

        return response()->json($categories);
    }

    /**
     * Admin view all news
     */
    public function adminIndex(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user->hasRole('admin')) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $query = News::with('author')->orderBy('created_at', 'desc');

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by category
            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            // Search
            if ($request->has('search') && !empty($request->search)) {
                $query->search($request->search);
            }

            $news = $query->paginate(20);

            return response()->json([
                'data' => $news->items(),
                'meta' => [
                    'current_page' => $news->currentPage(),
                    'last_page' => $news->lastPage(),
                    'total' => $news->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching news',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}