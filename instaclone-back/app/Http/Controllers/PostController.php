<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\CreatePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Models\Post;
use App\Models\User;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PostController extends Controller
{
    public function __construct(private readonly PostService $postService) {}

    public function store(CreatePostRequest $request): JsonResponse
    {
        $post = $this->postService->create(
            $request->user(),
            $request->file('image'),
            $request->validated('caption'),
        );

        return response()->json($post, Response::HTTP_CREATED);
    }

    public function show(Request $request, Post $post): JsonResponse
    {
        return response()->json($this->postService->show($post, $request->user()));
    }

    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $this->authorize('update', $post);

        $post = $this->postService->update(
            $post,
            $request->validated(),
            $request->user(),
        );

        return response()->json($post);
    }

    public function destroy(Post $post): JsonResponse
    {
        $this->authorize('delete', $post);

        $this->postService->delete($post);

        return response()->json(['message' => 'Deleted.']);
    }

    public function userPosts(Request $request, User $user): JsonResponse
    {
        return response()->json(
            $this->postService->listByUser($user, $request->user(), $this->perPage($request)),
        );
    }
}
