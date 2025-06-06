<?php $__env->startSection('content'); ?>
<div class="container mx-auto py-12 px-4">
    <h2 class="text-3xl font-bold mb-8 text-center text-orange-700">Tất cả chiến dịch</h2>

    <div class="mb-6">
        <form action="<?php echo e(route('campaigns.index')); ?>" method="GET" class="flex gap-4">
            <select name="category_id" class="rounded-md border-gray-300 shadow-sm">
                <option value="">Tất cả danh mục</option>
                <?php $__currentLoopData = $categories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $category): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <option value="<?php echo e($category->id); ?>" <?php echo e(request('category_id') == $category->id ? 'selected' : ''); ?>><?php echo e($category->name); ?></option>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </select>
            <button type="submit" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">Lọc</button>
        </form>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <?php $__currentLoopData = $campaigns; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $campaign): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <div class="bg-white rounded-xl shadow hover:shadow-lg transition">
                <img src="<?php echo e(Storage::url($campaign->image) ?? 'https://source.unsplash.com/400x200/?donate'); ?>" class="w-full h-48 object-cover rounded-t-xl" />
                <div class="p-4">
                    <h3 class="font-semibold text-lg text-orange-700"><?php echo e($campaign->title); ?></h3>
                    <p class="text-sm text-gray-600"><?php echo e(Str::limit($campaign->description, 100)); ?></p>
                    <p class="text-sm text-gray-500 mt-2"><?php echo e($campaign->category->name ?? 'Không có danh mục'); ?></p>
                    <a href="<?php echo e(route('campaigns.show', $campaign->id)); ?>" class="text-orange-500 mt-3 inline-block">Xem chi tiết →</a>
                </div>
            </div>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </div>

    <div class="mt-6">
        <?php echo e($campaigns->links()); ?>

    </div>
</div>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/vudangkhoa/Working/KV_Together/resources/views/campaigns/index.blade.php ENDPATH**/ ?>