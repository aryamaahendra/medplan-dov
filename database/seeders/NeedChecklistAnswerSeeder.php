<?php

namespace Database\Seeders;

use App\Models\Need;
use App\Models\NeedChecklistAnswer;
use Illuminate\Database\Seeder;

class NeedChecklistAnswerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $needs = Need::with('needGroup.checklistQuestions')->get();

        foreach ($needs as $need) {
            if ($need->needGroup) {
                foreach ($need->needGroup->checklistQuestions as $question) {
                    NeedChecklistAnswer::updateOrCreate(
                        [
                            'need_id' => $need->id,
                            'checklist_question_id' => $question->id,
                        ],
                        [
                            'answer' => collect(['yes', 'no', 'skip'])->random(),
                            'notes' => 'Seeded answer for '.$need->title,
                        ]
                    );
                }
            }
        }
    }
}
