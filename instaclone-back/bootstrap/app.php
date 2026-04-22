<?php

use App\Exceptions\InvalidCredentialsException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        apiPrefix: 'api',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $expectsJson = static fn (Request $request): bool => $request->is('api/*') || $request->expectsJson();
        $jsonError = static fn (string $message, int $status, array $extra = []) => response()->json(
            array_merge(['message' => $message], $extra),
            $status,
        );

        $exceptions->shouldRenderJsonWhen($expectsJson);

        $exceptions->render(function (InvalidCredentialsException $exception, Request $request) use ($expectsJson, $jsonError) {
            if (! $expectsJson($request)) {
                return null;
            }

            return $jsonError($exception->getMessage(), Response::HTTP_UNAUTHORIZED);
        });

        $exceptions->render(function (ValidationException $exception, Request $request) use ($expectsJson, $jsonError) {
            if (! $expectsJson($request)) {
                return null;
            }

            return $jsonError(
                $exception->getMessage(),
                Response::HTTP_UNPROCESSABLE_ENTITY,
                ['errors' => $exception->errors()],
            );
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) use ($expectsJson, $jsonError) {
            if (! $expectsJson($request)) {
                return null;
            }

            $message = $exception->getMessage() !== '' ? $exception->getMessage() : 'Unauthenticated.';

            return $jsonError($message, Response::HTTP_UNAUTHORIZED);
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) use ($expectsJson, $jsonError) {
            if (! $expectsJson($request)) {
                return null;
            }

            $message = $exception->getMessage() !== '' ? $exception->getMessage() : 'This action is unauthorized.';

            return $jsonError($message, Response::HTTP_FORBIDDEN);
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) use ($expectsJson, $jsonError) {
            if (! $expectsJson($request)) {
                return null;
            }

            return $jsonError('Resource not found.', Response::HTTP_NOT_FOUND);
        });

        $exceptions->render(function (QueryException $exception, Request $request) use ($expectsJson, $jsonError) {
            if (! $expectsJson($request)) {
                return null;
            }

            $sqlState = (string) $exception->getCode();

            if (in_array($sqlState, ['23000', '23505'], true)) {
                return $jsonError(
                    'The request conflicts with existing data.',
                    Response::HTTP_CONFLICT,
                );
            }

            return $jsonError('A database error occurred.', Response::HTTP_INTERNAL_SERVER_ERROR);
        });

        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) use ($expectsJson, $jsonError) {
            if (! $expectsJson($request)) {
                return null;
            }

            $status = $exception->getStatusCode();
            $message = $exception->getMessage() !== ''
                ? $exception->getMessage()
                : (Response::$statusTexts[$status] ?? 'Request error.');

            return $jsonError($message, $status);
        });

        $exceptions->render(function (Throwable $exception, Request $request) use ($expectsJson, $jsonError) {
            if (! $expectsJson($request)) {
                return null;
            }

            return $jsonError(
                config('app.debug') ? $exception->getMessage() : 'Server error.',
                Response::HTTP_INTERNAL_SERVER_ERROR,
            );
        });
    })->create();
