<?php

declare(strict_types=1);

namespace App\Http\Controllers\Need;

use App\Http\Controllers\Controller;
use App\Http\Requests\Need\ReorderNeedGroupChecklistRequest;
use App\Http\Requests\Need\StoreNeedGroupChecklistRequest;
use App\Http\Requests\Need\UpdateNeedGroupChecklistRequest;
use App\Http\Resources\ChecklistQuestionResource;
use App\Models\ChecklistQuestion;
use App\Models\NeedGroup;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NeedGroupChecklistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(NeedGroup $needGroup): Response
    {
        $this->authorize('update', $needGroup);

        return Inertia::render('need/groups/checklists/index', [
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
    public function store(StoreNeedGroupChecklistRequest $request, NeedGroup $needGroup): RedirectResponse
    {
        $this->authorize('update', $needGroup);

        $validated = $request->validated();

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
    public function update(UpdateNeedGroupChecklistRequest $request, NeedGroup $needGroup, ChecklistQuestion $checklistQuestion): RedirectResponse
    {
        $this->authorize('update', $needGroup);

        $validated = $request->validated();

        $needGroup->checklistQuestions()->updateExistingPivot($checklistQuestion->id, $validated);

        return redirect()->back()
            ->with('success', 'Checklist berhasil diperbarui.');
    }

    /**
     * Reorder the resources in storage.
     */
    public function reorder(ReorderNeedGroupChecklistRequest $request, NeedGroup $needGroup): RedirectResponse
    {
        $this->authorize('update', $needGroup);

        $validated = $request->validated();

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
    public function destroy(NeedGroup $needGroup, ChecklistQuestion $checklistQuestion): RedirectResponse
    {
        $this->authorize('update', $needGroup);

        $needGroup->checklistQuestions()->detach($checklistQuestion->id);

        return redirect()->back()
            ->with('success', 'Pertanyaan berhasil dihapus.');
    }
}
