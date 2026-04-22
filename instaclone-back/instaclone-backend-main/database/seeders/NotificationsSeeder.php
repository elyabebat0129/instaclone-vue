<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class NotificationsSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [];

        $follows = DB::table('follows')->get(['follower_id', 'following_id', 'created_at']);
        foreach ($follows as $f) {
            $rows[] = $this->row(
                userId: $f->following_id,
                type: 'follow',
                data: ['actor_id' => $f->follower_id],
                createdAt: Carbon::parse($f->created_at),
            );
        }

        $likes = DB::table('likes')
            ->join('posts', 'likes.post_id', '=', 'posts.id')
            ->select('likes.user_id', 'likes.post_id', 'likes.created_at', 'posts.user_id as post_owner_id')
            ->get();

        foreach ($likes as $l) {
            if ($l->user_id === $l->post_owner_id) {
                continue;
            }
            $rows[] = $this->row(
                userId: $l->post_owner_id,
                type: 'like',
                data: ['actor_id' => $l->user_id, 'post_id' => $l->post_id],
                createdAt: Carbon::parse($l->created_at),
            );
        }

        $comments = DB::table('comments')
            ->join('posts', 'comments.post_id', '=', 'posts.id')
            ->select(
                'comments.id as comment_id',
                'comments.user_id',
                'comments.post_id',
                'comments.created_at',
                'posts.user_id as post_owner_id',
            )
            ->get();

        foreach ($comments as $c) {
            if ($c->user_id === $c->post_owner_id) {
                continue;
            }
            $rows[] = $this->row(
                userId: $c->post_owner_id,
                type: 'comment',
                data: [
                    'actor_id' => $c->user_id,
                    'post_id' => $c->post_id,
                    'comment_id' => $c->comment_id,
                ],
                createdAt: Carbon::parse($c->created_at),
            );
        }

        foreach (array_chunk($rows, 1000) as $chunk) {
            DB::table('notifications')->insert($chunk);
        }
    }

    private function row(int $userId, string $type, array $data, Carbon $createdAt): array
    {
        $readAt = random_int(1, 100) <= 55
            ? Carbon::createFromTimestamp(random_int(
                $createdAt->getTimestamp(),
                Carbon::now()->getTimestamp(),
            ))
            : null;

        return [
            'user_id' => $userId,
            'type' => $type,
            'data' => json_encode($data),
            'read_at' => $readAt,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }
}
