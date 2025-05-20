<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $activities = Activity::latest()->paginate(9);
        return view('activities.index', compact('activities'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Activity::class);
        return view('activities.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Activity::class);

        $validated = $request->validate([
            'title' => 'required|max:255',
            'description' => 'required',
            'date' => 'required|date',
            'location' => 'required|max:255',
            'image' => 'required|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('activities', 'public');
            $validated['image'] = $path;
        }

        $validated['user_id'] = auth()->id();

        Activity::create($validated);

        return redirect()->route('activities.index')
            ->with('success', 'Activity created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Activity $activity)
    {
        return view('activities.show', compact('activity'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Activity $activity)
    {
        $this->authorize('update', $activity);
        return view('activities.edit', compact('activity'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Activity $activity)
    {
        $this->authorize('update', $activity);

        $validated = $request->validate([
            'title' => 'required|max:255',
            'description' => 'required',
            'date' => 'required|date',
            'location' => 'required|max:255',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($activity->image) {
                Storage::disk('public')->delete($activity->image);
            }
            $path = $request->file('image')->store('activities', 'public');
            $validated['image'] = $path;
        }

        $activity->update($validated);

        return redirect()->route('activities.show', $activity)
            ->with('success', 'Activity updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Activity $activity)
    {
        $this->authorize('delete', $activity);

        if ($activity->image) {
            Storage::disk('public')->delete($activity->image);
        }

        $activity->delete();

        return redirect()->route('activities.index')
            ->with('success', 'Activity deleted successfully.');
    }

    public function adminIndex()
    {
        $this->authorize('viewAny', Activity::class);

        $activities = Activity::with('user')
            ->latest()
            ->paginate(20);

        return view('admin.activities.index', compact('activities'));
    }
}
