import InputError from '@/components/input-error';
import { Editor } from '@/components/ui/editor';
import { Label } from '@/components/ui/label';

export function DetailFieldItem({
  label,
  placeholder,
  initialValue,
  error,
  onChange,
  children,
}: {
  label: string;
  placeholder: string;
  initialValue: string;
  error?: string;
  onChange: (val: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
        <Label className="mb-0">{label}</Label>
        {children && Array.isArray(children) ? children[0] : null}
      </div>

      <div className="">
        <Editor
          placeholder="Type here ..."
          value={initialValue}
          onChange={onChange}
          className="bg-muted/10"
        />
        <InputError message={error} className="mt-1" />
      </div>

      {children && Array.isArray(children) ? children[1] : children}

      <Label className="mb-0 border-b bg-muted/40 px-4 py-3 text-xs text-muted-foreground italic">
        *{placeholder}
      </Label>
    </div>
  );
}
