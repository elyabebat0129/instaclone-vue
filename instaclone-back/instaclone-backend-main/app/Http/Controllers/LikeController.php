<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Services\LikeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function __construct(private readonly LikeService $likeService) {}

    public function like(Request $request, Post $post): JsonResponse
    {
        $this->likeService->like($request->user(), $post);

        return response()->json([
            'message' => 'Liked.',
            'liked' => true,
            'likes_count' => $post->likes()->count(),
        ]);
    }

    public function unlike(Request $request, Post $post): JsonResponse
    {
        $this->likeService->unlike($request->user(), $post);

        return response()->json([
            'message' => 'Unliked.',
            'liked' => false,
            'likes_count' => $post->likes()->count(),
        ]);
    }

    public function likers(Request $request, Post $post): JsonResponse
    {
        return response()->json(
            $this->likeService->likers($post, $this->perPage($request, 20)),
        );
    }
}
