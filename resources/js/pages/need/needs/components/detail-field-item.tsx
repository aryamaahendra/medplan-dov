import InputError from '@/components/input-error';
import { Editor } from '@/components/ui/editor';

export function DetailFieldItem({
  label,
  placeholder,
  description,
  initialValue,
  error,
  onChange,
  children,
}: {
  label: string;
  placeholder?: string;
  description?: string;
  initialValue: string;
  error?: string;
  onChange: (val: string) => void;
  children?: React.ReactNode;
}) {
  const helperText = description || placeholder;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold text-foreground">{label}</h3>
          {helperText && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>
        {children && Array.isArray(children) ? children[0] : null}
      </div>

      <div>
        <Editor
          placeholder="Ketik uraian di sini..."
          value={initialValue}
          onChange={onChange}
          className="bg-muted/10"
        />
        <InputError message={error} className="mt-1" />
      </div>

      {children && Array.isArray(children) ? children[1] : children}
    </div>
  );
}
