import { Trash2Icon, UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewAttachmentItemProps {
  file: File;
  index: number;
  name: string;
  onNameChange: (index: number, name: string) => void;
  onRemove: (index: number) => void;
  formatFileSize: (bytes: number) => string;
}

export function NewAttachmentItem({
  file,
  index,
  name,
  onNameChange,
  onRemove,
  formatFileSize,
}: NewAttachmentItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
      <div className="flex shrink-0 items-center justify-center">
        <UploadIcon className="h-4 w-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Input
          value={name}
          onChange={(e) => onNameChange(index, e.target.value)}
          className="h-7 h-auto border-none bg-transparent p-0 py-0 text-[13px] font-medium shadow-none focus-visible:ring-0 focus-visible:ring-1"
        />
        <p className="text-[10px] leading-none text-muted-foreground uppercase">
          {file.name.split('.').pop()} • {formatFileSize(file.size)}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive"
        onClick={() => onRemove(index)}
      >
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </div>
  );
}
