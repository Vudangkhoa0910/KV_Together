<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Carbon\Carbon;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $dataPath = base_path('../data/news');
        $categories = ['community', 'event', 'story'];
        
        // Get some authors (admin and fundraisers)
        $authors = User::whereHas('role', function($q) {
            $q->whereIn('slug', ['admin', 'fundraiser']);
        })->where('status', 'active')->get();

        if ($authors->isEmpty()) {
            $this->command->warn('No authors found. Creating news without author assignment.');
        }

        foreach ($categories as $category) {
            $categoryPath = $dataPath . '/' . $category;
            
            if (!File::isDirectory($categoryPath)) {
                $this->command->warn("Category directory not found: {$categoryPath}");
                continue;
            }

            $projects = File::directories($categoryPath);
            
            foreach ($projects as $projectPath) {
                $contentFile = $projectPath . '/content';
                
                if (!File::exists($contentFile)) {
                    continue;
                }

                $newsData = $this->parseContentFile($contentFile, $category);
                if ($newsData) {
                    // Process images
                    $imagesPath = $projectPath . '/img';
                    $images = [];
                    $mainImage = null;

                    if (File::isDirectory($imagesPath)) {
                        $imageFiles = File::files($imagesPath);
                        foreach ($imageFiles as $imageFile) {
                            $filename = $imageFile->getFilename();
                            $relativePath = 'news/' . $category . '/' . basename($projectPath) . '/' . $filename;
                            
                            // Copy image to storage
                            $storagePath = storage_path('app/public/' . $relativePath);
                            $storageDir = dirname($storagePath);
                            
                            if (!File::exists($storageDir)) {
                                File::makeDirectory($storageDir, 0755, true);
                            }
                            
                            File::copy($imageFile->getRealPath(), $storagePath);
                            
                            $images[] = $relativePath;
                            
                            if (!$mainImage) {
                                $mainImage = $relativePath;
                            }
                        }
                    }

                    // Create news entry
                    $news = News::create([
                        'title' => $newsData['title'],
                        'slug' => Str::slug($newsData['title']),
                        'summary' => $newsData['summary'],
                        'content' => $newsData['content'],
                        'image' => $mainImage,
                        'images' => $images,
                        'author_name' => $newsData['source'] ?? 'KV Together',
                        'author_id' => $authors->isNotEmpty() ? $authors->random()->id : null,
                        'category' => $category,
                        'status' => 'published',
                        'is_featured' => rand(1, 5) === 1, // 20% chance to be featured
                        'source' => $newsData['source'],
                        'published_date' => $newsData['date'],
                        'views_count' => rand(50, 1000),
                    ]);

                    $this->command->info("Created news: " . $news->title);
                }
            }
        }
    }

    private function parseContentFile($contentPath, $category)
    {
        $content = File::get($contentPath);
        $data = [];

        // Parse basic info
        if (preg_match('/- About:\s*(.+)$/m', $content, $matches)) {
            $data['title'] = trim($matches[1]);
        }

        if (preg_match('/- Date:\s*(.+)$/m', $content, $matches)) {
            try {
                $dateStr = trim($matches[1]);
                $data['date'] = Carbon::createFromFormat('d/m/Y', $dateStr);
            } catch (\Exception $e) {
                $data['date'] = Carbon::now()->subDays(rand(1, 365));
            }
        } else {
            $data['date'] = Carbon::now()->subDays(rand(1, 365));
        }

        if (preg_match('/- Source:\s*(.+)$/m', $content, $matches)) {
            $data['source'] = trim($matches[1]);
        }

        // Extract content after "- Content:"
        if (preg_match('/- Content:\s*\n(.*?)(?=\n\n|$)/s', $content, $matches)) {
            $fullContent = trim($matches[1]);
            
            // Remove image markers
            $fullContent = preg_replace('/----\s*img\s*----\s*\n?/', '', $fullContent);
            
            // Create summary from first paragraph
            $paragraphs = explode("\n\n", $fullContent);
            $data['summary'] = trim($paragraphs[0]);
            $data['content'] = $fullContent;
        }

        // Ensure we have required fields
        if (empty($data['title']) || empty($data['content'])) {
            return null;
        }

        return $data;
    }
}
