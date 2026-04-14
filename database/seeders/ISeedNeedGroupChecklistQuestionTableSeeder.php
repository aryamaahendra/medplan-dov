<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedNeedGroupChecklistQuestionTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('need_group_checklist_question')->delete();

        \DB::table('need_group_checklist_question')->insert([
            0 => [
                'id' => 1,
                'need_group_id' => 1,
                'checklist_question_id' => 1,
                'order_column' => 1,
                'is_required' => true,
                'is_active' => true,
                'created_at' => '2026-04-13 12:00:38',
                'updated_at' => '2026-04-13 12:00:53',
            ],
            1 => [
                'id' => 2,
                'need_group_id' => 1,
                'checklist_question_id' => 2,
                'order_column' => 2,
                'is_required' => true,
                'is_active' => true,
                'created_at' => '2026-04-13 12:00:39',
                'updated_at' => '2026-04-13 12:00:54',
            ],
            2 => [
                'id' => 3,
                'need_group_id' => 1,
                'checklist_question_id' => 3,
                'order_column' => 3,
                'is_required' => true,
                'is_active' => true,
                'created_at' => '2026-04-13 12:00:40',
                'updated_at' => '2026-04-13 12:00:55',
            ],
            3 => [
                'id' => 4,
                'need_group_id' => 1,
                'checklist_question_id' => 4,
                'order_column' => 4,
                'is_required' => true,
                'is_active' => true,
                'created_at' => '2026-04-13 12:00:41',
                'updated_at' => '2026-04-13 12:00:58',
            ],
            4 => [
                'id' => 5,
                'need_group_id' => 1,
                'checklist_question_id' => 5,
                'order_column' => 5,
                'is_required' => true,
                'is_active' => true,
                'created_at' => '2026-04-13 12:00:42',
                'updated_at' => '2026-04-13 12:01:01',
            ],
            5 => [
                'id' => 6,
                'need_group_id' => 1,
                'checklist_question_id' => 6,
                'order_column' => 6,
                'is_required' => true,
                'is_active' => true,
                'created_at' => '2026-04-13 12:00:43',
                'updated_at' => '2026-04-13 12:01:05',
            ],
            6 => [
                'id' => 7,
                'need_group_id' => 1,
                'checklist_question_id' => 7,
                'order_column' => 7,
                'is_required' => true,
                'is_active' => true,
                'created_at' => '2026-04-13 12:00:44',
                'updated_at' => '2026-04-13 12:01:07',
            ],
        ]);

    }
}
