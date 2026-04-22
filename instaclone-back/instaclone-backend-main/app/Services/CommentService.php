<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CommentService
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function create(User $user, Post $post, string $body): Comment
    {
        $comment = DB::transaction(function () use ($body, $post, $user): Comment {
            $comment = $post->comments()->create([
                'user_id' => $user->getKey(),
                'body' => $body,
            ]);

            $this->notificationService->notifyComment($user, $post, $comment);

            return $comment;
        });

        return $comment->load('user');
    }

    public function update(Comment $comment, array $data): Comment
    {
        $comment->fill($data)->save();

        return $comment->load('user');
    }

    public function delete(Comment $comment): void
    {
        DB::transaction(function () use ($comment): void {
            $this->notificationService->deleteCommentNotification($comment);
            $comment->delete();
        });
    }

    public function listByPost(Post $post, int $perPage = 20): LengthAwarePaginator
    {
        return $post->comments()
            ->with('user')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }
}
