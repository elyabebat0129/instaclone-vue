<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/docs', fn () => view('docs'));

Route::get('/docs/openapi.yaml', function () {
    $path = resource_path('docs/openapi.yaml');

    abort_unless(is_file($path), 404);

    return response()->file($path, [
        'Content-Type' => 'application/yaml; charset=utf-8',
    ]);
});
