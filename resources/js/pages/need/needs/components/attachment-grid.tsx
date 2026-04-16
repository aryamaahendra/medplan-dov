import { AttachmentCard } from './attachment-card';
import type { AttachmentLayoutProps } from './attachment-table';

export function AttachmentGrid({
  attachments,
  allowDelete,
  onPreview,
  onDelete,
  formatFileSize,
  previewableExtensions,
}: AttachmentLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {attachments.map((attachment) => (
        <AttachmentCard
          key={attachment.id}
          attachment={attachment}
          formatFileSize={formatFileSize}
          previewableExtensions={previewableExtensions}
          onPreview={onPreview}
          onDelete={onDelete}
          allowDelete={allowDelete}
        />
      ))}
    </div>
  );
}
