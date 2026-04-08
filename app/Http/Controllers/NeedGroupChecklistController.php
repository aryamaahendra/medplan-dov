<?php

namespace App\Http\Controllers;

use App\Http\Resources\ChecklistQuestionResource;
use App\Models\ChecklistQuestion;
use App\Models\NeedGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NeedGroupChecklistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(NeedGroup $needGroup): Response
    {
        return Inertia::render('need-groups/checklists/index', [
            'needGroup' => $needGroup,
            'assignedQuestions' => $needGroup->checklistQuestions()
                ->orderBy('need_group_checklist_question.order_column')
                ->get()
                ->map(fn ($question) => [
                    'id' => $question->id,
                    'question' => $question->question,
                    'is_active' => $question->pivot->is_active,
                    'is_required' => $question->pivot->is_required,
                    'order_column' => $question->pivot->order_column,
                ]),
            'availableQuestions' => ChecklistQuestionResource::collection(
                ChecklistQuestion::orderBy('order_column')->get()
            ),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, NeedGroup $needGroup)
    {
        $validated = $request->validate([
            'questions' => 'present|array',
            'questions.*.id' => 'required|exists:checklist_questions,id',
            'questions.*.is_active' => 'required|boolean',
            'questions.*.is_required' => 'required|boolean',
            'questions.*.order_column' => 'required|integer',
        ]);

        $syncData = collect($validated['questions'])->mapWithKeys(fn ($item) => [
            $item['id'] => [
                'is_active' => $item['is_active'],
                'is_required' => $item['is_required'],
                'order_column' => $item['order_column'],
            ],
        ])->toArray();

        $needGroup->checklistQuestions()->sync($syncData);

        return redirect()->back()
            ->with('success', 'Checklist berhasil diperbarui.');
    }
}
