import { UploadCloud } from 'lucide-react';
import type { MutableRefObject } from 'react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/formatters';
import type { Attachment } from '@/types';
import { AttachmentCard } from './attachment-card';
import { NewAttachmentItem } from './new-attachment-item';

const PREVIEWABLE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'svg',
  'pdf',
];

export function TechSpecExtra({
  fileInputRef,
  onFileChange,
  existingAttachments,
  newAttachments,
  newAttachmentNames,
  deletedIds,
  onToggleDelete,
  onRemoveNew,
  onNameChange,
}: {
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingAttachments: Attachment[];
  newAttachments: File[];
  newAttachmentNames: string[];
  deletedIds: number[];
  onToggleDelete: (id: number) => void;
  onRemoveNew: (index: number) => void;
  onNameChange: (index: number, name: string) => void;
}) {
  const hasAttachments =
    existingAttachments.length > 0 || newAttachments.length > 0;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="h-4 w-4" />
          Unggah Dokumen
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={onFileChange}
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        />
      </div>

      {hasAttachments && (
        <div className="grid grid-cols-1 gap-2 border-b p-2 md:grid-cols-2">
          {existingAttachments.map((att) => (
            <AttachmentCard
              key={att.id}
              attachment={att}
              formatFileSize={formatFileSize}
              previewableExtensions={PREVIEWABLE_EXTENSIONS}
              isDeleted={deletedIds.includes(att.id)}
              onToggleDelete={onToggleDelete}
            />
          ))}

          {newAttachments.map((file, index) => (
            <NewAttachmentItem
              key={index}
              file={file}
              index={index}
              name={newAttachmentNames[index]}
              onNameChange={onNameChange}
              onRemove={onRemoveNew}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      )}
    </>
  );
}
