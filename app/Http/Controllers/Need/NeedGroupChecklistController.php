<?php

namespace App\Http\Controllers\Need;

use App\Http\Controllers\Controller;
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
                    'description' => $question->description,
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request, NeedGroup $needGroup)
    {
        $validated = $request->validate([
            'checklist_question_id' => 'required|exists:checklist_questions,id',
            'is_active' => 'sometimes|boolean',
            'is_required' => 'sometimes|boolean',
            'order_column' => 'sometimes|integer',
        ]);

        $needGroup->checklistQuestions()->attach($validated['checklist_question_id'], [
            'is_active' => $validated['is_active'] ?? true,
            'is_required' => $validated['is_required'] ?? false,
            'order_column' => $validated['order_column'] ?? ($needGroup->checklistQuestions()->count() + 1),
        ]);

        return redirect()->back()
            ->with('success', 'Pertanyaan berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, NeedGroup $needGroup, ChecklistQuestion $checklistQuestion)
    {
        $validated = $request->validate([
            'is_active' => 'sometimes|boolean',
            'is_required' => 'sometimes|boolean',
            'order_column' => 'sometimes|integer',
        ]);

        $needGroup->checklistQuestions()->updateExistingPivot($checklistQuestion->id, $validated);

        return redirect()->back()
            ->with('success', 'Checklist berhasil diperbarui.');
    }

    /**
     * Reorder the resources in storage.
     */
    public function reorder(Request $request, NeedGroup $needGroup)
    {
        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.id' => 'required|exists:checklist_questions,id',
            'questions.*.order_column' => 'required|integer',
        ]);

        foreach ($validated['questions'] as $item) {
            $needGroup->checklistQuestions()->updateExistingPivot($item['id'], [
                'order_column' => $item['order_column'],
            ]);
        }

        return redirect()->back()
            ->with('success', 'Urutan checklist berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NeedGroup $needGroup, ChecklistQuestion $checklistQuestion)
    {
        $needGroup->checklistQuestions()->detach($checklistQuestion->id);

        return redirect()->back()
            ->with('success', 'Pertanyaan berhasil dihapus.');
    }
}
