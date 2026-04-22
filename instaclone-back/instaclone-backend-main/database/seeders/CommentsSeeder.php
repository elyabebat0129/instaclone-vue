<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CommentsSeeder extends Seeder
{
    public function run(): void
    {
        $userIds = User::query()->pluck('id')->all();
        $posts = Post::query()->get(['id', 'user_id', 'created_at']);

        $rows = [];

        foreach ($posts as $post) {
            $count = random_int(0, 5);
            if ($count === 0) {
                continue;
            }

            for ($i = 0; $i < $count; $i++) {
                $authorId = $userIds[array_rand($userIds)];
                $createdAt = Carbon::createFromTimestamp(random_int(
                    $post->created_at->getTimestamp(),
                    Carbon::now()->getTimestamp(),
                ));

                $rows[] = [
                    'user_id' => $authorId,
                    'post_id' => $post->id,
                    'body' => fake()->realText(random_int(20, 180)),
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ];
            }
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('comments')->insert($chunk);
        }
    }
}
