import {
  DownloadIcon,
  EyeIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ActionDropdown } from '@/components/action-dropdown';
import type { ActionItem } from '@/components/action-dropdown';
import { cn } from '@/lib/utils';
import type { Attachment } from '../columns';

interface AttachmentCardProps {
  attachment: Attachment;
  formatFileSize: (bytes: number) => string;
  previewableExtensions: string[];
  onPreview?: (attachment: Attachment) => void;
  onDelete?: (attachment: Attachment) => void;
  isDeleted?: boolean;
  onToggleDelete?: (id: number) => void;
  allowDelete?: boolean;
  className?: string;
}

export function AttachmentCard({
  attachment,
  formatFileSize,
  previewableExtensions,
  onPreview,
  onDelete,
  isDeleted,
  onToggleDelete,
  allowDelete = true,
  className,
}: AttachmentCardProps) {
  const isPreviewable = previewableExtensions.includes(
    attachment.extension?.toLowerCase() || '',
  );

  const actions: (ActionItem | 'separator')[] = [
    ...(isPreviewable
      ? [
          {
            label: 'Pratinjau',
            icon: EyeIcon,
            onClick: onPreview ? () => onPreview(attachment) : undefined,
            href: !onPreview
              ? NeedAttachmentController.view.url({ attachment: attachment.id })
              : undefined,
          },
        ]
      : []),
    {
      label: 'Unduh',
      icon: DownloadIcon,
      href: NeedAttachmentController.download.url({
        attachment: attachment.id,
      }),
    },
  ];

  if (onToggleDelete) {
    actions.push('separator');
    actions.push({
      label: isDeleted ? 'Batal Hapus' : 'Hapus',
      icon: isDeleted ? XIcon : Trash2Icon,
      variant: 'destructive',
      onClick: () => onToggleDelete(attachment.id),
    });
  } else if (allowDelete && onDelete) {
    actions.push('separator');
    actions.push({
      label: 'Hapus',
      icon: Trash2Icon,
      variant: 'destructive',
      onClick: () => onDelete(attachment),
    });
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg border bg-card p-2.5 transition-colors hover:bg-muted/50',
        isDeleted && 'bg-muted/50 line-through opacity-50',
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-center">
        <UploadIcon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] leading-tight font-medium">
          {attachment.display_name}
        </p>
        <p className="mt-0.5 text-[10px] leading-none text-muted-foreground uppercase">
          {attachment.extension || 'FILE'} •{' '}
          {formatFileSize(attachment.file_size)}
        </p>
      </div>
      <ActionDropdown actions={actions as any} />
    </div>
  );
}
