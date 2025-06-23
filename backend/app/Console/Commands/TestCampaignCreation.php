<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TestCampaignCreation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:campaign-creation {email : Email of the user to test}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test campaign creation by simulating a form submission';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting campaign creation test...');

        // Get the user
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }
        
        $this->info("Testing with user: {$user->name} (ID: {$user->id})");
        
        // Check if the user can create campaigns
        $canCreate = $user->can('create', \App\Models\Campaign::class);
        
        if (!$canCreate) {
            $this->error("User cannot create campaigns. Role: {$user->role?->slug}, Status: {$user->status}");
            $this->info("Required: Role = fundraiser, Status = active");
            return 1;
        }
        
        $this->info("User has permission to create campaigns. Proceeding with test...");
        
        // Get all categories for reference
        $categories = Category::all();
        $this->info("Available categories:");
        foreach ($categories as $category) {
            $this->line("- ID: {$category->id}, Name: {$category->name}, Slug: {$category->slug}");
        }
        
        if ($categories->count() === 0) {
            $this->error("No categories found in the database. Cannot continue test.");
            return 1;
        }
        
        // Pick the first category for testing
        $category = $categories->first();
        
        // Create a test image
        $imagePath = $this->createTestImage();
        if (!$imagePath) {
            $this->error("Failed to create test image.");
            return 1;
        }
        
        // Build form data
        $formData = [
            'title' => 'Test Campaign Created by Command',
            'description' => 'This is a test campaign created by the TestCampaignCreation command.',
            'content' => 'This is the full content of the test campaign.',
            'target_amount' => '10000000',
            'end_date' => now()->addDays(30)->format('Y-m-d'),
            'category_id' => $category->id,
            'organizer_name' => $user->name,
            'organizer_contact' => $user->email,
            'image' => $imagePath
        ];
        
        $this->info("Form data prepared:");
        foreach ($formData as $key => $value) {
            if ($key !== 'image') {
                $this->line("- {$key}: {$value}");
            } else {
                $this->line("- {$key}: [File]");
            }
        }
        
        $this->info('At this point, we would call the CampaignController@store method');
        $this->info('You would need to create a test that actually makes the request');
        
        $this->info('Test completed. Check your implementation against this data structure:');
        $this->line("1. Make sure you're sending 'category_id' as {$category->id} (numeric value)");
        $this->line("2. Ensure the image file is properly attached as 'image'");
        $this->line("3. Verify your authenticated user has role 'fundraiser' and status 'active'");
        
        return 0;
    }
    
    /**
     * Create a test image in storage
     *
     * @return string|null The path to the created image
     */
    private function createTestImage()
    {
        try {
            // Create a simple image
            $img = imagecreatetruecolor(100, 100);
            $textcolor = imagecolorallocate($img, 255, 255, 255);
            imagestring($img, 5, 10, 40, 'Test Image', $textcolor);
            
            // Save to temp file
            $tempFile = tempnam(sys_get_temp_dir(), 'test_image') . '.png';
            imagepng($img, $tempFile);
            imagedestroy($img);
            
            return $tempFile;
        } catch (\Exception $e) {
            $this->error("Error creating test image: " . $e->getMessage());
            return null;
        }
    }
}
