<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedNeedChecklistAnswersTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('need_checklist_answers')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('need_checklist_answers')->insert([

            0 => [
                'id' => 2,
                'need_id' => 1,
                'checklist_question_id' => 2,
                'answer' => 'yes',
                'notes' => null,
                'created_at' => '2026-04-13 12:01:27',
                'updated_at' => '2026-04-13 12:01:31',
            ],
            1 => [
                'id' => 3,
                'need_id' => 1,
                'checklist_question_id' => 3,
                'answer' => 'yes',
                'notes' => null,
                'created_at' => '2026-04-13 12:01:27',
                'updated_at' => '2026-04-13 12:01:32',
            ],
            2 => [
                'id' => 6,
                'need_id' => 1,
                'checklist_question_id' => 6,
                'answer' => 'yes',
                'notes' => null,
                'created_at' => '2026-04-13 12:01:27',
                'updated_at' => '2026-04-13 12:02:05',
            ],
            3 => [
                'id' => 7,
                'need_id' => 1,
                'checklist_question_id' => 7,
                'answer' => 'yes',
                'notes' => null,
                'created_at' => '2026-04-13 12:01:27',
                'updated_at' => '2026-04-13 12:02:08',
            ],
            4 => [
                'id' => 14,
                'need_id' => 3,
                'checklist_question_id' => 7,
                'answer' => 'skip',
                'notes' => null,
                'created_at' => '2026-04-14 06:10:28',
                'updated_at' => '2026-04-14 06:10:28',
            ],
            5 => [
                'id' => 8,
                'need_id' => 3,
                'checklist_question_id' => 1,
                'answer' => 'yes',
                'notes' => null,
                'created_at' => '2026-04-14 06:10:28',
                'updated_at' => '2026-04-14 06:10:29',
            ],
            6 => [
                'id' => 9,
                'need_id' => 3,
                'checklist_question_id' => 2,
                'answer' => 'yes',
                'notes' => null,
                'created_at' => '2026-04-14 06:10:28',
                'updated_at' => '2026-04-14 06:10:31',
            ],
            7 => [
                'id' => 10,
                'need_id' => 3,
                'checklist_question_id' => 3,
                'answer' => 'no',
                'notes' => null,
                'created_at' => '2026-04-14 06:10:28',
                'updated_at' => '2026-04-14 06:16:36',
            ],
            8 => [
                'id' => 11,
                'need_id' => 3,
                'checklist_question_id' => 4,
                'answer' => 'no',
                'notes' => null,
                'created_at' => '2026-04-14 06:10:28',
                'updated_at' => '2026-04-14 06:16:39',
            ],
            9 => [
                'id' => 13,
                'need_id' => 3,
                'checklist_question_id' => 6,
                'answer' => 'yes',
                'notes' => null,
                'created_at' => '2026-04-14 06:10:28',
                'updated_at' => '2026-04-14 06:16:49',
            ],
            10 => [
                'id' => 12,
                'need_id' => 3,
                'checklist_question_id' => 5,
                'answer' => 'yes',
                'notes' => null,
                'created_at' => '2026-04-14 06:10:28',
                'updated_at' => '2026-04-14 06:16:50',
            ],
            11 => [
                'id' => 1,
                'need_id' => 1,
                'checklist_question_id' => 1,
                'answer' => 'yes',
                'notes' => null,
                'created_at' => '2026-04-13 12:01:27',
                'updated_at' => '2026-04-14 08:55:34',
            ],
            12 => [
                'id' => 4,
                'need_id' => 1,
                'checklist_question_id' => 4,
                'answer' => 'no',
                'notes' => null,
                'created_at' => '2026-04-13 12:01:27',
                'updated_at' => '2026-04-14 08:55:38',
            ],
            13 => [
                'id' => 5,
                'need_id' => 1,
                'checklist_question_id' => 5,
                'answer' => 'no',
                'notes' => null,
                'created_at' => '2026-04-13 12:01:27',
                'updated_at' => '2026-04-14 08:55:39',
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('need_checklist_answers', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM need_checklist_answers;");
        }
    }
}
