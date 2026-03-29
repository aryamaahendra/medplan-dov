---
description: Create a reused dialog form using Inertia v3 <Form> pattern
---

This workflow describes how to create a standardized CRUD dialog form using Shadcn/UI Dialog, Inertia v3 `<Form>` component, and Laravel Wayfinder.

### 1. Define Props and Entity Interface
Create an interface for the dialog's props. Usually, the entity is optional (to support both Create and Edit).

```tsx
import type { User } from '@/types'; // Import your entity type

interface UserDialogProps {
  user?: User | null; // Null/undefined means "Create" mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

### 2. Dialog Component Structure
The basic skeleton uses `Dialog`, `DialogContent`, and `DialogHeader`.

```tsx
import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import UserController from '@/actions/App/Http/Controllers/UserController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  const isEditing = !!user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Update details for ${user.name}.` : 'Create a new user.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          // CRITICAL: key handles resets when switching entities/closing
          key={user?.id ?? 'new-item'}
          {...(isEditing
            ? UserController.update.form({ user: user.id })
            : UserController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(isEditing ? 'Updated!' : 'Created!');
          }}
          className="space-y-4 py-4"
        >
          {({ processing, errors }) => (
            <>
              {/* Form Fields Go Here */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user?.name ?? ''}
                  required
                />
                <InputError message={errors.name} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {isEditing ? 'Save Changes' : 'Create'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Key Best Practices
1.  **The `key` Prop**: Always put `key={entity?.id ?? 'new'}` on the `<Form>` component. This forces React to remount the form when the entity changes, clearing old inputs and errors automatically.
2.  **`defaultValue`**: Use `defaultValue` instead of `value` for most simple inputs. The `<Form>` component will track the changes via the `name` attribute.
3.  **Inertia Actions**: Use the auto-generated Wayfinder actions (e.g., `Controller.action.form()`) to bind the form effortlessly.
4.  **Hidden Inputs**: For many-to-one relationships, use a hidden input inside the form:
    `<input type="hidden" name="parent_id" value={parent.id} />`
5.  **Handling Nested Arrays**: Use name indexing like `targets[0][name]` for array values.

### 4. Implementation Checklist
- [ ] Determine if mode is Edit or Create (`!!entity`).
- [ ] Bind `<Form>` using `key` for state isolation.
- [ ] Connect actions using Wayfinder `.form()`.
- [ ] Use render props for `processing` and `errors`.
- [ ] Map errors to `<InputError message={errors.field} />`.
- [ ] Handle close/success with `onOpenChange(false)` and `toast`.
