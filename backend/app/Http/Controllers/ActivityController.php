<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('organizer')->published();

        // Search
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('location', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by category
        if ($request->category) {
            $query->category($request->category);
        }

        // Filter by organizer for user's own activities
        if ($request->author_id === 'me' && Auth::check()) {
            $query->where('organizer_id', Auth::id());
        } elseif ($request->author_id && $request->author_id !== 'me') {
            $query->where('organizer_id', $request->author_id);
        }

        // Filter by status (for admin/organizer)
        if ($request->status && Auth::check()) {
            $user = Auth::user();
            if ($user->isAdmin() || $user->role->slug === 'fundraiser') {
                $query->where('status', $request->status);
            }
        }

        // Sort
        $sortBy = $request->get('sort', 'event_date');
        $sortOrder = $request->get('order', 'asc');
        
        if ($sortBy === 'event_date') {
            $query->upcoming()->orderBy('event_date', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $activities = $query->paginate($request->get('per_page', 12));

        if ($request->expectsJson()) {
            return response()->json($activities);
        }

        return view('activities.index', compact('activities'));
    }

    public function featured()
    {
        $activities = Activity::with('organizer')
            ->published()
            ->featured()
            ->upcoming()
            ->orderBy('event_date', 'asc')
            ->limit(6)
            ->get();

        return response()->json($activities);
    }

    public function categories()
    {
        $categories = [
            'event' => 'Sự kiện',
            'workshop' => 'Hội thảo',
            'community' => 'Cộng đồng',
            'volunteer' => 'Tình nguyện'
        ];

        return response()->json($categories);
    }

    public function show($slug, Request $request)
    {
        $activity = Activity::with('organizer')->where('slug', $slug)->firstOrFail();

        $this->authorize('view', $activity);

        // Increment views for published activities
        if ($activity->status === 'published' && !$request->user()) {
            $activity->incrementViews();
        }

        if ($request->expectsJson()) {
            return response()->json($activity);
        }

        return view('activities.show', compact('activity'));
    }

    public function create()
    {
        $this->authorize('create', Activity::class);
        return view('activities.create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Activity::class);

        $validated = $request->validate([
            'title' => 'required|max:255',
            'summary' => 'nullable|max:500',
            'description' => 'required',
            'category' => 'required|in:event,workshop,community,volunteer',
            'location' => 'required|max:255',
            'event_date' => 'required|date|after:now',
            'registration_deadline' => 'nullable|date|before:event_date',
            'max_participants' => 'nullable|integer|min:1',
            'registration_fee' => 'nullable|numeric|min:0',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:2048',
            'images.*' => 'nullable|image|max:2048',
        ]);

        // Generate slug
        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $count = 1;
        while (Activity::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }
        $validated['slug'] = $slug;

        // Handle main image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('activities', 'public');
            $validated['image'] = $path;
        }

        // Handle multiple images upload
        if ($request->hasFile('images')) {
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('activities', 'public');
                $imagePaths[] = $path;
            }
            $validated['images'] = $imagePaths;
        }

        $validated['organizer_id'] = Auth::id();
        $validated['organizer_name'] = Auth::user()->name;
        $validated['status'] = 'draft';

        // Only admin and fundraiser can set featured
        if ($request->is_featured && Auth::user()->role->slug !== 'user') {
            $validated['is_featured'] = $request->is_featured;
        }

        $activity = Activity::create($validated);

        if ($request->expectsJson()) {
            return response()->json($activity->load('organizer'), 201);
        }

        return redirect()->route('activities.show', $activity->slug)
            ->with('success', 'Hoạt động đã được tạo thành công.');
    }

    public function edit($slug)
    {
        $activity = Activity::where('slug', $slug)->firstOrFail();
        $this->authorize('update', $activity);
        return view('activities.edit', compact('activity'));
    }

    public function update(Request $request, $slug)
    {
        $activity = Activity::where('slug', $slug)->firstOrFail();
        $this->authorize('update', $activity);

        $validated = $request->validate([
            'title' => 'required|max:255',
            'summary' => 'nullable|max:500',
            'description' => 'required',
            'category' => 'required|in:event,workshop,community,volunteer',
            'location' => 'required|max:255',
            'event_date' => 'required|date',
            'registration_deadline' => 'nullable|date|before:event_date',
            'max_participants' => 'nullable|integer|min:1',
            'registration_fee' => 'nullable|numeric|min:0',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:draft,published,cancelled,completed',
            'image' => 'nullable|image|max:2048',
            'images.*' => 'nullable|image|max:2048',
        ]);

        // Handle main image upload
        if ($request->hasFile('image')) {
            if ($activity->image) {
                Storage::disk('public')->delete($activity->image);
            }
            $path = $request->file('image')->store('activities', 'public');
            $validated['image'] = $path;
        }

        // Handle multiple images upload
        if ($request->hasFile('images')) {
            if ($activity->images) {
                foreach ($activity->images as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('activities', 'public');
                $imagePaths[] = $path;
            }
            $validated['images'] = $imagePaths;
        }

        // Only admin and fundraiser can set featured
        if (isset($request->is_featured)) {
            $this->authorize('setFeatured', $activity);
            $validated['is_featured'] = $request->is_featured;
        }

        // Handle status changes
        if (isset($validated['status'])) {
            if ($validated['status'] === 'published') {
                $this->authorize('publish', $activity);
            }
        }

        $activity->update($validated);

        if ($request->expectsJson()) {
            return response()->json($activity->load('organizer'));
        }

        return redirect()->route('activities.show', $activity->slug)
            ->with('success', 'Hoạt động đã được cập nhật thành công.');
    }

    public function destroy($slug)
    {
        $activity = Activity::where('slug', $slug)->firstOrFail();
        $this->authorize('delete', $activity);

        if ($activity->image) {
            Storage::disk('public')->delete($activity->image);
        }

        if ($activity->images) {
            foreach ($activity->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $activity->delete();

        if (request()->expectsJson()) {
            return response()->json(['message' => 'Hoạt động đã được xóa thành công.']);
        }

        return redirect()->route('activities.index')
            ->with('success', 'Hoạt động đã được xóa thành công.');
    }

    public function adminIndex(Request $request)
    {
        $this->authorize('moderate', Activity::class);

        $query = Activity::with('organizer');

        // Search
        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->category) {
            $query->where('category', $request->category);
        }

        // Filter by organizer
        if ($request->organizer_id) {
            $query->where('organizer_id', $request->organizer_id);
        }

        $activities = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($activities);
    }
}