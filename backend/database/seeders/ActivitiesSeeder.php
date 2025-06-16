<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ActivitySeeder extends Seeder
{
    public function run()
    {
        $dataPath = base_path('../data/activities');
        
        if (!File::isDirectory($dataPath)) {
            $this->command->error("Data directory not found: {$dataPath}");
            return;
        }

        $this->command->info("Starting to seed activities from: {$dataPath}");

        // Map categories to Vietnamese names
        $categories = [
            'event' => 'event',
            'workshop' => 'workshop', 
            'community' => 'community',
            'volunteer' => 'volunteer'
        ];

        // Get organizer users (fundraisers and admin)
        $organizers = User::whereHas('role', function($q) {
            $q->whereIn('slug', ['fundraiser', 'admin']);
        })->where('status', 'active')->get();

        if ($organizers->isEmpty()) {
            $this->command->error('No active organizers found. Please run UserSeeder first.');
            return;
        }

        foreach ($categories as $folder => $category) {
            $folderPath = $dataPath . '/' . $folder;
            
            if (!File::isDirectory($folderPath)) {
                $this->command->warn("Directory not found: {$folderPath}");
                continue;
            }

            // Get project directories
            $projects = File::directories($folderPath);
            
            foreach ($projects as $projectPath) {
                $contentFile = $projectPath . '/content.md';
                
                if (!File::exists($contentFile)) {
                    $this->command->warn("Content file not found: {$contentFile}");
                    continue;
                }

                $data = $this->parseContentFile($contentFile);
                
                if (!$data) {
                    $this->command->warn("Failed to parse: {$contentFile}");
                    continue;
                }

                // Copy images if they exist
                $imagePath = null;
                $imagesArray = [];
                
                $imageFiles = ['image.jpg', 'image.png', 'image.jpeg'];
                foreach ($imageFiles as $imageFile) {
                    $sourceImage = $projectPath . '/' . $imageFile;
                    if (File::exists($sourceImage)) {
                        $destinationPath = 'activities/' . Str::random(10) . '_' . $imageFile;
                        $fullDestination = storage_path('app/public/' . $destinationPath);
                        
                        File::ensureDirectoryExists(dirname($fullDestination));
                        File::copy($sourceImage, $fullDestination);
                        $imagePath = $destinationPath;
                        break;
                    }
                }

                // Check for multiple images
                for ($i = 1; $i <= 5; $i++) {
                    foreach (['jpg', 'png', 'jpeg'] as $ext) {
                        $sourceImage = $projectPath . "/image{$i}.{$ext}";
                        if (File::exists($sourceImage)) {
                            $destinationPath = 'activities/' . Str::random(10) . "_image{$i}.{$ext}";
                            $fullDestination = storage_path('app/public/' . $destinationPath);
                            
                            File::ensureDirectoryExists(dirname($fullDestination));
                            File::copy($sourceImage, $fullDestination);
                            $imagesArray[] = $destinationPath;
                        }
                    }
                }

                // Create activity
                $organizer = $organizers->random();
                
                $activity = Activity::create([
                    'title' => $data['title'],
                    'slug' => Str::slug($data['title']),
                    'summary' => $data['summary'] ?? Str::limit(strip_tags($data['description']), 300),
                    'description' => $data['description'],
                    'image' => $imagePath,
                    'images' => !empty($imagesArray) ? $imagesArray : null,
                    'organizer_id' => $organizer->id,
                    'organizer_name' => $data['organizer_name'] ?? $organizer->name,
                    'category' => $category,
                    'status' => 'published',
                    'is_featured' => rand(0, 100) < 30, // 30% chance of being featured
                    'location' => $data['location'],
                    'event_date' => $data['event_date'],
                    'registration_deadline' => $data['registration_deadline'],
                    'max_participants' => $data['max_participants'],
                    'current_participants' => rand(0, intval($data['max_participants'] ?? 100) / 2),
                    'registration_fee' => $data['registration_fee'] ?? 0,
                    'contact_email' => $data['contact_email'],
                    'contact_phone' => $data['contact_phone'],
                    'views_count' => rand(50, 500),
                    'created_at' => Carbon::now()->subDays(rand(1, 30)),
                    'updated_at' => Carbon::now()->subDays(rand(0, 10)),
                ]);

                $this->command->info("Created activity: {$activity->title}");
            }
        }

        $this->command->info('Activities seeding completed!');
    }

    private function parseContentFile($contentPath)
    {
        if (!File::exists($contentPath)) {
            return null;
        }

        $content = File::get($contentPath);
        $data = [];

        // Extract title (first h1) - try multiple patterns
        $titlePatterns = [
            '/^# (.+)$/m',           // Standard markdown
            '/^\s*# (.+)$/m',        // With whitespace
            '/^#\s*(.+)$/m',         // Without space after #
        ];

        $titleFound = false;
        foreach ($titlePatterns as $pattern) {
            if (preg_match($pattern, $content, $matches)) {
                $data['title'] = trim($matches[1]);
                $titleFound = true;
                break;
            }
        }

        if (!$titleFound) {
            $this->command->warn("No title found in: {$contentPath}");
            return null;
        }

        // Parse organization info
        $orgPatterns = [
            'organizer_name' => '/^- Organizer Name:\s*(.+)$/m',
            'contact_email' => '/^- Contact Email:\s*(.+)$/m',
            'contact_phone' => '/^- Contact Phone:\s*(.+)$/m',
            'location' => '/^- Location:\s*(.+)$/m',
            'event_date' => '/^- Event Date:\s*(.+)$/m',
            'registration_deadline' => '/^- Registration Deadline:\s*(.+)$/m',
            'max_participants' => '/^- Max Participants:\s*(\d+)$/m',
            'registration_fee' => '/^- Registration Fee:\s*(\d+)$/m',
        ];

        foreach ($orgPatterns as $key => $pattern) {
            if (preg_match($pattern, $content, $matches)) {
                $value = trim($matches[1]);
                
                if (in_array($key, ['event_date', 'registration_deadline'])) {
                    try {
                        $data[$key] = Carbon::parse($value);
                    } catch (\Exception $e) {
                        $data[$key] = Carbon::now()->addDays(rand(30, 90));
                    }
                } elseif (in_array($key, ['max_participants', 'registration_fee'])) {
                    $data[$key] = intval($value);
                } else {
                    $data[$key] = $value;
                }
            }
        }

        // Extract summary from "Mô tả ngắn" section
        if (preg_match('/## Mô tả ngắn\s*\n(.+?)(?=\n##|\n$)/s', $content, $matches)) {
            $data['summary'] = trim($matches[1]);
        }

        // Extract main content (everything after "## Nội dung chi tiết")
        if (preg_match('/## Nội dung chi tiết\s*\n(.+)$/s', $content, $matches)) {
            $data['description'] = trim($matches[1]);
        } else {
            // Fallback: use content after organization info
            $lines = explode("\n", $content);
            $contentStart = false;
            $descriptionLines = [];
            
            foreach ($lines as $line) {
                if (strpos($line, '## Nội dung chi tiết') !== false) {
                    $contentStart = true;
                    continue;
                }
                if ($contentStart) {
                    $descriptionLines[] = $line;
                }
            }
            
            if (!empty($descriptionLines)) {
                $data['description'] = implode("\n", $descriptionLines);
            } else {
                $data['description'] = "Nội dung hoạt động chi tiết";
            }
        }

        // Set default values if missing
        if (empty($data['event_date'])) {
            $data['event_date'] = Carbon::now()->addDays(rand(30, 90));
        }
        
        if (empty($data['registration_deadline'])) {
            $data['registration_deadline'] = $data['event_date']->copy()->subDays(rand(3, 7));
        }

        if (empty($data['max_participants'])) {
            $data['max_participants'] = rand(50, 300);
        }

        if (empty($data['location'])) {
            $data['location'] = 'Địa điểm sẽ được thông báo';
        }

        if (empty($data['description'])) {
            $data['description'] = 'Chi tiết hoạt động sẽ được cập nhật sau.';
        }

        return $data;
    }
}
