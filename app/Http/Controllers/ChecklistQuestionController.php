<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChecklistQuestionRequest;
use App\Http\Resources\ChecklistQuestionResource;
use App\Models\ChecklistQuestion;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ChecklistQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        return ChecklistQuestionResource::collection(
            ChecklistQuestion::orderBy('order_column')
                ->orderBy('created_at')
                ->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChecklistQuestionRequest $request): ChecklistQuestionResource
    {
        $question = ChecklistQuestion::create($request->validated());

        return new ChecklistQuestionResource($question);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreChecklistQuestionRequest $request, ChecklistQuestion $question): ChecklistQuestionResource
    {
        $question->update($request->validated());

        return new ChecklistQuestionResource($question);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ChecklistQuestion $question): Response
    {
        $question->delete();

        return response()->noContent();
    }
}
