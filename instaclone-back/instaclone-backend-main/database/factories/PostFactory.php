<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    public function definition(): array
    {
        $createdAt = fake()->dateTimeBetween('-30 days', 'now');

        return [
            'user_id' => User::factory(),
            'image_url' => 'posts/seed-'.fake()->unique()->numerify('########').'.jpg',
            'caption' => fake()->optional(0.85)->realText(fake()->numberBetween(40, 220)),
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }
}
