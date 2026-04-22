<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class FollowService
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function follow(User $follower, User $target): void
    {
        DB::transaction(function () use ($follower, $target): void {
            $result = $follower->following()->syncWithoutDetaching([$target->getKey()]);

            if ($result['attached'] !== []) {
                $this->notificationService->notifyFollow($follower, $target);
            }
        });
    }

    public function unfollow(User $follower, User $target): void
    {
        DB::transaction(function () use ($follower, $target): void {
            $detached = $follower->following()->detach($target->getKey());

            if ($detached > 0) {
                $this->notificationService->deleteFollowNotification($follower, $target);
            }
        });
    }

    public function isFollowing(User $follower, User $target): bool
    {
        return $follower->following()
            ->whereKey($target->getKey())
            ->exists();
    }

    public function followers(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return $user->followers()
            ->orderBy('follows.created_at', 'desc')
            ->paginate($perPage);
    }

    public function following(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return $user->following()
            ->orderBy('follows.created_at', 'desc')
            ->paginate($perPage);
    }
}
