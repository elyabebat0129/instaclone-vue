<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Throwable;

trait DeletesPublicFiles
{
    private function deletePublicFileQuietly(?string $path): void
    {
        if (! $path) {
            return;
        }

        try {
            Storage::disk('public')->delete($path);
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
