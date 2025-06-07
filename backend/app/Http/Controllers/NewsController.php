<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    public function index()
    {
        $news = News::latest()->paginate(9);
        return view('news.index', compact('news'));
    }

    public function create()
    {
        $this->authorize('create', News::class);
        return view('news.create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', News::class);

        $validated = $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'image' => 'required|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('news', 'public');
            $validated['image'] = $path;
        }

        $validated['author_id'] = auth()->id();
        $validated['status'] = 'published';

        News::create($validated);

        return redirect()->route('news.index')
            ->with('success', 'News article created successfully.');
    }

    public function show(News $news)
    {
        return view('news.show', compact('news'));
    }

    public function edit(News $news)
    {
        $this->authorize('update', $news);
        return view('news.edit', compact('news'));
    }

    public function update(Request $request, News $news)
    {
        $this->authorize('update', $news);

        $validated = $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }
            $path = $request->file('image')->store('news', 'public');
            $validated['image'] = $path;
        }

        $news->update($validated);

        return redirect()->route('news.show', $news)
            ->with('success', 'News article updated successfully.');
    }

    public function destroy(News $news)
    {
        $this->authorize('delete', $news);

        if ($news->image) {
            Storage::disk('public')->delete($news->image);
        }

        $news->delete();

        return redirect()->route('news.index')
            ->with('success', 'News article deleted successfully.');
    }

    public function adminIndex()
    {
        $this->authorize('viewAny', News::class);
        $news = News::with('author')->latest()->paginate(20);
        return view('admin.news.index', compact('news'));
    }
}