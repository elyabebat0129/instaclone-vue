<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FollowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function __construct(private readonly FollowService $followService) {}

    public function follow(Request $request, User $user): JsonResponse
    {
        $this->followService->follow($request->user(), $user);

        return response()->json([
            'message' => 'Followed.',
            'is_following' => true,
        ]);
    }

    public function unfollow(Request $request, User $user): JsonResponse
    {
        $this->followService->unfollow($request->user(), $user);

        return response()->json([
            'message' => 'Unfollowed.',
            'is_following' => false,
        ]);
    }

    public function followers(Request $request, User $user): JsonResponse
    {
        return response()->json(
            $this->followService->followers($user, $this->perPage($request, 20)),
        );
    }

    public function following(Request $request, User $user): JsonResponse
    {
        return response()->json(
            $this->followService->following($user, $this->perPage($request, 20)),
        );
    }

    public function isFollowing(Request $request, User $user): JsonResponse
    {
        return response()->json([
            'is_following' => $this->followService->isFollowing($request->user(), $user),
        ]);
    }
}
