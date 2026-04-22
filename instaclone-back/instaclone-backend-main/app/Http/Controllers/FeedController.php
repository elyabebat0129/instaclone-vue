<?php

namespace App\Http\Controllers;

use App\Services\FeedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    public function __construct(private readonly FeedService $feedService) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->feedService->feed($request->user(), $this->perPage($request)),
        );
    }
}
