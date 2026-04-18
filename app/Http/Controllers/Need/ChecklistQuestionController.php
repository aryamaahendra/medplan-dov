<?php

namespace App\Http\Controllers\Need;

use App\Http\Controllers\Controller;
use App\Http\Requests\Need\StoreChecklistQuestionRequest;
use App\Models\ChecklistQuestion;
use App\Traits\HasDataTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ChecklistQuestionController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        //
    }

    private const array SEARCH_COLUMNS = ['question', 'description'];

    private const array SORTABLE_COLUMNS = ['question', 'is_active', 'order_column', 'created_at'];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', ChecklistQuestion::class);
        $questions = $this->applyDataTable(
            ChecklistQuestion::query()->orderBy('order_column'),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('need/checklist-questions/index', [
            'questions' => $questions,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChecklistQuestionRequest $request): RedirectResponse
    {
        $this->authorize('create', ChecklistQuestion::class);
        ChecklistQuestion::create($request->validated());

        return redirect()->route('checklist-questions.index')
            ->with('success', 'Pertanyaan checklist berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateChecklistQuestionRequest $request, ChecklistQuestion $checklistQuestion): RedirectResponse
    {
        $this->authorize('update', $checklistQuestion);
        $checklistQuestion->update($request->validated());

        return redirect()->route('checklist-questions.index')
            ->with('success', 'Pertanyaan checklist berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ChecklistQuestion $checklistQuestion): RedirectResponse
    {
        $this->authorize('delete', $checklistQuestion);
        $checklistQuestion->delete();

        return redirect()->route('checklist-questions.index')
            ->with('success', 'Pertanyaan checklist berhasil dihapus.');
    }
}
