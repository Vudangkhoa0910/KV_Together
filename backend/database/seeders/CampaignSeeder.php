<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CampaignSeeder extends Seeder
{
    private function parseContentFile($contentPath)
    {
        if (!File::exists($contentPath)) {
            return null;
        }

        $content = File::get($contentPath);
        $data = [];

        // Parse organization info first
        $orgPatterns = [
            'org_name' => '/^- Name:\s*(.+)$/m',
            'org_description' => '/^- Describe:\s*"([^"]+)"$/m',
            'org_website' => '/^- website:\s*(.+)$/m',
            'org_address' => '/^- Address:\s*(.+)$/m',
            'org_hotline' => '/^- Hotline:\s*(.+)$/m',
            'org_contact' => '/^- contact:\s*(.+)$/m',
        ];

        foreach ($orgPatterns as $key => $pattern) {
            if (preg_match($pattern, $content, $matches)) {
                $data[$key] = trim($matches[1]);
            }
        }

        // Parse project info
        $patterns = [
            'name' => '/^- name:\s*(.+)$/m',
            'target' => '/^- target:\s*([\d,\.]+)(?:đ|VND)?$/mi',
            'start_date' => '/^- start date:\s*(\d{2}\/\d{2}\/\d{4})/m',
            'end_date' => '/^- end date:\s*(\d{2}\/\d{2}\/\d{4})/m',
            'topic' => '/^- topic:\s*(.+)$/m',
        ];

        foreach ($patterns as $key => $pattern) {
            if (preg_match($pattern, $content, $matches)) {
                if ($key === 'target') {
                    // Convert target amount from string (e.g., "30.000.000đ") to integer
                    $targetAmount = str_replace(['.', ','], '', $matches[1]);
                    $data['target_amount'] = intval($targetAmount);
                } elseif (in_array($key, ['start_date', 'end_date'])) {
                    $data[$key] = Carbon::createFromFormat('d/m/Y', $matches[1]);
                } else {
                    $data[$key] = trim($matches[1]);
                }
            }
        }

        // Get the full content after "- content:" including proper Markdown formatting
        if (preg_match('/^- content:\s*\n\n([\s\S]+?)(?=\n\*|$)/m', $content, $contentMatches)) {
            $data['content'] = trim($contentMatches[1]);
            
            // If no description from organization info, use first paragraph
            if (!isset($data['org_description'])) {
                $paragraphs = explode("\n\n", $data['content']);
                $data['description'] = trim($paragraphs[0]);
            } else {
                $data['description'] = $data['org_description'];
            }
        }
        
        // Look for images in content marked with ------ img1 ----- etc
        preg_match_all('/^-{5,}\s*img(\d+)\s*-{5,}\s*\n(.*?)(?=\n\n|$)/ms', $content, $imgMatches, PREG_SET_ORDER);
        if (!empty($imgMatches)) {
            $data['image_captions'] = [];
            foreach ($imgMatches as $match) {
                $data['image_captions'][$match[1]] = trim($match[2]);
            }
        }

        return $data;
    }

    public function run(): void
    {
        $dataPath = base_path('../data');
        $categories = [
            'children' => ['Trẻ em'],
            'community' => ['Cộng đồng'],
            'disaster' => ['Khẩn cấp'],
            'education' => ['Giáo dục'],
            'elderly' => ['Người cao tuổi'],
            'enviroment' => ['Môi trường'],
            'medical' => ['Y tế'],
        ];

        // Get fundraiser users
        $fundraisers = User::whereHas('role', function($q) {
            $q->where('slug', 'fundraiser');
        })->where('status', 'active')->get();

        if ($fundraisers->isEmpty()) {
            $this->command->error('No active fundraisers found. Please run UserSeeder first.');
            return;
        }

        foreach ($categories as $folder => $categoryNames) {
            $folderPath = $dataPath . '/' . $folder;
            
            if (!File::isDirectory($folderPath)) {
                $this->command->warn("Directory not found: {$folderPath}");
                continue;
            }

            // Get category IDs
            $categoryIds = Category::whereIn('name', $categoryNames)->pluck('id')->toArray();
            if (empty($categoryIds)) {
                $this->command->warn("No categories found for: " . implode(', ', $categoryNames));
                continue;
            }

            // Get project directories
            $projectDirs = File::directories($folderPath);
            foreach ($projectDirs as $projectPath) {
                // Parse content file
                $contentData = $this->parseContentFile($projectPath . '/content');
                if (!$contentData) {
                    $this->command->warn("No content file found in: {$projectPath}");
                    continue;
                }

                // Get all images from the project's images folder
                $imageFiles = collect();
                $possibleImagePaths = [
                    $projectPath . '/images',
                    $projectPath . '/img',
                    $projectPath . '/assets',
                ];

                foreach ($possibleImagePaths as $imagePath) {
                    if (File::isDirectory($imagePath)) {
                        $imageFiles = $imageFiles->merge(File::files($imagePath))->filter(function ($file) {
                            return in_array(strtolower($file->getExtension()), ['jpg', 'jpeg', 'png', 'gif']);
                        });
                    }
                }

                $images = [];
                $mainImage = null;
                
                // Process and store images
                if ($imageFiles->count() > 0) {
                    // Ensure storage directory exists
                    if (!File::exists(storage_path('app/public/campaigns'))) {
                        File::makeDirectory(storage_path('app/public/campaigns'), 0755, true);
                    }

                    $images = $imageFiles->map(function ($file) use ($contentData) {
                        $filename = uniqid() . '_' . $file->getFilename();
                        $newPath = 'public/campaigns/' . $filename;
                        
                        // Copy file to storage
                        File::copy($file->getPathname(), storage_path('app/' . $newPath));
                        
                        $path = str_replace('\\', '', 'campaigns/' . $filename);
                        
                        // Try to find a caption for this image
                        if (isset($contentData['image_captions'])) {
                            foreach ($contentData['image_captions'] as $num => $caption) {
                                if (strpos($file->getFilename(), (string)$num) !== false) {
                                    return ['path' => $path, 'caption' => $caption];
                                }
                            }
                        }
                        
                        return ['path' => $path];
                    })->values()->toArray();
                    
                    if (!empty($images)) {
                        $mainImage = $images[0]['path'];
                    }
                }

                // Create realistic target amounts with different scales
                $targetRanges = [
                    'small' => [10000000, 50000000],    // 10M - 50M VND (local/small projects)
                    'medium' => [50000000, 200000000],  // 50M - 200M VND (community projects)
                    'large' => [200000000, 1000000000], // 200M - 1B VND (major campaigns)
                ];
                
                $scaleType = ['small', 'medium', 'large'][rand(0, 2)];
                $targetAmount = $contentData['target_amount'] ?? rand($targetRanges[$scaleType][0], $targetRanges[$scaleType][1]);
                
                $campaign = Campaign::create([
                    'title' => $contentData['name'],
                    'slug' => Str::slug($contentData['name']),
                    'description' => $contentData['description'] ?? "Chiến dịch gây quỹ thuộc lĩnh vực " . implode(', ', $categoryNames),
                    'content' => $contentData['content'] ?? '',
                    'organizer_name' => $contentData['org_name'] ?? null,
                    'organizer_description' => $contentData['org_description'] ?? null,
                    'organizer_website' => $contentData['org_website'] ?? null,
                    'organizer_address' => $contentData['org_address'] ?? null,
                    'organizer_hotline' => $contentData['org_hotline'] ?? null,
                    'organizer_contact' => $contentData['org_contact'] ?? null,
                    'target_amount' => $targetAmount,
                    'current_amount' => 0,
                    'start_date' => $contentData['start_date'] ?? now(),
                    'end_date' => $contentData['end_date'] ?? now()->addMonths(rand(1, 6)),
                    'status' => 'active',
                    'organizer_id' => $fundraisers->random()->id,
                    'images' => json_encode($images),
                    'image' => $mainImage,
                ]);

                // Attach categories
                $campaign->categories()->attach($categoryIds);

                $this->command->info("Created campaign: " . $campaign->title);
            }
        }
    }
}
