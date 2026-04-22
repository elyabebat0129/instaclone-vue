<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InteractionNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_like_and_unlike_keep_notifications_in_sync(): void
    {
        $owner = User::factory()->create();
        $liker = User::factory()->create();
        $post = Post::factory()->for($owner)->create();

        Sanctum::actingAs($liker);

        $this->postJson("/api/posts/{$post->getKey()}/like")->assertOk();
        $this->postJson("/api/posts/{$post->getKey()}/like")->assertOk();

        $this->assertDatabaseCount('likes', 1);
        $this->assertDatabaseCount('notifications', 1);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->getKey(),
            'type' => 'like',
        ]);

        $this->deleteJson("/api/posts/{$post->getKey()}/unlike")->assertOk();

        $this->assertDatabaseCount('likes', 0);
        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_follow_and_unfollow_keep_notifications_in_sync(): void
    {
        $actor = User::factory()->create();
        $target = User::factory()->create();

        Sanctum::actingAs($actor);

        $this->postJson("/api/users/{$target->getKey()}/follow")->assertOk();
        $this->postJson("/api/users/{$target->getKey()}/follow")->assertOk();

        $this->assertDatabaseCount('follows', 1);
        $this->assertDatabaseCount('notifications', 1);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $target->getKey(),
            'type' => 'follow',
        ]);

        $this->deleteJson("/api/users/{$target->getKey()}/unfollow")->assertOk();

        $this->assertDatabaseCount('follows', 0);
        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_comment_notifications_are_removed_when_the_comment_is_deleted(): void
    {
        $owner = User::factory()->create();
        $author = User::factory()->create();
        $post = Post::factory()->for($owner)->create();

        Sanctum::actingAs($author);

        $response = $this->postJson("/api/posts/{$post->getKey()}/comments", [
            'body' => 'Nice post!',
        ])->assertCreated();

        $commentId = $response->json('id');

        $this->assertDatabaseCount('comments', 1);
        $this->assertDatabaseCount('notifications', 1);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->getKey(),
            'type' => 'comment',
        ]);

        $this->deleteJson("/api/comments/{$commentId}")->assertOk();

        $this->assertDatabaseCount('comments', 0);
        $this->assertDatabaseCount('notifications', 0);
    }
}
