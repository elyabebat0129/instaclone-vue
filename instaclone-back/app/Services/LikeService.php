<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class LikeService
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function like(User $user, Post $post): void
    {
        DB::transaction(function () use ($user, $post): void {
            $result = $user->likedPosts()->syncWithoutDetaching([$post->getKey()]);

            if ($result['attached'] !== []) {
                $this->notificationService->notifyLike($user, $post);
            }
        });
    }

    public function unlike(User $user, Post $post): void
    {
        DB::transaction(function () use ($user, $post): void {
            $detached = $user->likedPosts()->detach($post->getKey());

            if ($detached > 0) {
                $this->notificationService->deleteLikeNotification($user, $post);
            }
        });
    }

    public function likers(Post $post, int $perPage = 20): LengthAwarePaginator
    {
        return $post->likers()
            ->orderBy('likes.created_at', 'desc')
            ->paginate($perPage);
    }
}
