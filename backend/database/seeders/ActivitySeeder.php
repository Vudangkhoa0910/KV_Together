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
        $dataPath = base_path('../data/ActivitiesOfVolunteering');
        
        if (!File::isDirectory($dataPath)) {
            $this->command->error("Data directory not found: {$dataPath}");
            return;
        }

        $this->command->info("Starting to seed activities from: {$dataPath}");

        // Map categories to Vietnamese names and folders
        $categories = [
            'TourDuLichTinhNguyen' => 'volunteer',      // Tour du lịch tình nguyện
            'TraiHeTinhNguyen' => 'volunteer',          // Trại hè tình nguyện
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
                $contentFile = $projectPath . '/content';
                
                // Also check for content.md for backward compatibility
                if (!File::exists($contentFile)) {
                    $contentFile = $projectPath . '/content.md';
                }
                
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
                
                // Check for img/ directory
                $imgDirectory = $projectPath . '/img';
                if (File::isDirectory($imgDirectory)) {
                    $imageFiles = File::files($imgDirectory);
                    
                    foreach ($imageFiles as $index => $imageFile) {
                        $extension = $imageFile->getExtension();
                        $filename = $imageFile->getFilename();
                        
                        if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif'])) {
                            $destinationPath = 'activities/' . Str::random(10) . '_' . $filename;
                            $fullDestination = storage_path('app/public/' . $destinationPath);
                            
                            File::ensureDirectoryExists(dirname($fullDestination));
                            File::copy($imageFile->getPathname(), $fullDestination);
                            
                            if ($index === 0) {
                                $imagePath = $destinationPath; // First image as main image
                            }
                            $imagesArray[] = $destinationPath;
                        }
                    }
                }
                
                // Fallback: check for individual image files
                if (!$imagePath) {
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

        // Check if it's markdown format (old format) or plain text format (new format)
        $isMarkdown = pathinfo($contentPath, PATHINFO_EXTENSION) === 'md';
        
        if ($isMarkdown) {
            return $this->parseMarkdownContent($content, $contentPath);
        } else {
            return $this->parsePlainTextContent($content, $contentPath);
        }
    }

    private function parseMarkdownContent($content, $contentPath)
    {
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

        return $this->setDefaultValues($data);
    }

    private function parsePlainTextContent($content, $contentPath)
    {
        $data = [];
        $lines = explode("\n", $content);
        
        // For ActivitiesOfVolunteering format
        $title = '';
        $description = '';
        $schedule = [];
        $departureLocation = '';
        $duration = '';
        
        $currentSection = '';
        $contentLines = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            
            if (empty($line)) continue;
            
            // Extract basic info
            if (strpos($line, 'Khởi hành từ:') === 0) {
                $departureLocation = trim(str_replace('Khởi hành từ:', '', $line));
                continue;
            }
            
            if (strpos($line, 'Thời gian:') === 0) {
                $duration = trim(str_replace('Thời gian:', '', $line));
                continue;
            }
            
            if (strpos($line, '- Nội Dung:') === 0) {
                $title = trim(str_replace('- Nội Dung:', '', $line));
                $currentSection = 'content';
                continue;
            }
            
            if (strpos($line, 'Chọn ngày khởi hành:') === 0) {
                $currentSection = 'schedule';
                continue;
            }
            
            if ($currentSection === 'schedule' && preg_match('/^\d{2}\/\d{2}$/', $line)) {
                $schedule[] = $line;
                continue;
            }
            
            // Collect all content after title
            if (!empty($title) || $currentSection === 'content') {
                $contentLines[] = $line;
            }
        }
        
        // Extract title if not found in "Nội Dung" line
        if (empty($title)) {
            // Try to extract from first meaningful line
            foreach ($lines as $line) {
                $line = trim($line);
                if (!empty($line) && 
                    !preg_match('/^(Lịch khởi hành|Khởi hành từ|Thời gian|Chọn ngày|\d{2}\/\d{2}|-)/', $line)) {
                    $title = $line;
                    break;
                }
            }
        }
        
        if (empty($title)) {
            // Fallback to filename-based title
            $pathParts = explode('/', $contentPath);
            $projectName = $pathParts[count($pathParts) - 2]; // project1, project2, etc.
            $categoryName = $pathParts[count($pathParts) - 3]; // TourDuLichTinhNguyen, etc.
            
            if ($categoryName === 'TourDuLichTinhNguyen') {
                $title = "Tour du lịch tình nguyện " . ucfirst($projectName);
            } elseif ($categoryName === 'TraiHeTinhNguyen') {
                $title = "Trại hè tình nguyện " . ucfirst($projectName);
            } else {
                $title = "Hoạt động tình nguyện " . ucfirst($projectName);
            }
        }
        
        $data['title'] = $title;
        
        // Set description from content
        $description = implode("\n", $contentLines);
        if (empty($description)) {
            $description = "Hoạt động tình nguyện ý nghĩa với nhiều trải nghiệm thú vị.";
        }
        $data['description'] = $description;
        
        // Set default organizer info
        $data['organizer_name'] = 'Tổ chức Hoạt động Tình nguyện';
        $data['contact_email'] = null;
        $data['contact_phone'] = null;
        
        // Set location from departure location
        $data['location'] = !empty($departureLocation) ? $departureLocation : 'Sẽ được thông báo';
        
        // Set duration info
        if (!empty($duration)) {
            $data['summary'] = "Thời gian: {$duration}. " . Str::limit(strip_tags($description), 250);
        } else {
            $data['summary'] = Str::limit(strip_tags($description), 300);
        }
        
        // Set registration fee (default for activities)
        $data['registration_fee'] = rand(200000, 2000000); // 200k - 2M VND for volunteer tours

        return $this->setDefaultValues($data);
    }

    private function setDefaultValues($data)
    {
        // Set default values if missing
        if (empty($data['event_date'])) {
            $data['event_date'] = Carbon::now()->addDays(rand(30, 90));
        }
        
        if (empty($data['registration_deadline'])) {
            $data['registration_deadline'] = is_object($data['event_date']) 
                ? $data['event_date']->copy()->subDays(rand(3, 7))
                : Carbon::now()->addDays(rand(23, 83));
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
