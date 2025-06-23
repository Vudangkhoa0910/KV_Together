<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Facades\Log;

class CheckUserPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:check-permissions {email : The email of the user to check}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check if a user has permissions to create campaigns';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found.");
            return;
        }

        $this->info("User information:");
        $this->line("ID: {$user->id}");
        $this->line("Name: {$user->name}");
        $this->line("Email: {$user->email}");
        $this->line("Status: {$user->status}");
        
        // Check role
        if ($user->role) {
            $this->info("Role: {$user->role->name} (slug: {$user->role->slug})");
        } else {
            $this->error("User has no role assigned!");
        }
        
        // Check if user can create campaigns
        $canCreate = $user->can('create', \App\Models\Campaign::class);
        if ($canCreate) {
            $this->info("User CAN create campaigns.");
        } else {
            $this->error("User CANNOT create campaigns.");
            
            // Show requirements
            $this->line("Requirements to create campaigns:");
            $this->line("- User role must be 'fundraiser'");
            $this->line("- User status must be 'active'");
        }
        
        // Show available categories for convenience
        $this->info("Available categories for campaigns:");
        $categories = Category::all();
        foreach ($categories as $category) {
            $this->line("- ID: {$category->id}, Name: {$category->name}, Slug: {$category->slug}");
        }
        
        // Log this check
        Log::info("User permissions checked via command", [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'role' => $user->role?->slug ?? 'no-role',
            'status' => $user->status,
            'can_create_campaigns' => $canCreate
        ]);
    }
}
