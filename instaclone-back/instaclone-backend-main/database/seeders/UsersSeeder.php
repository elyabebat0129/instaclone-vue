<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Demo User',
            'username' => 'demo',
            'email' => 'demo@instaclone.test',
            'bio' => 'Hello, I am the demo account.',
        ]);

        User::factory(20)->create();
    }
}
