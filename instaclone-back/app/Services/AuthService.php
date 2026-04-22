<?php

namespace App\Services;

use App\Exceptions\InvalidCredentialsException;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        return $this->issueToken($user);
    }

    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw new InvalidCredentialsException;
        }

        return $this->issueToken($user);
    }

    public function logout(): void
    {
        $this->revokeCurrentToken($this->authenticatedUser());
    }

    public function refresh(): array
    {
        $user = $this->authenticatedUser();

        $this->revokeCurrentToken($user);

        return $this->issueToken($user);
    }

    public function me(): User
    {
        return $this->authenticatedUser()->makeVisible('email');
    }

    private function issueToken(User $user): array
    {
        $token = $user->createToken('api')->plainTextToken;
        $ttlMinutes = config('sanctum.expiration');

        return [
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => $ttlMinutes !== null ? ((int) $ttlMinutes) * 60 : null,
            'user' => $user->makeVisible('email'),
        ];
    }

    private function revokeCurrentToken(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }
    }

    private function authenticatedUser(): User
    {
        $user = Auth::user();

        if (! $user instanceof User) {
            throw new AuthenticationException;
        }

        return $user;
    }
}
