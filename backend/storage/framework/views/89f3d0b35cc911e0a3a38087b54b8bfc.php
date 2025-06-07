<?php $__env->startSection('content'); ?>
    <div class="bg-cover bg-center h-96" style="background-image: url('https://source.unsplash.com/random/1200x400/?charity')">
        <div class="flex items-center justify-center h-full bg-black bg-opacity-50">
            <div class="text-center text-white">
                <h1 class="text-4xl font-bold mb-4">Join the Cause with <?php echo e(config('app.name')); ?></h1>
                <p class="text-lg mb-6">Support meaningful campaigns and make a difference today.</p>
                <a href="<?php echo e(route('campaigns.index')); ?>" class="btn-primary px-6 py-3 rounded-full text-lg">Explore Campaigns</a>
            </div>
        </div>
    </div>

    <section class="py-12">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Featured Campaigns</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <?php $__currentLoopData = $campaigns; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $campaign): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src="<?php echo e(Storage::url($campaign->image) ?? 'https://source.unsplash.com/random/400x300/?cause'); ?>" alt="<?php echo e($campaign->title); ?>" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800"><?php echo e($campaign->title); ?></h3>
                        <p class="text-gray-600 mt-2"><?php echo e(Str::limit($campaign->description, 100)); ?></p>
                        <div class="mt-4">
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-green-600 h-2.5 rounded-full" style="width: <?php echo e(($campaign->current_amount / $campaign->target_amount) * 100); ?>%"></div>
                            </div>
                            <p class="text-sm text-gray-600 mt-2">Raised: <?php echo e(number_format($campaign->current_amount)); ?>đ of <?php echo e(number_format($campaign->target_amount)); ?>đ</p>
                        </div>
                        <a href="<?php echo e(route('campaigns.show', $campaign)); ?>" class="btn-primary mt-4 inline-block px-4 py-2 rounded">Support Now</a>
                    </div>
                </div>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </div>
    </section>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/vudangkhoa/Work/KV_Together/resources/views/home.blade.php ENDPATH**/ ?>