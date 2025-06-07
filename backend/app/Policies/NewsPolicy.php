<?php

namespace App\Policies;

use App\Models\News;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class NewsPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        return $user->role === 'admin';
    }

    public function view(User $user, News $news)
    {
        return true;
    }

    public function create(User $user)
    {
        return in_array($user->role, ['admin']);
    }

    public function update(User $user, News $news)
    {
        return $user->role === 'admin' || $user->id === $news->author_id;
    }

    public function delete(User $user, News $news)
    {
        return $user->role === 'admin' || $user->id === $news->author_id;
    }
}