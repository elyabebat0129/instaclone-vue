<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class LikesSeeder extends Seeder
{
    public function run(): void
    {
        $userIds = User::query()->pluck('id')->all();
        $posts = Post::query()->get(['id', 'user_id', 'created_at']);

        $rows = [];
        $seen = [];

        foreach ($posts as $post) {
            $likerPool = array_values(array_diff($userIds, [$post->user_id]));
            shuffle($likerPool);

            $likeCount = random_int(0, min(12, count($likerPool)));
            $likers = array_slice($likerPool, 0, $likeCount);

            foreach ($likers as $userId) {
                $key = $userId.'-'.$post->id;
                if (isset($seen[$key])) {
                    continue;
                }
                $seen[$key] = true;

                $createdAt = $this->likeTimestamp($post->created_at);
                $rows[] = [
                    'user_id' => $userId,
                    'post_id' => $post->id,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ];
            }
        }

        foreach (array_chunk($rows, 1000) as $chunk) {
            DB::table('likes')->insert($chunk);
        }
    }

    private function likeTimestamp(Carbon $postCreatedAt): Carbon
    {
        $now = Carbon::now();

        if (random_int(1, 100) <= 40 && $postCreatedAt->lt($now->copy()->subHours(48))) {
            return $now->copy()->subMinutes(random_int(0, 60 * 47));
        }

        $min = $postCreatedAt->copy()->getTimestamp();
        $max = $now->getTimestamp();

        return Carbon::createFromTimestamp(random_int($min, $max));
    }
}
