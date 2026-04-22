<?php

namespace App\Services;

use App\Models\User;
use App\Support\DeletesPublicFiles;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Throwable;

class UserService
{
    use DeletesPublicFiles;

    public function findByUsername(string $username): User
    {
        return User::where('username', $username)->firstOrFail();
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->fill($data)->save();

        return $user->refresh()->makeVisible('email');
    }

    public function uploadAvatar(User $user, UploadedFile $file): User
    {
        $previous = $user->getRawOriginal('avatar_url');
        $path = $file->store('avatars', 'public');

        try {
            $updatedUser = DB::transaction(function () use ($path, $user): User {
                $user->forceFill(['avatar_url' => $path])->save();

                return $user->refresh()->makeVisible('email');
            });
        } catch (Throwable $exception) {
            $this->deletePublicFileQuietly($path);

            throw $exception;
        }

        $this->deletePublicFileQuietly($previous);

        return $updatedUser;
    }

    public function search(string $query, int $perPage = 15): LengthAwarePaginator
    {
        return User::query()
            ->where('username', 'like', "%{$query}%")
            ->orWhere('name', 'like', "%{$query}%")
            ->orderBy('username')
            ->paginate($perPage);
    }

    public function suggestions(User $viewer, int $perPage = 20): LengthAwarePaginator
    {
        return User::query()
            ->whereKeyNot($viewer->getKey())
            ->orderBy('username')
            ->paginate($perPage);
    }
}
