# Checklist Frontend Implementation Guide

This guide describes how to implement the checklist UI in the React frontend.

## 1. Overview

The checklist feature allows users to answer a set of predefined questions for a specific `Need`. The questions are managed in a "Question Bank" and can be assigned to different `NeedGroups`.

## 2. API Endpoints

- `GET /checklist-questions`: Fetch all available questions.
- `POST /needs/{need}/checklist-answers`: Save answers for a specific Need.

## 3. Data Structures

### ChecklistQuestion
```typescript
interface ChecklistQuestion {
    id: number;
    question: string;
    description: string | null;
    is_active: boolean;
    order_column: number;
}
```

### ChecklistAnswer
```typescript
type AnswerValue = 'yes' | 'no' | 'skip';

interface ChecklistAnswer {
    checklist_question_id: number;
    answer: AnswerValue;
    notes: string | null;
}
```

## 4. Implementation Steps

### Step 1: Create the Checklist Component
Create a reusable component that renders the list of questions with radio buttons (Yes, No, Skip) and a notes field.

```tsx
import { useForm } from '@inertiajs/react';

const ChecklistForm = ({ needId, questions, existingAnswers }) => {
    const { data, setData, post, processing, errors } = useForm({
        answers: questions.map(q => ({
            checklist_question_id: q.id,
            answer: existingAnswers.find(a => a.checklist_question_id === q.id)?.answer || 'skip',
            notes: existingAnswers.find(a => a.checklist_question_id === q.id)?.notes || '',
        }))
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('needs.checklist-answers.store', needId));
    };

    // Render logic...
};
```

### Step 2: Styling
Use consistent Tailwind classes for the table or list layout. Each row should include:
- The question text and description.
- A button group or radio group for 'Yes', 'No', and 'Skip'.
- A text input for 'Notes'.

### Step 3: Integration
Include this component in the `Need` edit or show page.

## 5. Best Practices
- **Auto-save (Optional)**: Consider using `router.post` on blur or change for a smoother experience.
- **Validation**: Ensure `is_required` (from the pivot table) is respected if implemented in the future.
- **Empty States**: Show a message if no questions are assigned to the group.
