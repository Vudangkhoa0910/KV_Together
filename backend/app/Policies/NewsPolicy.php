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
        return $user->hasRole('admin');
    }

    public function view(?User $user, News $news)
    {
        // Published news can be viewed by everyone
        if ($news->status === 'published') {
            return true;
        }
        
        // Draft news can only be viewed by author or admin
        return $user && ($user->id === $news->author_id || $user->hasRole('admin'));
    }

    public function create(User $user)
    {
        // Users, fundraisers, and admins can create news
        return $user->canCreateNews();
    }

    public function update(User $user, News $news)
    {
        // Only author or admin can update
        return $user->hasRole('admin') || $user->id === $news->author_id;
    }

    public function delete(User $user, News $news)
    {
        // Only author or admin can delete
        return $user->hasRole('admin') || $user->id === $news->author_id;
    }

    public function setFeatured(User $user, News $news)
    {
        // Only admin can set featured status
        return $user->hasRole('admin');
    }

    public function publish(User $user, News $news)
    {
        // Author can publish their own news, admin can publish any news
        return $user->hasRole('admin') || $user->id === $news->author_id;
    }

    public function moderate(User $user)
    {
        // Only admin can moderate news
        return $user->hasRole('admin');
    }
}