<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class FollowsSeeder extends Seeder
{
    public function run(): void
    {
        $userIds = User::query()->pluck('id')->all();
        $demo = User::where('username', 'demo')->firstOrFail();

        $rows = [];
        $seen = [];

        foreach ($userIds as $followerId) {
            $targetCount = random_int(5, 12);
            $candidates = array_values(array_diff($userIds, [$followerId]));
            shuffle($candidates);
            $picks = array_slice($candidates, 0, $targetCount);

            foreach ($picks as $followingId) {
                $key = $followerId.'-'.$followingId;
                if (isset($seen[$key])) {
                    continue;
                }
                $seen[$key] = true;

                $createdAt = Carbon::now()->subMinutes(random_int(0, 60 * 24 * 30));
                $rows[] = [
                    'follower_id' => $followerId,
                    'following_id' => $followingId,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ];
            }
        }

        foreach ($userIds as $uid) {
            if ($uid === $demo->id) {
                continue;
            }
            $key = $demo->id.'-'.$uid;
            if (isset($seen[$key])) {
                continue;
            }
            if (random_int(1, 100) > 60) {
                continue;
            }
            $seen[$key] = true;
            $createdAt = Carbon::now()->subMinutes(random_int(0, 60 * 24 * 20));
            $rows[] = [
                'follower_id' => $demo->id,
                'following_id' => $uid,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('follows')->insert($chunk);
        }
    }
}
