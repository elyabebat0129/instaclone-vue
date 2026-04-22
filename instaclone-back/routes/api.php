<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\PreventSelfFollow;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::prefix('users')->middleware('auth:sanctum')->group(function () {
    Route::get('search', [UserController::class, 'search']);
    Route::get('suggestions', [UserController::class, 'suggestions']);
    Route::put('me', [UserController::class, 'updateMe']);
    Route::post('me/avatar', [UserController::class, 'uploadAvatar']);

    Route::get('{user}/posts', [PostController::class, 'userPosts'])
        ->whereNumber('user');

    Route::get('{user}/followers', [FollowController::class, 'followers'])
        ->whereNumber('user');
    Route::get('{user}/following', [FollowController::class, 'following'])
        ->whereNumber('user');
    Route::get('{user}/is-following', [FollowController::class, 'isFollowing'])
        ->whereNumber('user');

    Route::middleware(PreventSelfFollow::class)->group(function () {
        Route::post('{user}/follow', [FollowController::class, 'follow'])
            ->whereNumber('user');
        Route::delete('{user}/unfollow', [FollowController::class, 'unfollow'])
            ->whereNumber('user');
    });

    Route::get('{username}', [UserController::class, 'show']);
});

Route::middleware('auth:sanctum')->get('feed', [FeedController::class, 'index']);

Route::prefix('posts')->middleware('auth:sanctum')->group(function () {
    Route::post('/', [PostController::class, 'store']);
    Route::get('{post}', [PostController::class, 'show'])->whereNumber('post');
    Route::put('{post}', [PostController::class, 'update'])->whereNumber('post');
    Route::delete('{post}', [PostController::class, 'destroy'])->whereNumber('post');

    Route::post('{post}/like', [LikeController::class, 'like'])->whereNumber('post');
    Route::delete('{post}/unlike', [LikeController::class, 'unlike'])->whereNumber('post');
    Route::get('{post}/likes', [LikeController::class, 'likers'])->whereNumber('post');

    Route::post('{post}/comments', [CommentController::class, 'store'])->whereNumber('post');
    Route::get('{post}/comments', [CommentController::class, 'index'])->whereNumber('post');
});

Route::prefix('comments')->middleware('auth:sanctum')->group(function () {
    Route::put('{comment}', [CommentController::class, 'update'])->whereNumber('comment');
    Route::delete('{comment}', [CommentController::class, 'destroy'])->whereNumber('comment');
});

Route::prefix('notifications')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('read', [NotificationController::class, 'markRead']);
});
