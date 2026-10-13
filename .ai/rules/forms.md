---
paths:
    - 'resources/js/**'
---

# Form Architecture & Standardized Field Rules

All form controls, inputs, and selection elements across `resources/js/**` must use the standardized form components from `@/components/form`. Never hand-assemble raw labels (`<Label>`), input controls (`<Input>`), and error paragraphs (`<InputError>`) in ad-hoc divs.

## Component Selection & Import

Always import from `@/components/form`:

| Component              | Use Case                                      | Notes                                                                                                                                    |
| ---------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `InputField`           | Text, number, email, tel, date, time inputs   | Single-line text input                                                                                                                   |
| `TextareaField`        | Multi-line text inputs                        | Textarea with content auto-sizing                                                                                                        |
| `SelectField`          | Single-select dropdowns                       | Accepts `options: FieldOption[]`, spans full width by default                                                                            |
| `RadioField`           | Mutually exclusive choices                    | Supports `variant="default" \| "description" \| "choice-card"`, plus `cols={1..12}` and `density`                                        |
| `CheckboxField`        | Single checkbox or multi-value checkbox group | Automatically selects single boolean vs group when `options` is supplied. Supports `variant="default" \| "description" \| "choice-card"` |
| `SingleCheckboxField`  | Dedicated single boolean checkbox             | Explicit single-checkbox API                                                                                                             |
| `CheckboxGroupField`   | Dedicated multi-value checkbox group          | Explicit group API with `value: string[]`                                                                                                |
| `SwitchField`          | Boolean toggle switches                       | Supports `variant="default" \| "description" \| "choice-card"`                                                                           |
| `PasswordField`        | Password inputs                               | Integrated show/hide visibility toggle                                                                                                   |
| `FormField`            | Generic type-safe convenience dispatcher      | Dispatches on `type="..."` (`text`, `select`, `radio`, `checkbox`, `switch`, `password`, `textarea`)                                     |
| `FieldWrapper`         | Custom input composition                      | Shell providing label, required `*`, info tooltip, description, and error bindings for non-standard controls                             |
| `FormGrid` & `FormCol` | Responsive form layout                        | Grid container (`cols={1..12}`, `density="compact" \| "dense" \| "default" \| "comfortable"`) and column spans                           |

## Standard Field Props Contract

Every field component accepts these uniform props:

- `label`: Human-readable label text.
- `required`: Renders accessible red asterisk (`*`) indicator.
- `info`: Informational tooltip text rendered beside label.
- `description`: Helper or guidance text placed below label or input.
- `error`: Validation error string (e.g. `errors.name` from Inertia `useForm`) or error array. Automatically binds `aria-invalid` and `aria-describedby`.
- `disabled`: Disables the control and dims the label state.

## Options Format

For `SelectField`, `RadioField`, and `CheckboxGroupField`, pass an array of `FieldOption`:

```ts
interface FieldOption {
    label: string;
    value: string;
    description?: string;
    disabled?: boolean;
}
```

## Selection Variants

`RadioField`, `CheckboxField`, and `SwitchField` support three standardized variants:

1. `variant="default"`: Standard clean layout for concise labels.
2. `variant="description"`: Displays `description` below each option label using `FieldContent`.
3. `variant="choice-card"`: Renders each option inside a clickable interactive card container (`FieldLabel > Field`).

## Layout Conventions with FormGrid

Structure form layouts using `<FormGrid>` and `<FormCol>` instead of custom flex percentages or arbitrary margin math:

```tsx
// ❌ BAD: manual assembly, raw primitives, repeated error divs
<div className="grid gap-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
  <InputError message={errors.email} />
</div>

// ✅ GOOD: standardized field component
<InputField
  label="Email"
  required
  value={data.email}
  onChange={(e) => setData('email', e.target.value)}
  error={errors.email}
/>

// ✅ GOOD: multi-column layout with FormGrid
<FormGrid cols={2} density="comfortable">
  <InputField
    label="Nama Lengkap"
    required
    value={data.name}
    onChange={(e) => setData('name', e.target.value)}
    error={errors.name}
  />
  <SelectField
    label="Unit Kerja"
    required
    options={unitOptions}
    value={data.unit_id}
    onValueChange={(val) => setData('unit_id', val)}
    error={errors.unit_id}
  />
</FormGrid>
```

## Interactive Showcase & Reference

View live interactive examples, states, variants, and code snippets at `/dev/form-components` (`resources/js/pages/dev/form-components.tsx`).
