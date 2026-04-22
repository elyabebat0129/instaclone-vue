<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiErrorHandlingTest extends TestCase
{
    use RefreshDatabase;

    public function test_protected_routes_return_json_when_unauthenticated(): void
    {
        $this->getJson('/api/auth/me')
            ->assertUnauthorized()
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_login_with_invalid_credentials_returns_401(): void
    {
        User::factory()->create([
            'email' => 'victor@example.com',
            'password' => 'correct-password',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'victor@example.com',
            'password' => 'wrong-password',
        ])->assertUnauthorized()
            ->assertJson([
                'message' => 'Invalid credentials.',
            ]);
    }

    public function test_validation_errors_are_returned_with_422_and_error_bag(): void
    {
        $this->postJson('/api/auth/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'username', 'email', 'password']);
    }

    public function test_missing_models_return_a_json_404_response(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/posts/999999')
            ->assertNotFound()
            ->assertJson([
                'message' => 'Resource not found.',
            ]);
    }

    public function test_policy_denials_return_json_403_response(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $post = Post::factory()->create();

        $this->deleteJson("/api/posts/{$post->getKey()}")
            ->assertForbidden()
            ->assertJson([
                'message' => 'This action is unauthorized.',
            ]);
    }
}
