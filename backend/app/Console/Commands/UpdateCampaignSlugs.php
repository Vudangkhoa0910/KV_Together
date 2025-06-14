<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;

class UpdateCampaignSlugs extends Command
{
    protected $signature = 'campaigns:update-slugs';
    protected $description = 'Update slugs for all campaigns that are missing them';

    public function handle()
    {
        $campaigns = Campaign::whereNull('slug')->get();
        $count = 0;

        foreach ($campaigns as $campaign) {
            $slug = Str::slug($campaign->title);
            $originalSlug = $slug;
            $counter = 1;

            // Make sure slug is unique
            while (Campaign::where('slug', $slug)->where('id', '!=', $campaign->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }

            $campaign->update(['slug' => $slug]);
            $count++;
        }

        $this->info("Updated slugs for {$count} campaigns");
    }
}
