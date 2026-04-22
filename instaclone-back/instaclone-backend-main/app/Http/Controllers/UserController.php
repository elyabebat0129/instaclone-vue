<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\SearchUsersRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Requests\User\UploadAvatarRequest;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService)
    {
    }

    public function show(string $username): JsonResponse
    {
        return response()->json($this->userService->findByUsername($username));
    }

    public function updateMe(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->userService->updateProfile(
            $request->user(),
            $request->validated(),
        );

        return response()->json($user);
    }

    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        $user = $this->userService->uploadAvatar(
            $request->user(),
            $request->file('avatar'),
        );

        return response()->json($user);
    }

    public function search(SearchUsersRequest $request): JsonResponse
    {
        $users = $this->userService->search(
            $request->validated('q'),
            (int) $request->validated('per_page', 15),
        );

        return response()->json($users);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 20);
        $perPage = max(1, min($perPage, 50));

        $users = $this->userService->suggestions($request->user(), $perPage);

        return response()->json($users);
    }
}
