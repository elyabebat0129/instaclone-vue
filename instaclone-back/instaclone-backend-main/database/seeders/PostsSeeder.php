<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class PostsSeeder extends Seeder
{
    public function run(): void
    {
        User::all()->each(function (User $user) {
            $count = $user->username === 'demo'
                ? 3
                : random_int(2, 7);

            Post::factory()
                ->count($count)
                ->for($user)
                ->create();
        });
    }
}
