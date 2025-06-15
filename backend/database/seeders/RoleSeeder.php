<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'permissions' => json_encode([
                    'manage_users',
                    'manage_campaigns',
                    'manage_donations',
                    'manage_settings'
                ])
            ],
            [
                'name' => 'Fundraiser',
                'slug' => 'fundraiser',
                'permissions' => json_encode([
                    'create_campaign',
                    'manage_own_campaigns',
                    'view_donations'
                ])
            ],
            [
                'name' => 'User',
                'slug' => 'user',
                'permissions' => json_encode([
                    'make_donations',
                    'view_campaigns'
                ])
            ]
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}