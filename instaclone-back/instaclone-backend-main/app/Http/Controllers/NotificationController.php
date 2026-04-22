<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->notificationService->list($request->user(), $this->perPage($request, 20)),
        );
    }

    public function markRead(Request $request): JsonResponse
    {
        $updated = $this->notificationService->markAllRead($request->user());

        return response()->json([
            'message' => 'Marked as read.',
            'updated' => $updated,
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'unread_count' => $this->notificationService->unreadCount($request->user()),
        ]);
    }
}
