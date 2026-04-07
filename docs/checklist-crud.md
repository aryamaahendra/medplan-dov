# Checklist CRUD Implementation Guide

This document outlines the backend implementation for managing checklist questions and recording answers.

## 1. Managing Checklist Questions (Question Bank)

### Controller: `ChecklistQuestionController`

```php
namespace App\Http\Controllers;

use App\Models\ChecklistQuestion;
use App\Http\Requests\StoreChecklistQuestionRequest;
use App\Http\Resources\ChecklistQuestionResource;
use Illuminate\Http\Request;

class ChecklistQuestionController extends Controller
{
    public function index()
    {
        return ChecklistQuestionResource::collection(
            ChecklistQuestion::orderBy('order_column')->get()
        );
    }

    public function store(StoreChecklistQuestionRequest $request)
    {
        $question = ChecklistQuestion::create($request->validated());
        return new ChecklistQuestionResource($question);
    }

    public function update(StoreChecklistQuestionRequest $request, ChecklistQuestion $question)
    {
        $question->update($request->validated());
        return new ChecklistQuestionResource($question);
    }

    public function destroy(ChecklistQuestion $question)
    {
        $question->delete();
        return response()->noContent();
    }
}
```

### Request Validation

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChecklistQuestionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'question' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'order_column' => ['integer'],
        ];
    }
}
```

## 2. Assigning Questions to Need Groups

Use the `checklistQuestions()` relationship in `NeedGroup` to sync assignments.

```php
// In NeedGroupController@syncQuestions
$needGroup->checklistQuestions()->sync([
    $questionId => [
        'is_required' => true,
        'order_column' => 1
    ]
]);
```

## 3. Recording Answers for a Need

### Controller: `NeedChecklistAnswerController`

```php
namespace App\Http\Controllers;

use App\Models\Need;
use App\Models\NeedChecklistAnswer;
use Illuminate\Http\Request;

class NeedChecklistAnswerController extends Controller
{
    public function store(Request $request, Need $need)
    {
        $validated = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*.checklist_question_id' => ['required', 'exists:checklist_questions,id'],
            'answers.*.answer' => ['required', 'string', 'in:yes,no,skip'],
            'answers.*.notes' => ['nullable', 'string'],
        ]);

        foreach ($validated['answers'] as $answerData) {
            $need->checklistAnswers()->updateOrCreate(
                ['checklist_question_id' => $answerData['checklist_question_id']],
                [
                    'answer' => $answerData['answer'],
                    'notes' => $answerData['notes'] ?? null,
                ]
            );
        }

        return response()->json(['message' => 'Answers saved successfully']);
    }
}
```

## 4. Retrieving Checklist for a Need

When displaying a Need, include its group's questions and existing answers.

```php
// In NeedController@show
$need->load([
    'needGroup.checklistQuestions' => function($query) {
        $query->where('need_group_checklist_question.is_active', true)
              ->orderBy('need_group_checklist_question.order_column');
    },
    'checklistAnswers'
]);
```
