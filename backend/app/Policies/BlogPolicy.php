<?php

namespace App\Policies;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BlogPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        return true;
    }

    public function view(User $user, Blog $blog)
    {
        return true;
    }

    public function create(User $user)
    {
        return in_array($user->role, ['user', 'sponsor', 'admin']);
    }

    public function update(User $user, Blog $blog)
    {
        return $user->role === 'admin' || $user->id === $blog->user_id;
    }

    public function delete(User $user, Blog $blog)
    {
        return $user->role === 'admin' || $user->id === $blog->user_id;
    }
}