# Checklist Feature Implementation Guide

This document provides a comprehensive overview of how the Checklist feature is implemented across the stack, integrating both the backend structure and the frontend auto-saving capabilities.

## 1. Database Schema

The Checklist feature relies on three core tables:

### A. `checklist_questions` (Question Bank)
Stores all possible checklist questions.
- `id` (PK)
- `question` (text): The main question text.
- `description` (text, nullable): Additional context or help text.
- `is_active` (boolean): Controls visibility.
- `order_column` (integer): For sorting in the question bank.

### B. `need_group_checklist_question` (Assignment Pivot Table)
Assigns questions from the bank to specific `NeedGroup`s.
- `need_group_id` (FK)
- `checklist_question_id` (FK)
- `order_column` (integer): Sorting order specifically for this group.
- `is_required` (boolean): Whether answering this question is mandatory.
- `is_active` (boolean): Whether it's currently active for the group.
*(Unique constraint on `need_group_id` + `checklist_question_id`)*

### C. `need_checklist_answers` (Answers Table)
Stores the actual answers provided for a specific `Need`.
- `need_id` (FK)
- `checklist_question_id` (FK)
- `answer` (string): Accepts `yes`, `no`, or `skip`.
- `notes` (text, nullable): Optional text field for explanations.
*(Unique constraint on `need_id` + `checklist_question_id`)*

---

## 2. Backend Implementation (CRUD)

### Managing Questions (`ChecklistQuestionController`)
Provides endpoints to manage the central bank of questions (index, store, update, destroy), sorting them by `order_column`.

### Retrieving Answers (`NeedController@show`)
When loading a `Need` page, the backend eager-loads the relational structure:
```php
$need->load([
    // Load questions assigned to this need's group
    'needGroup.checklistQuestions' => function($query) {
        $query->where('need_group_checklist_question.is_active', true)
              ->orderBy('need_group_checklist_question.order_column');
    },
    // Load recorded answers
    'checklistAnswers'
]);
```

### Saving Answers (`NeedChecklistAnswerController@store`)
Accepts an array of answers, validates them (must be `yes`, `no`, or `skip`), and updates or creates the records in the `need_checklist_answers` table.

---

## 3. Frontend Implementation (React / Inertia)

The frontend is built using a reusable React component (`resources/js/components/needs/checklist-form.tsx`).

### State & Form Handling
It utilizes Inertia's `useForm` hook to initialize and manage the answers state array. The initial form merges the assigned questions (from `needGroup.checklistQuestions`) with any `existingAnswers`. By default, un-answered questions get marked as `'skip'`.

### Auto-Save Mechanism
The component features an internal debouncer for a seamless user experience. 
- It uses `useRef` to track `debounceTimer` and `isInitialMount`.
- Whenever `data.answers` changes, the `useEffect` hook waits `1000ms` (1 second) of inactivity before firing `performSave()`.
- `performSave` dispatches a silent `router.post` to `NeedChecklistAnswerController.store` passing `{ preserveScroll: true }` to keep the user uninterrupted.

### UI / UX
- Renders as a list of questions, maintaining consistent card layouts.
- Provides stylized `RadioGroup` options using custom labels and icons (`CheckCircle2`, `XCircle`, `HelpCircle`) for visual feedback.
- Includes a conditionally styled background for selected answers (e.g. green for "Ya", red for "Tidak").
- Supports dynamic `notes` using a `Textarea`.
- Shows a helpful empty state if a `NeedGroup` has no checklist questions assigned.
