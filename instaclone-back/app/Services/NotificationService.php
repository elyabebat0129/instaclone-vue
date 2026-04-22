<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function list(User $user, int $perPage = 20): LengthAwarePaginator
    {
        $paginator = $user->notifications()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);

        $actorIds = collect($paginator->items())
            ->map(fn (Notification $n) => $n->data['actor_id'] ?? null)
            ->filter()
            ->unique()
            ->values();

        $actors = User::whereIn('id', $actorIds)->get()->keyBy('id');

        foreach ($paginator as $notification) {
            $actorId = $notification->data['actor_id'] ?? null;
            $notification->setAttribute('actor', $actorId ? $actors->get($actorId) : null);
        }

        return $paginator;
    }

    public function markAllRead(User $user): int
    {
        return $user->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function unreadCount(User $user): int
    {
        return $user->notifications()
            ->whereNull('read_at')
            ->count();
    }

    public function notifyLike(User $actor, Post $post): void
    {
        if ($actor->getKey() === $post->user_id) {
            return;
        }

        $this->createNotification($post->user_id, 'like', [
            'actor_id' => $actor->getKey(),
            'post_id' => $post->getKey(),
        ]);
    }

    public function deleteLikeNotification(User $actor, Post $post): void
    {
        if ($actor->getKey() === $post->user_id) {
            return;
        }

        $this->deleteNotifications(
            'like',
            [
                'actor_id' => $actor->getKey(),
                'post_id' => $post->getKey(),
            ],
            $post->user_id,
        );
    }

    public function notifyComment(User $actor, Post $post, Comment $comment): void
    {
        if ($actor->getKey() === $post->user_id) {
            return;
        }

        $this->createNotification($post->user_id, 'comment', [
            'actor_id' => $actor->getKey(),
            'post_id' => $post->getKey(),
            'comment_id' => $comment->getKey(),
        ]);
    }

    public function deleteCommentNotification(Comment $comment): void
    {
        $this->deleteNotifications('comment', [
            'comment_id' => $comment->getKey(),
        ]);
    }

    public function notifyFollow(User $actor, User $target): void
    {
        if ($actor->getKey() === $target->getKey()) {
            return;
        }

        $this->createNotification($target->getKey(), 'follow', [
            'actor_id' => $actor->getKey(),
        ]);
    }

    public function deleteFollowNotification(User $actor, User $target): void
    {
        $this->deleteNotifications(
            'follow',
            ['actor_id' => $actor->getKey()],
            $target->getKey(),
        );
    }

    private function createNotification(int $userId, string $type, array $data): void
    {
        Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'data' => $data,
        ]);
    }

    private function deleteNotifications(string $type, array $payload, ?int $userId = null): void
    {
        $query = Notification::query()->where('type', $type);

        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        foreach ($payload as $key => $value) {
            $query->where("data->{$key}", $value);
        }

        $query->delete();
    }
}
