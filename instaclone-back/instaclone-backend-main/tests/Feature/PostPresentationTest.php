<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostPresentationTest extends TestCase
{
    use RefreshDatabase;

    public function test_post_detail_includes_summary_fields_for_the_authenticated_viewer(): void
    {
        $viewer = User::factory()->create();
        $author = User::factory()->create();
        $post = Post::factory()->for($author)->create();

        $post->likes()->create(['user_id' => $viewer->getKey()]);
        $post->likes()->create(['user_id' => User::factory()->create()->getKey()]);
        Comment::factory()->for($post)->for($viewer)->create();

        Sanctum::actingAs($viewer);

        $this->getJson("/api/posts/{$post->getKey()}")
            ->assertOk()
            ->assertJsonPath('id', $post->getKey())
            ->assertJsonPath('likes_count', 2)
            ->assertJsonPath('comments_count', 1)
            ->assertJsonPath('liked_by_me', true)
            ->assertJsonPath('user.id', $author->getKey());
    }

    public function test_user_posts_list_reuses_the_same_summary_fields(): void
    {
        $viewer = User::factory()->create();
        $author = User::factory()->create();
        $post = Post::factory()->for($author)->create();

        $post->likes()->create(['user_id' => $viewer->getKey()]);
        Comment::factory()->for($post)->for($viewer)->create();

        Sanctum::actingAs($viewer);

        $this->getJson("/api/users/{$author->getKey()}/posts")
            ->assertOk()
            ->assertJsonPath('data.0.id', $post->getKey())
            ->assertJsonPath('data.0.likes_count', 1)
            ->assertJsonPath('data.0.comments_count', 1)
            ->assertJsonPath('data.0.liked_by_me', true)
            ->assertJsonPath('data.0.user.id', $author->getKey());
    }
}
