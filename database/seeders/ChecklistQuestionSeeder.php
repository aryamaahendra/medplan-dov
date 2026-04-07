<?php

namespace Database\Seeders;

use App\Models\ChecklistQuestion;
use App\Models\NeedGroup;
use Illuminate\Database\Seeder;

class ChecklistQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            [
                'question' => 'Apakah usulan ini sesuai dengan dokumen perencanaan?',
                'description' => 'Memastikan keselarasan dengan Renstra dan RKPD.',
            ],
            [
                'question' => 'Apakah rincian biaya sudah menyertakan standar harga (SSH)?',
                'description' => 'Validasi kepatuhan terhadap Standar Satuan Harga yang berlaku.',
            ],
            [
                'question' => 'Apakah lokasi pekerjaan sudah terverifikasi?',
                'description' => 'Memastikan ketersediaan lahan atau kesiapan lokasi.',
            ],
        ];

        foreach ($questions as $index => $q) {
            $question = ChecklistQuestion::create(array_merge($q, [
                'order_column' => $index + 1,
            ]));

            // Attach to all existing need groups
            $needGroups = NeedGroup::all();
            foreach ($needGroups as $group) {
                $group->checklistQuestions()->attach($question->id, [
                    'order_column' => $index + 1,
                    'is_required' => true,
                    'is_active' => true,
                ]);
            }
        }
    }
}
