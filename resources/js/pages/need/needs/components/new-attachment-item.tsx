import { RiDeleteBinLine, RiUploadLine } from '@remixicon/react';
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
        <RiUploadLine className="h-4 w-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Input
          value={name}
          onChange={(e) => onNameChange(index, e.target.value)}
          className="border-none bg-transparent p-0 shadow-none focus-visible:ring-1"
        />
        <p className="text-xss leading-none text-muted-foreground uppercase">
          {file.name.split('.').pop()} • {formatFileSize(file.size)}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive"
        onClick={() => onRemove(index)}
      >
        <RiDeleteBinLine />
      </Button>
    </div>
  );
}
