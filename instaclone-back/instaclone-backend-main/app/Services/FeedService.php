<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\CursorPaginator;

class FeedService
{
    public function feed(User $user, int $perPage = 15): CursorPaginator
    {
        return Post::query()
            ->select('posts.*')
            ->join('follows', 'follows.following_id', '=', 'posts.user_id')
            ->where('follows.follower_id', $user->getKey())
            ->withSummary($user)
            ->orderByDesc('posts.created_at')
            ->orderByDesc('posts.id')
            ->cursorPaginate($perPage);
    }
}
