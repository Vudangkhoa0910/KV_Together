<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Giáo dục',
                'description' => 'Các dự án về giáo dục và học tập',
                'icon' => 'school',
                'folder' => 'children_education'
            ],
            [
                'name' => 'Trẻ em',
                'description' => 'Các dự án hỗ trợ trẻ em',
                'icon' => 'child_care',
                'folder' => 'children_education'
            ],
            [
                'name' => 'Cộng đồng',
                'description' => 'Các dự án hỗ trợ cộng đồng khó khăn',
                'icon' => 'diversity_3',
                'folder' => 'community_DifficultCircumstances'
            ],
            [
                'name' => 'Y tế',
                'description' => 'Các dự án về y tế và sức khỏe',
                'icon' => 'medical_services',
                'folder' => 'disastersElderly_Health'
            ],
            [
                'name' => 'Người cao tuổi',
                'description' => 'Các dự án hỗ trợ người cao tuổi',
                'icon' => 'elderly',
                'folder' => 'disastersElderly_Health'
            ],
            [
                'name' => 'Khẩn cấp',
                'description' => 'Các dự án cứu trợ thiên tai và khẩn cấp',
                'icon' => 'emergency',
                'folder' => 'disastersElderly_Health'
            ],
            [
                'name' => 'Môi trường',
                'description' => 'Các dự án về môi trường và thiên nhiên',
                'icon' => 'nature',
                'folder' => 'environment_natural'
            ]
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'description' => $category['description'],
                'icon' => $category['icon']
            ]);
        }
    }
} 